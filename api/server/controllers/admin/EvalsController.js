const {
  queryBaselines,
  getFilterOptions,
  getModelScores: queryModelScores,
} = require('~/server/services/PostgresEvalsService');

const handleError = (res, error, label) => {
  console.error(`[EvalsController] ${label}:`, error.message);
  if (error.message.includes('not available') || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    return res.status(503).json({ error: 'Evals database not available', details: error.message });
  }
  return res.status(500).json({ error: `Failed to ${label}` });
};

const getBaselines = async (req, res) => {
  try {
    const { page = '1', pageSize = '20', endpoint, category, agentModel, repo, branch, testName, fromDate, toDate } = req.query;
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedPageSize = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));

    const { data, total } = await queryBaselines({ page: parsedPage, pageSize: parsedPageSize, endpoint, category, agentModel, repo, branch, testName, fromDate, toDate });

    return res.json({
      data,
      pagination: { page: parsedPage, pageSize: parsedPageSize, total, totalPages: Math.ceil(total / parsedPageSize) },
    });
  } catch (error) {
    return handleError(res, error, 'fetch baselines');
  }
};

const getFilters = async (req, res) => {
  try {
    return res.json(await getFilterOptions());
  } catch (error) {
    return handleError(res, error, 'fetch filters');
  }
};

const getModelScores = async (req, res) => {
  try {
    const { endpoint, category } = req.query;
    return res.json(await queryModelScores({ endpoint, category }));
  } catch (error) {
    return handleError(res, error, 'fetch model scores');
  }
};

module.exports = { getBaselines, getFilters, getModelScores };
