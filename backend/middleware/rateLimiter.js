import rateLimit from "express-rate-limit";


export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 10, 
  message: {
    success: false,
    message: "Too many AI requests, please slow down",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 25, 
  message: {
    success: false,
    message: "Too many login attempts, please try again later",
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

export default { apiLimiter, aiLimiter, authLimiter };
