const getTimestamp = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

const logger = {
  info: (message, ...args) => {
    console.log(`${colors.green}[${getTimestamp()}] [INFO] ${message}${colors.reset}`, ...args);
  },
  warn: (message, ...args) => {
    console.log(`${colors.yellow}[${getTimestamp()}] [WARN] ${message}${colors.reset}`, ...args);
  },
  error: (message, ...args) => {
    console.error(`${colors.red}[${getTimestamp()}] [ERROR] ${message}${colors.reset}`, ...args);
  }
};

module.exports = logger;
