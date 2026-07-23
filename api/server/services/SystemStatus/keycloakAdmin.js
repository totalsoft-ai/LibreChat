const axios = require('axios');
const { logger } = require('@librechat/data-schemas');

// Ported from ticket-classifier's keycloak_admin_service.py: resolves status
// alert recipients from a Keycloak realm role via the Admin REST API,
// authenticated with a service-account client (client_credentials grant) —
// reuses the same KEYCLOAK_ADMIN_* credentials this deployment already
// provisions, just not yet consumed anywhere in this codebase.
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const REQUEST_TIMEOUT_MS = 5000;
const TOKEN_EXPIRY_MARGIN_MS = 5000;

let cachedToken = null; // { accessToken, expiresAt }

/**
 * KEYCLOAK_ADMIN_URL is the realm-scoped issuer (e.g.
 * https://host/realms/my-realm) — same shape as OPENID_ISSUER. The Admin
 * REST API lives at the server root under /admin/realms/{realm}/..., so the
 * realm suffix is stripped back off here.
 */
function getRealmConfig() {
  const issuerUrl = (process.env.KEYCLOAK_ADMIN_URL || '').replace(/\/$/, '');
  const realm = process.env.KEYCLOAK_REALM;
  if (!issuerUrl || !realm) {
    return null;
  }
  const realmSuffix = `/realms/${realm}`;
  const serverRoot = issuerUrl.endsWith(realmSuffix)
    ? issuerUrl.slice(0, -realmSuffix.length)
    : issuerUrl;
  return { realm, serverRoot, tokenUrl: `${issuerUrl}/protocol/openid-connect/token` };
}

async function getServiceAccountToken(realmConfig) {
  if (cachedToken && cachedToken.expiresAt > Date.now() + TOKEN_EXPIRY_MARGIN_MS) {
    return cachedToken.accessToken;
  }
  const clientId = process.env.KEYCLOAK_ADMIN_CLIENT_ID;
  const clientSecret = process.env.KEYCLOAK_ADMIN_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    logger.warn('[SystemStatus] Keycloak Service Account credentials not configured');
    return null;
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });
  const res = await axios.post(realmConfig.tokenUrl, body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: REQUEST_TIMEOUT_MS,
  });
  cachedToken = {
    accessToken: res.data.access_token,
    expiresAt: Date.now() + (res.data.expires_in || 60) * 1000,
  };
  return cachedToken.accessToken;
}

function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_REGEX.test(email);
}

/** Valid emails of users holding the given Keycloak realm role. */
async function getEmailsByRealmRole(roleName) {
  const realmConfig = getRealmConfig();
  if (!realmConfig) {
    logger.warn('[SystemStatus] Keycloak not configured (KEYCLOAK_ADMIN_URL/KEYCLOAK_REALM)');
    return [];
  }

  let token;
  try {
    token = await getServiceAccountToken(realmConfig);
  } catch (error) {
    logger.error('[SystemStatus] Failed to obtain a Keycloak service-account token:', error);
    return [];
  }
  if (!token) {
    return [];
  }

  try {
    const url = `${realmConfig.serverRoot}/admin/realms/${realmConfig.realm}/roles/${encodeURIComponent(roleName)}/users`;
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: REQUEST_TIMEOUT_MS,
    });
    const users = Array.isArray(res.data) ? res.data : [];
    const emails = users.map((user) => user.email).filter(isValidEmail);
    logger.info(`[SystemStatus] Found ${emails.length} valid email(s) for Keycloak role '${roleName}'`);
    return emails;
  } catch (error) {
    logger.error(`[SystemStatus] Failed to fetch users with Keycloak role '${roleName}':`, error);
    return [];
  }
}

module.exports = { getEmailsByRealmRole };
