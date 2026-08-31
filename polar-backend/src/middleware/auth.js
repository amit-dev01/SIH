const supabase = require('../config/supabase');
const apiResponse = require('../utils/apiResponse');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return apiResponse.error(res, 'Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return apiResponse.error(res, 'Authentication required', 401);
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data || !data.user) {
      return apiResponse.error(res, 'Invalid token', 401);
    }

    const user = data.user;

    // Fetch user profile from public.users table
    let { data: profile } = await supabase
      .from('users')
      .select('role, name')
      .eq('id', user.id)
      .maybeSingle();

    const role = profile?.role || user.user_metadata?.role || user.app_metadata?.role || 'PUBLIC';
    const name = profile?.name || user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

    // Auto-sync profile to public.users if missing
    if (!profile) {
      try {
        await supabase.from('users').upsert({
          id: user.id,
          email: user.email,
          name,
          role
        }, { onConflict: 'id' });
      } catch (_) {
        // Silently continue if upsert fails
      }
    }

    req.user = {
      id: user.id,
      email: user.email,
      role,
      name
    };

    next();
  } catch (err) {
    return apiResponse.error(res, 'Authentication failed', 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return apiResponse.error(res, 'Insufficient permissions', 403);
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
