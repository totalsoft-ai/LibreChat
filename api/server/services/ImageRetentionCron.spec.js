const { FileContext } = require('librechat-data-provider');

const mockGetFiles = jest.fn();
const mockDeleteFileRecord = jest.fn();
const mockGetStrategyFunctions = jest.fn();

jest.mock('~/models/File', () => ({
  getFiles: (...args) => mockGetFiles(...args),
  deleteFile: (...args) => mockDeleteFileRecord(...args),
}));

jest.mock('~/server/services/Files/strategies', () => ({
  getStrategyFunctions: (...args) => mockGetStrategyFunctions(...args),
}));

const { sweepExpiredImageAttachments, calculateCutoffDate } = require('./ImageRetentionCron');

describe('calculateCutoffDate', () => {
  it('subtracts the given number of days from now', () => {
    const before = Date.now();
    const cutoff = calculateCutoffDate(15);
    const expectedMs = before - 15 * 24 * 60 * 60 * 1000;
    // allow a small tolerance for test execution time
    expect(Math.abs(cutoff.getTime() - expectedMs)).toBeLessThan(5000);
  });
});

describe('sweepExpiredImageAttachments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('queries only message-attachment images older than the cutoff', async () => {
    mockGetFiles.mockResolvedValue([]);

    await sweepExpiredImageAttachments(15);

    expect(mockGetFiles).toHaveBeenCalledWith(
      expect.objectContaining({
        context: FileContext.message_attachment,
        type: { $regex: '^image/' },
        createdAt: { $lt: expect.any(Date) },
      }),
    );
  });

  it('deletes both the storage object and the DB record for each expired file', async () => {
    const deleteFromStorage = jest.fn().mockResolvedValue();
    mockGetStrategyFunctions.mockReturnValue({ deleteFile: deleteFromStorage });
    mockGetFiles.mockResolvedValue([
      { file_id: 'file-1', source: 's3', user: 'user-1' },
      { file_id: 'file-2', source: 's3', user: 'user-2' },
    ]);

    const result = await sweepExpiredImageAttachments(15);

    expect(deleteFromStorage).toHaveBeenCalledTimes(2);
    expect(deleteFromStorage).toHaveBeenCalledWith(
      { user: { id: 'user-1' } },
      expect.objectContaining({ file_id: 'file-1' }),
    );
    expect(mockDeleteFileRecord).toHaveBeenCalledWith('file-1');
    expect(mockDeleteFileRecord).toHaveBeenCalledWith('file-2');
    expect(result).toEqual({ processed: 2, errors: 0, cutoffDate: expect.any(Date) });
  });

  it('continues processing remaining files when one deletion fails', async () => {
    const deleteFromStorage = jest
      .fn()
      .mockRejectedValueOnce(new Error('S3 unreachable'))
      .mockResolvedValueOnce();
    mockGetStrategyFunctions.mockReturnValue({ deleteFile: deleteFromStorage });
    mockGetFiles.mockResolvedValue([
      { file_id: 'file-1', source: 's3', user: 'user-1' },
      { file_id: 'file-2', source: 's3', user: 'user-2' },
    ]);

    const result = await sweepExpiredImageAttachments(15);

    expect(deleteFromStorage).toHaveBeenCalledTimes(2);
    expect(mockDeleteFileRecord).toHaveBeenCalledTimes(1);
    expect(mockDeleteFileRecord).toHaveBeenCalledWith('file-2');
    expect(result).toEqual({ processed: 1, errors: 1, cutoffDate: expect.any(Date) });
  });

  it('returns early when there are no expired files', async () => {
    mockGetFiles.mockResolvedValue([]);

    const result = await sweepExpiredImageAttachments(15);

    expect(mockGetStrategyFunctions).not.toHaveBeenCalled();
    expect(mockDeleteFileRecord).not.toHaveBeenCalled();
    expect(result.processed).toBe(0);
    expect(result.errors).toBe(0);
  });
});
