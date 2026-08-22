import rateLimit from 'express-rate-limit';

/**
 * Rate Limiter for Login Attempts
 * Limits each IP to 20 requests per 15-minute window to prevent brute force.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts
  message: { error: 'Too many login attempts from this IP. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});

/**
 * Rate Limiter for Manual Dispute Intake & AI Drafts
 * Limits each IP to 20 requests per 15-minute window to control Gemini API spend and abuse.
 */
export const manualDisputeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests
  message: { error: 'Too many manual dispute submissions. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});
