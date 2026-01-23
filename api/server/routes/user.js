const express = require('express');
const {
  updateUserPluginsController,
  resendVerificationController,
  getTermsStatusController,
  acceptTermsController,
  verifyEmailController,
  deleteUserController,
  getUserController,
  lookupUserController,
  getUsersListController,
} = require('~/server/controllers/UserController');
const { requireJwtAuth, canDeleteAccount, verifyEmailLimiter } = require('~/server/middleware');
const userSearchLimiter = require('~/server/middleware/limiters/userSearchLimiter');

const router = express.Router();

router.get('/', requireJwtAuth, getUserController);
// Apply rate limiting to search endpoints to prevent user enumeration and ReDoS attacks
router.get('/list', requireJwtAuth, userSearchLimiter, getUsersListController);
router.get('/lookup', requireJwtAuth, userSearchLimiter, lookupUserController);
router.get('/terms', requireJwtAuth, getTermsStatusController);
router.post('/terms/accept', requireJwtAuth, acceptTermsController);
router.post('/plugins', requireJwtAuth, updateUserPluginsController);
router.delete('/delete', requireJwtAuth, canDeleteAccount, deleteUserController);
router.post('/verify', verifyEmailController);
router.post('/verify/resend', verifyEmailLimiter, resendVerificationController);

module.exports = router;
