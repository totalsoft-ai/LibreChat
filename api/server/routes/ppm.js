const { Router } = require('express');
const { CacheKeys } = require('librechat-data-provider');
const { logger } = require('@librechat/data-schemas');
const { getMCPManager, getFlowStateManager } = require('~/config');
const { findToken, updateToken, createToken } = require('~/models');
const { requireJwtAuth } = require('~/server/middleware');
const { getLogStores } = require('~/cache');

const router = Router();

const PPM_SERVER = process.env.PPM_MCP_SERVER_NAME || 'ppm-timesheet';

/** Extracts raw text from MCP tool response, stripping the "[Today: ...]" prefix. */
function extractText(toolResponse) {
  const content = toolResponse?.[0];
  let text = '';

  if (typeof content === 'string') {
    text = content;
  } else if (Array.isArray(content)) {
    text = content
      .filter((c) => c.type === 'text')
      .map((c) => c.text ?? '')
      .join('');
  }

  const separatorIdx = text.indexOf('\n\n');
  if (separatorIdx === -1) {
    logger.warn('[PPM] extractText: expected "\\n\\n" separator not found in MCP response');
  }
  return separatorIdx !== -1 ? text.slice(separatorIdx + 2) : text;
}

/** Parses project list from PPM formatted text (bullet points "  • CODE"). */
function parseProjects(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('•'))
    .map((line) => {
      const code = line.replace(/^•\s*/, '').trim();
      return { code, name: code };
    });
}

/** Parses task list from PPM formatted text. Expected format: "  • Task Name (ID: 2)" */
function parseTasks(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('•'))
    .map((line, idx) => {
      const raw = line.replace(/^•\s*/, '').trim();
      const idMatch = raw.match(/\(ID:\s*(\d+)\)\s*$/);
      const id = idMatch ? parseInt(idMatch[1], 10) : idx + 1;
      const name = raw.replace(/\s*\(ID:\s*\d+\)\s*$/, '').trim();
      return { id, name };
    });
}

async function callPPMTool(user, toolName, toolArguments, authorizationHeader) {
  const flowsCache = getLogStores(CacheKeys.FLOWS);
  const flowManager = getFlowStateManager(flowsCache);
  const mcpManager = getMCPManager(user.id);

  return mcpManager.callTool({
    serverName: PPM_SERVER,
    toolName,
    provider: 'openai',
    toolArguments,
    user,
    authorizationHeader,
    tokenMethods: { findToken, createToken, updateToken },
    flowManager,
  });
}

router.get('/projects', requireJwtAuth, async (req, res) => {
  try {
    const result = await callPPMTool(req.user, 'get_user_projects', {}, req.headers.authorization);
    const text = extractText(result);
    const projects = parseProjects(text);
    logger.debug('[PPM] get_user_projects parsed count:', projects.length);
    res.json([{ code: 'administrativ', name: 'Administrative' }, ...projects]);
  } catch (error) {
    logger.error('[PPM] get_user_projects failed', { message: error.message });
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.get('/tasks', requireJwtAuth, async (req, res) => {
  try {
    const projectCode = String(req.query.projectCode ?? '').slice(0, 100);
    const args = projectCode ? { project_code: projectCode } : {};
    const result = await callPPMTool(req.user, 'get_user_tasks', args, req.headers.authorization);
    const text = extractText(result);
    logger.debug('[PPM] get_user_tasks text sample:', text.slice(0, 200));
    const tasks = parseTasks(text);
    res.json(tasks);
  } catch (error) {
    logger.error('[PPM] get_user_tasks failed', { message: error.message });
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

module.exports = router;
