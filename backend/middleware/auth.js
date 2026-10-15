import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in environment variables.');
}

export const protectAdmin = async (req, res, next) => {
  const token = req.cookies?.admin_session || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authorization required. No active session.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.step !== 'authenticated') {
      return res.status(403).json({ success: false, message: 'Two-factor verification incomplete.' });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!dbUser || !['admin', 'superadmin'].includes(dbUser.role)) {
      return res.status(403).json({ success: false, message: 'Access denied: Admin privileges required.' });
    }

    req.user = { ...dbUser, _id: dbUser.id };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid. Please re-authenticate.' });
  }
};

export const requireSuperAdmin = (req, res, next) => {
  if (req.user?.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Access restricted: Superadmin authorization required to perform this action.',
    });
  }
  next();
};
