import jwt from 'jsonwebtoken';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'change-me-in-production';

export function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Admin token required' });
    }

    const payload = jwt.verify(token, ADMIN_JWT_SECRET);
    if (payload?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access denied' });
    }

    req.admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired admin token' });
  }
}

export function issueAdminToken(payload) {
  return jwt.sign(payload, ADMIN_JWT_SECRET, { expiresIn: '8h' });
}
