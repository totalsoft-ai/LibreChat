const { needsRefresh } = require('./crud');

describe('needsRefresh', () => {
  it('returns false for a relative proxy path (never a signed URL)', () => {
    expect(needsRefresh('/images/507f1f77bcf86cd799439011/photo.png', 3600)).toBe(false);
  });

  it('returns false for a falsy filepath', () => {
    expect(needsRefresh('', 3600)).toBe(false);
    expect(needsRefresh(undefined, 3600)).toBe(false);
  });

  it('returns false for an absolute URL without a signature', () => {
    expect(needsRefresh('https://cdn.example.com/images/photo.png', 3600)).toBe(false);
  });

  it('returns true for a signed URL that is already expired', () => {
    const past = new Date(Date.now() - 60 * 60 * 1000);
    const dateParam = past.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const url =
      `https://minio.example.com/bucket/images/user/photo.png` +
      `?X-Amz-Signature=abc&X-Amz-Expires=120&X-Amz-Date=${dateParam}`;
    expect(needsRefresh(url, 3600)).toBe(true);
  });

  it('returns false for a signed URL that is still comfortably valid', () => {
    const now = new Date();
    const dateParam = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const url =
      `https://minio.example.com/bucket/images/user/photo.png` +
      `?X-Amz-Signature=abc&X-Amz-Expires=604800&X-Amz-Date=${dateParam}`;
    expect(needsRefresh(url, 3600)).toBe(false);
  });

  it('returns true when a would-be signed URL cannot be parsed at all', () => {
    expect(needsRefresh('not a url::::', 3600)).toBe(true);
  });
});
