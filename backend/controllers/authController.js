import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import prisma from '../config/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in environment variables.');
}

const isProd = process.env.NODE_ENV === 'production';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge: 2 * 60 * 60 * 1000,
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email ? email.toLowerCase().trim() : '';

    if (!cleanEmail || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const user = await prisma.user.findFirst({
      where: { email: cleanEmail, role: { in: ['admin', 'superadmin'] } },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or unauthorized account.' });
    }

    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const remainingMins = Math.ceil((new Date(user.lockedUntil) - new Date()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account temporarily locked. Try again in ${remainingMins} minute(s).`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const lockoutDate = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : user.lockedUntil;

      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: attempts, lockedUntil: lockoutDate },
      });

      const msg = attempts >= 5
        ? 'Account locked for 15 minutes due to multiple failed login attempts.'
        : `Invalid password. ${Math.max(0, 5 - attempts)} attempt(s) remaining.`;
      return res.status(401).json({ success: false, message: msg });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    if (user.tempPassword) {
      // Force password change before anything else — don't let them skip this
      const changeToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role, step: 'password_change_required' },
        JWT_SECRET, { expiresIn: '15m' }
      );
      return res.status(200).json({
        success: true,
        requiresPasswordChange: true,
        changeToken,
        message: 'You must set a new password before continuing.',
      });
    }

    if (!user.mfaEnabled) {
      const setupToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role, step: 'mfa_setup' },
        JWT_SECRET, { expiresIn: '15m' }
      );
      return res.status(200).json({ success: true, requiresMfaSetup: true, setupToken });
    }

    const tempToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, step: 'mfa_pending' },
      JWT_SECRET, { expiresIn: '10m' }
    );
    return res.status(200).json({ success: true, requiresMfaCode: true, tempToken });
  } catch (error) {
    console.error('Error during admin login:', error);
    return res.status(500).json({ success: false, message: 'Authentication service temporarily unavailable.' });
  }
};

export const adminChangeTempPassword = async (req, res) => {
  try {
    const { changeToken, newPassword } = req.body;
    if (!changeToken || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }

    const decoded = jwt.verify(changeToken, JWT_SECRET);
    if (decoded.step !== 'password_change_required') {
      return res.status(403).json({ success: false, message: 'Invalid token step.' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashed, tempPassword: false },
    });

    // Re-run the normal post-password flow
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user.mfaEnabled) {
      const setupToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role, step: 'mfa_setup' },
        JWT_SECRET, { expiresIn: '15m' }
      );
      return res.status(200).json({ success: true, requiresMfaSetup: true, setupToken });
    }

    const tempToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, step: 'mfa_pending' },
      JWT_SECRET, { expiresIn: '10m' }
    );
    return res.status(200).json({ success: true, requiresMfaCode: true, tempToken });
  } catch (error) {
    console.error('Error changing temp password:', error);
    return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
  }
};

export const adminMfaSetup = async (req, res) => {
  try {
    const { setupToken } = req.body;
    if (!setupToken) return res.status(401).json({ success: false, message: 'Setup token required.' });

    const decoded = jwt.verify(setupToken, JWT_SECRET);
    if (decoded.step !== 'mfa_setup') {
      return res.status(403).json({ success: false, message: 'Invalid token step.' });
    }

    const secret = speakeasy.generateSecret({
      name: `Penguin Menswear (${decoded.email})`,
      issuer: "Penguin Men's Section Atelier",
      length: 20,
    });

    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);
    await prisma.user.update({ where: { id: decoded.id }, data: { mfaSecret: secret.base32 } });

    return res.status(200).json({
      success: true,
      qrCodeImage: qrCodeDataUrl,
      manualEntryKey: secret.base32,
      message: 'Scan the QR code with Google Authenticator or 1Password, then submit the 6-digit code.',
    });
  } catch (error) {
    console.error('Error in MFA setup:', error);
    return res.status(401).json({ success: false, message: 'Setup session expired. Please log in again.' });
  }
};

export const adminMfaVerifySetup = async (req, res) => {
  try {
    const { setupToken, token: userCode } = req.body;
    if (!setupToken || !userCode) {
      return res.status(400).json({ success: false, message: 'Both setup token and code are required.' });
    }

    const decoded = jwt.verify(setupToken, JWT_SECRET);
    if (decoded.step !== 'mfa_setup') {
      return res.status(403).json({ success: false, message: 'Invalid token step.' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || !user.mfaSecret) {
      return res.status(400).json({ success: false, message: 'MFA setup expired. Please restart login.' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret, encoding: 'base32', token: userCode.trim(), window: 1,
    });
    if (!verified) {
      return res.status(400).json({ success: false, message: 'Invalid code. Check your device clock sync.' });
    }

    const rawBackupCodes = [];
    const hashedBackupCodes = [];
    for (let i = 0; i < 8; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      rawBackupCodes.push(code);
      hashedBackupCodes.push(await bcrypt.hash(code, 10));
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { mfaEnabled: true, backupCodes: hashedBackupCodes },
    });

    const sessionToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, step: 'authenticated' },
      JWT_SECRET, { expiresIn: '2h' }
    );

    res.cookie('admin_session', sessionToken, COOKIE_OPTS);

    return res.status(200).json({
      success: true,
      message: '2FA successfully activated on your account!',
      role: user.role,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      backupCodes: rawBackupCodes,
    });
  } catch (error) {
    console.error('Error verifying MFA setup:', error);
    return res.status(400).json({ success: false, message: 'Setup verification failed. Please restart login.' });
  }
};

export const adminLoginVerifyMfa = async (req, res) => {
  try {
    const { tempToken, token: userCode, isBackupCode } = req.body;
    if (!tempToken || !userCode) {
      return res.status(400).json({ success: false, message: 'Please log in again.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, JWT_SECRET);
      if (decoded.step !== 'mfa_pending') throw new Error('Wrong token step');
    } catch {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Account not found. Please log in again.' });
    }

    let authenticated = false;

    if (isBackupCode) {
      const cleanCode = userCode.trim().toUpperCase();
      const existingCodes = Array.isArray(user.backupCodes) ? user.backupCodes : [];
      let matchedIndex = -1;
      for (let i = 0; i < existingCodes.length; i++) {
        if (await bcrypt.compare(cleanCode, existingCodes[i])) { matchedIndex = i; break; }
      }
      if (matchedIndex !== -1) {
        authenticated = true;
        const updatedCodes = [...existingCodes];
        updatedCodes.splice(matchedIndex, 1);
        await prisma.user.update({ where: { id: user.id }, data: { backupCodes: updatedCodes } });
      }
    } else if (user.mfaSecret) {
      authenticated = speakeasy.totp.verify({
        secret: user.mfaSecret, encoding: 'base32', token: userCode.trim(), window: 1,
      });
    }

    if (!authenticated) {
      return res.status(401).json({ success: false, message: 'Invalid code. Please try again.' });
    }

    const sessionToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, step: 'authenticated' },
      JWT_SECRET, { expiresIn: '2h' }
    );

    res.cookie('admin_session', sessionToken, COOKIE_OPTS);

    return res.status(200).json({
      success: true,
      role: user.role,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Error verifying MFA login code:', error);
    return res.status(401).json({ success: false, message: 'Verification failed. Please re-login.' });
  }
};

export const adminLogout = async (req, res) => {
  res.clearCookie('admin_session', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

export const getAdminProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role },
  });
};

export const createAdminUser = async (req, res) => {
  try {
    const { name, email } = req.body; // role NOT accepted from client — always 'admin'
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid admin email required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return res.status(400).json({ success: false, message: `An administrator with email ${cleanEmail} already exists.` });
    }

    const tempPassword = crypto.randomBytes(6).toString('hex') + '@' + Math.floor(10 + Math.random() * 90);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const newAdmin = await prisma.user.create({
      data: {
        name: name || 'Store Admin',
        email: cleanEmail,
        password: hashedPassword,
        role: 'admin', // superadmin accounts are only ever created via the CLI script
        mfaEnabled: false,
        tempPassword: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'New Store Admin created successfully. Provide temporary credentials.',
      admin: { id: newAdmin.id, name: newAdmin.name, email: newAdmin.email, role: newAdmin.role },
      tempPassword,
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return res.status(500).json({ success: false, message: 'Failed to create admin.' });
  }
};

export const listAdminUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: { in: ['admin', 'superadmin'] } },
      select: {
        id: true, name: true, email: true, role: true,
        mfaEnabled: true, tempPassword: true, createdAt: true, lockedUntil: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Error listing admin users:', error);
    return res.status(500).json({ success: false, message: 'Failed to list admins.' });
  }
};

export const updateAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    // NOTE: role and mfaEnabled are intentionally NOT editable here.
    // Role changes should never happen via a generic update endpoint;
    // use resetAdminMfa to force MFA re-enrollment instead of toggling it directly.

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Admin user not found.' });
    }
    if (user.role === 'superadmin') {
      return res.status(403).json({ success: false, message: 'Superadmin accounts cannot be edited via this endpoint.' });
    }

    const updateData = {};
    if (name && name.trim()) updateData.name = name.trim();
    if (email && email.includes('@')) updateData.email = email.toLowerCase().trim();
    if (password && password.trim().length >= 8) {
      updateData.password = await bcrypt.hash(password.trim(), 12);
      updateData.tempPassword = false;
    }
    updateData.failedLoginAttempts = 0;
    updateData.lockedUntil = null;

    const updated = await prisma.user.update({ where: { id: user.id }, data: updateData });

    return res.status(200).json({
      success: true,
      message: `Admin '${updated.email}' updated successfully.`,
      data: { id: updated.id, name: updated.name, email: updated.email, role: updated.role },
    });
  } catch (error) {
    console.error('Error updating admin user:', error);
    return res.status(500).json({ success: false, message: 'Failed to update admin.' });
  }
};

export const resetAdminMfa = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Admin user not found.' });
    }
    if (user.role === 'superadmin') {
      return res.status(403).json({ success: false, message: 'Cannot reset MFA on a superadmin account via this endpoint.' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { mfaEnabled: false, mfaSecret: null, backupCodes: [] },
    });

    return res.status(200).json({
      success: true,
      message: `MFA reset for ${user.email}. They will be prompted to scan a new QR code on next login.`,
    });
  } catch (error) {
    console.error('Error resetting admin MFA:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset MFA.' });
  }
};

export const resetAdminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Admin user not found.' });
    }
    if (user.role === 'superadmin') {
      return res.status(403).json({ success: false, message: 'Cannot reset password on a superadmin account via this endpoint.' });
    }

    const tempPassword = crypto.randomBytes(6).toString('hex') + '@' + Math.floor(10 + Math.random() * 90);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, tempPassword: true, failedLoginAttempts: 0, lockedUntil: null },
    });

    return res.status(200).json({ success: true, message: `Password reset for ${user.email}.`, tempPassword });
  } catch (error) {
    console.error('Error resetting admin password:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
};

export const deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Admin user not found.' });
    }
    if (user.role === 'superadmin') {
      return res.status(403).json({ success: false, message: 'Cannot delete a superadmin account.' });
    }

    await prisma.user.delete({ where: { id: user.id } });
    return res.status(200).json({ success: true, message: `Admin user ${user.email} was permanently deleted.` });
  } catch (error) {
    console.error('Error deleting admin user:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete admin.' });
  }
};
