// middleware/auth.js
// Simplified auth middleware for local development.
// Prefer passing `x-mock-user-id` and optional `x-mock-user-role` headers to simulate an authenticated user.
module.exports = (req, res, next) => {
  const mockId = req.headers['x-mock-user-id'];
  const mockRole = req.headers['x-mock-user-role'];
  if (mockId) {
    req.user = { id: mockId, role: mockRole || null };
  }
  // If no mock headers provided, leave req.user undefined (endpoints may fallback to headers)
  next();
};
