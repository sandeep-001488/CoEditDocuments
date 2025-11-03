const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
};

const getTimestamp = () => {
  return new Date().toISOString();
};

export const logger = {
  info: (message, data = null) => {
    console.log(
      `${colors.blue}[INFO]${colors.reset} ${colors.bright}${getTimestamp()}${
        colors.reset
      } - ${message}`,
      data ? data : ""
    );
  },

  success: (message, data = null) => {
    console.log(
      `${colors.green}[SUCCESS]${colors.reset} ${
        colors.bright
      }${getTimestamp()}${colors.reset} - ${message}`,
      data ? data : ""
    );
  },

  warn: (message, data = null) => {
    console.warn(
      `${colors.yellow}[WARN]${colors.reset} ${colors.bright}${getTimestamp()}${
        colors.reset
      } - ${message}`,
      data ? data : ""
    );
  },

  error: (message, error = null) => {
    console.error(
      `${colors.red}[ERROR]${colors.reset} ${colors.bright}${getTimestamp()}${
        colors.reset
      } - ${message}`,
      error ? error : ""
    );
  },

  debug: (message, data = null) => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `${colors.magenta}[DEBUG]${colors.reset} ${
          colors.bright
        }${getTimestamp()}${colors.reset} - ${message}`,
        data ? data : ""
      );
    }
  },
};

export default logger;