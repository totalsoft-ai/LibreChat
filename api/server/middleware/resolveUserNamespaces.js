const { Pool } = require('pg');
const { logger } = require('~/config');

const pool = new Pool({ connectionString: process.env.PG_CONNECTION_STRING });

/**
 * Middleware: interogheaza PostgreSQL si populeaza req.user.namespaces
 * pe baza emailului userului autentificat (OIDC).
 *
 * Traseul: employees.email -> departments -> department_namespaces
 */
async function resolveUserNamespaces(req, res, next) {
  try {
    const email = req.user?.email;
    if (!email) return next();

    const result = await pool.query(
      `SELECT dn.namespaces
       FROM employees e
       JOIN departments d ON d.id = e.department_id
       JOIN department_namespaces dn ON dn.department_id = d.id
       WHERE e.email = $1`,
      [email],
    );

    const allNamespaces = [...new Set(result.rows.flatMap((r) => r.namespaces))];
    req.user.namespaces = allNamespaces;

    logger.debug(`[resolveUserNamespaces] email=${email} namespaces=${JSON.stringify(allNamespaces)}`);
  } catch (err) {
    logger.error('[resolveUserNamespaces] PG query failed:', err.message);
  }
  next();
}

module.exports = { resolveUserNamespaces };
