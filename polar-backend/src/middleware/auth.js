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

    const { data: profile } = await supabase
      .from('users')
      .select('role, name')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email,
      role: profile?.role || 'PUBLIC',
      name: profile?.name || 'User'
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
