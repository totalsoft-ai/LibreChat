const mongoose = require('mongoose');
const { logger } = require('@librechat/data-schemas');

function getPeriodConfig(period, now) {
  if (period === 'weekly') {
    const matchDate = new Date(now);
    matchDate.setDate(matchDate.getDate() - 84);
    return {
      matchDate,
      groupId: { year: { $isoWeekYear: '$createdAt' }, week: { $isoWeek: '$createdAt' } },
      periodExpr: { $concat: [{ $toString: '$_id.year' }, '-W', { $toString: '$_id.week' }] },
      sortStage: { '_id.year': 1, '_id.week': 1 },
    };
  } else if (period === 'monthly') {
    const matchDate = new Date(now);
    matchDate.setMonth(matchDate.getMonth() - 12);
    return {
      matchDate,
      groupId: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
      periodExpr: '$_id',
      sortStage: { period: 1 },
    };
  } else {
    const matchDate = new Date(now);
    matchDate.setDate(matchDate.getDate() - 30);
    return {
      matchDate,
      groupId: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
      periodExpr: '$_id',
      sortStage: { period: 1 },
    };
  }
}

function getPagination(req) {
  return {
    page: Math.max(1, parseInt(req.query.page) || 1),
    pageSize: Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 10)),
  };
}

async function paginate(Model, pipeline, page, pageSize) {
  const [countResult, data] = await Promise.all([
    Model.aggregate([...pipeline, { $count: 'total' }]),
    Model.aggregate([...pipeline, { $skip: (page - 1) * pageSize }, { $limit: pageSize }]),
  ]);
  const total = countResult[0]?.total ?? 0;
  return { data, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
}

const getStats = async (req, res) => {
  try {
    const Message = mongoose.model('Message');
    const { page, pageSize } = getPagination(req);
    const { matchDate, groupId, periodExpr, sortStage } = getPeriodConfig(req.query.period || 'daily', new Date());

    const pipeline = [
      { $match: { createdAt: { $gte: matchDate } } },
      {
        $group: {
          _id: groupId,
          messageCount: { $sum: 1 },
          conversations: { $addToSet: '$conversationId' },
        },
      },
      {
        $project: {
          _id: 0,
          period: periodExpr,
          messageCount: 1,
          conversationCount: { $size: '$conversations' },
        },
      },
      { $sort: sortStage },
    ];

    res.json(await paginate(Message, pipeline, page, pageSize));
  } catch (err) {
    logger.error('[AnalyticsController] getStats error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getTokenUsage = async (req, res) => {
  try {
    const Transaction = mongoose.model('Transaction');
    const { page, pageSize } = getPagination(req);
    const win = req.query.window || 'day';
    const now = new Date();

    const matchDate = new Date(now);
    if (win === 'week') {
      matchDate.setDate(matchDate.getDate() - 7);
    } else if (win === 'month') {
      matchDate.setMonth(matchDate.getMonth() - 1);
    } else {
      matchDate.setDate(matchDate.getDate() - 1);
    }

    const pipeline = [
      { $match: { createdAt: { $gte: matchDate }, tokenType: { $in: ['prompt', 'completion'] } } },
      {
        $group: {
          _id: { $ifNull: ['$model', 'unknown'] },
          promptTokens: { $sum: { $cond: [{ $eq: ['$tokenType', 'prompt'] }, { $abs: '$rawAmount' }, 0] } },
          completionTokens: { $sum: { $cond: [{ $eq: ['$tokenType', 'completion'] }, { $abs: '$rawAmount' }, 0] } },
          totalTokenValue: { $sum: { $abs: '$tokenValue' } },
        },
      },
      {
        $project: {
          _id: 0,
          model: '$_id',
          promptTokens: 1,
          completionTokens: 1,
          totalTokens: { $add: ['$promptTokens', '$completionTokens'] },
          estimatedCostUSD: { $divide: ['$totalTokenValue', 1000000] },
        },
      },
      { $sort: { totalTokens: -1 } },
    ];

    res.json(await paginate(Transaction, pipeline, page, pageSize));
  } catch (err) {
    logger.error('[AnalyticsController] getTokenUsage error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getHealthStats = async (req, res) => {
  try {
    const Message = mongoose.model('Message');
    const { page, pageSize } = getPagination(req);
    const { matchDate, groupId, periodExpr, sortStage } = getPeriodConfig(req.query.period || 'daily', new Date());

    const [facetResult] = await Message.aggregate([
      { $match: { createdAt: { $gte: matchDate } } },
      {
        $facet: {
          metrics: [
            {
              $group: {
                _id: groupId,
                conversations: { $addToSet: '$conversationId' },
                errorCount: { $sum: { $cond: [{ $eq: ['$error', true] }, 1, 0] } },
                noResponseCount: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ['$isCreatedByUser', false] },
                          { $or: [{ $eq: ['$text', ''] }, { $eq: ['$text', null] }] },
                          {
                            $or: [
                              { $eq: [{ $size: { $ifNull: ['$content', []] } }, 0] },
                              { $not: ['$content'] },
                            ],
                          },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                period: periodExpr,
                conversationCount: { $size: '$conversations' },
                errorCount: 1,
                noResponseCount: 1,
              },
            },
            { $sort: sortStage },
          ],
          abandoned: [
            { $sort: { conversationId: 1, createdAt: -1 } },
            { $group: { _id: '$conversationId', lastIsUser: { $first: '$isCreatedByUser' }, periodKey: { $first: groupId } } },
            { $match: { lastIsUser: true } },
            { $group: { _id: '$periodKey', abandonedCount: { $sum: 1 } } },
          ],
        },
      },
    ]);

    const metricsResult = facetResult.metrics;
    const abandonedResult = facetResult.abandoned;

    const abandonedMap = {};
    for (const row of abandonedResult) {
      const key = typeof row._id === 'object' ? `${row._id.year}-W${row._id.week}` : row._id;
      abandonedMap[key] = row.abandonedCount;
    }

    const merged = metricsResult.map((row) => ({
      period: row.period,
      conversationCount: row.conversationCount,
      errorCount: row.errorCount,
      noResponseCount: row.noResponseCount,
      abandonedCount: abandonedMap[row.period] ?? 0,
    }));

    const totals = merged.reduce(
      (acc, r) => ({
        conversations: acc.conversations + r.conversationCount,
        errors: acc.errors + r.errorCount,
        noResponse: acc.noResponse + r.noResponseCount,
        abandoned: acc.abandoned + r.abandonedCount,
      }),
      { conversations: 0, errors: 0, noResponse: 0, abandoned: 0 },
    );

    const total = merged.length;
    const data = merged.slice((page - 1) * pageSize, page * pageSize);

    res.json({ data, totals, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (err) {
    logger.error('[AnalyticsController] getHealthStats error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getActiveUsers = async (req, res) => {
  try {
    const Message = mongoose.model('Message');
    const { page, pageSize } = getPagination(req);
    const win = req.query.window || 'week';
    const now = new Date();

    const matchDate = new Date(now);
    if (win === 'week') {
      matchDate.setDate(matchDate.getDate() - 7);
    } else if (win === 'month') {
      matchDate.setMonth(matchDate.getMonth() - 1);
    } else {
      matchDate.setDate(matchDate.getDate() - 1);
    }

    const pipeline = [
      { $match: { createdAt: { $gte: matchDate }, isCreatedByUser: true } },
      {
        $group: {
          _id: '$user',
          messageCount: { $sum: 1 },
          conversations: { $addToSet: '$conversationId' },
        },
      },
      {
        $addFields: {
          userObjectId: { $convert: { input: '$_id', to: 'objectId', onError: null } },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userObjectId',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: { $ifNull: ['$userInfo.name', 'Unknown'] },
          email: { $ifNull: ['$userInfo.email', ''] },
          messageCount: 1,
          conversationCount: { $size: '$conversations' },
        },
      },
      { $sort: { messageCount: -1 } },
    ];

    res.json(await paginate(Message, pipeline, page, pageSize));
  } catch (err) {
    logger.error('[AnalyticsController] getActiveUsers error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getFeedbackStats = async (req, res) => {
  try {
    const Message = mongoose.model('Message');
    const { page, pageSize } = getPagination(req);
    const { matchDate, groupId, periodExpr, sortStage } = getPeriodConfig(req.query.period || 'daily', new Date());

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: matchDate },
          isCreatedByUser: false,
          'feedback.rating': { $in: ['thumbsUp', 'thumbsDown'] },
        },
      },
      {
        $group: {
          _id: groupId,
          thumbsUp: { $sum: { $cond: [{ $eq: ['$feedback.rating', 'thumbsUp'] }, 1, 0] } },
          thumbsDown: { $sum: { $cond: [{ $eq: ['$feedback.rating', 'thumbsDown'] }, 1, 0] } },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          period: periodExpr,
          thumbsUp: 1,
          thumbsDown: 1,
          total: 1,
          likeRate: {
            $cond: [
              { $gt: ['$total', 0] },
              { $multiply: [{ $divide: ['$thumbsUp', '$total'] }, 100] },
              0,
            ],
          },
        },
      },
      { $sort: sortStage },
    ];

    res.json(await paginate(Message, pipeline, page, pageSize));
  } catch (err) {
    logger.error('[AnalyticsController] getFeedbackStats error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getCategoryDistribution = async (req, res) => {
  try {
    const Conversation = mongoose.model('Conversation');
    const { page, pageSize } = getPagination(req);
    const win = req.query.window || 'week';
    const now = new Date();

    const matchStage = { agent_id: { $exists: true, $nin: [null, ''] } };
    if (win !== 'all') {
      const matchDate = new Date(now);
      if (win === 'week') {
        matchDate.setDate(matchDate.getDate() - 7);
      } else if (win === 'month') {
        matchDate.setMonth(matchDate.getMonth() - 1);
      } else {
        matchDate.setDate(matchDate.getDate() - 1);
      }
      matchStage.createdAt = { $gte: matchDate };
    }

    const pipeline = [
      { $match: matchStage },
      { $group: { _id: '$agent_id', conversationCount: { $sum: 1 } } },
      {
        $lookup: {
          from: 'agents',
          localField: '_id',
          foreignField: 'id',
          as: 'agentInfo',
        },
      },
      { $unwind: { path: '$agentInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ['$agentInfo.category', 'uncategorized'] },
          conversationCount: { $sum: '$conversationCount' },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: 'value',
          as: 'categoryInfo',
        },
      },
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          category: '$_id',
          label: { $ifNull: ['$categoryInfo.label', '$_id'] },
          conversationCount: 1,
        },
      },
      { $sort: { conversationCount: -1 } },
    ];

    res.json(await paginate(Conversation, pipeline, page, pageSize));
  } catch (err) {
    logger.error('[AnalyticsController] getCategoryDistribution error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { getStats, getTokenUsage, getHealthStats, getActiveUsers, getFeedbackStats, getCategoryDistribution };
