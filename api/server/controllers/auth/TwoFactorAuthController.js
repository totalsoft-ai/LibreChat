const jwt = require('jsonwebtoken');
const { logger } = require('@librechat/data-schemas');
const {
  verifyTOTP,
  getTOTPSecret,
  verifyBackupCode,
} = require('~/server/services/twoFactorService');
const { setAuthTokens } = require('~/server/services/AuthService');
const { getUserById } = require('~/models');

/**
 * Verifies the 2FA code during login using a temporary token.
 */
const verify2FAWithTempToken = async (req, res) => {
  try {
    const { tempToken, token, backupCode } = req.body;
    if (!tempToken) {
      return res.status(400).json({ message: 'Missing temporary token' });
    }

    // Use separate secret for 2FA tokens for security isolation
    const twoFASecret = process.env.JWT_2FA_SECRET || process.env.JWT_SECRET;

    if (!process.env.JWT_2FA_SECRET) {
      logger.warn(
        '[verify2FAWithTempToken] JWT_2FA_SECRET not set. Using JWT_SECRET as fallback. Please set JWT_2FA_SECRET for better security.',
      );
    }

    let payload;
    try {
      payload = jwt.verify(tempToken, twoFASecret);

      // Verify that the token has the correct purpose
      if (payload.purpose !== '2fa-verification') {
        logger.warn('[verify2FAWithTempToken] Token purpose mismatch');
        return res.status(401).json({ message: 'Invalid temporary token' });
      }
    } catch (err) {
      logger.error('Failed to verify temporary token:', err);
      return res.status(401).json({ message: 'Invalid or expired temporary token' });
    }

    const user = await getUserById(payload.userId, '+totpSecret +backupCodes');
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is not enabled for this user' });
    }

    const secret = await getTOTPSecret(user.totpSecret);
    let isVerified = false;
    if (token) {
      isVerified = await verifyTOTP(secret, token);
    } else if (backupCode) {
      isVerified = await verifyBackupCode({ user, backupCode });
    }

    if (!isVerified) {
      return res.status(401).json({ message: 'Invalid 2FA code or backup code' });
    }

    const userData = user.toObject ? user.toObject() : { ...user };
    delete userData.__v;
    delete userData.password;
    delete userData.totpSecret;
    delete userData.backupCodes;
    userData.id = user._id.toString();

    const authToken = await setAuthTokens(user._id, res);
    return res.status(200).json({ token: authToken, user: userData });
  } catch (err) {
    logger.error('[verify2FAWithTempToken]', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = { verify2FAWithTempToken };
