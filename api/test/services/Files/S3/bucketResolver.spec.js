const { getBucketName } = require('~/server/services/Files/S3/bucketResolver');

describe('Bucket Resolver - getBucketName', () => {
  let originalPersonalBucket;
  let originalWorkspaceBucket;

  beforeEach(() => {
    // Save original environment variables
    originalPersonalBucket = process.env.AWS_BUCKET_NAME;
    originalWorkspaceBucket = process.env.AWS_WORKSPACE_BUCKET_NAME;

    // Set default test values
    process.env.AWS_BUCKET_NAME = 'test-personal-bucket';
    process.env.AWS_WORKSPACE_BUCKET_NAME = '';
  });

  afterEach(() => {
    // Restore original environment variables
    process.env.AWS_BUCKET_NAME = originalPersonalBucket;
    process.env.AWS_WORKSPACE_BUCKET_NAME = originalWorkspaceBucket;
  });

  describe('Single-bucket mode (backward compatible)', () => {
    beforeEach(() => {
      process.env.AWS_BUCKET_NAME = 'single-bucket';
      process.env.AWS_WORKSPACE_BUCKET_NAME = '';
    });

    it('should use personal bucket when workspace bucket is not configured', () => {
      const result = getBucketName({ workspace: 'ws123' });
      expect(result).toBe('single-bucket');
    });

    it('should use personal bucket for personal files when workspace bucket is not configured', () => {
      const result = getBucketName({ workspace: null });
      expect(result).toBe('single-bucket');
    });

    it('should use personal bucket when no parameters provided', () => {
      const result = getBucketName();
      expect(result).toBe('single-bucket');
    });

    it('should use personal bucket when empty object provided', () => {
      const result = getBucketName({});
      expect(result).toBe('single-bucket');
    });
  });

  describe('Dual-bucket mode', () => {
    beforeEach(() => {
      process.env.AWS_BUCKET_NAME = 'personal-bucket';
      process.env.AWS_WORKSPACE_BUCKET_NAME = 'workspace-bucket';
    });

    describe('Workspace files', () => {
      it('should use workspace bucket when workspace ID is provided', () => {
        const result = getBucketName({ workspace: 'ws123' });
        expect(result).toBe('workspace-bucket');
      });

      it('should use workspace bucket for file object with workspace', () => {
        const result = getBucketName({ file: { workspace: 'ws456' } });
        expect(result).toBe('workspace-bucket');
      });

      it('should use workspace bucket for numeric workspace ID', () => {
        const result = getBucketName({ workspace: '12345' });
        expect(result).toBe('workspace-bucket');
      });

      it('should use workspace bucket for workspace ID with special characters', () => {
        const result = getBucketName({ workspace: 'ws-123-abc-def' });
        expect(result).toBe('workspace-bucket');
      });
    });

    describe('Personal files', () => {
      it('should use personal bucket when workspace is null', () => {
        const result = getBucketName({ workspace: null });
        expect(result).toBe('personal-bucket');
      });

      it('should use personal bucket when workspace is undefined', () => {
        const result = getBucketName({ workspace: undefined });
        expect(result).toBe('personal-bucket');
      });

      it('should use personal bucket when workspace is string "null"', () => {
        const result = getBucketName({ workspace: 'null' });
        expect(result).toBe('personal-bucket');
      });

      it('should use personal bucket when file object has null workspace', () => {
        const result = getBucketName({ file: { workspace: null } });
        expect(result).toBe('personal-bucket');
      });

      it('should use personal bucket when file object has string "null" workspace', () => {
        const result = getBucketName({ file: { workspace: 'null' } });
        expect(result).toBe('personal-bucket');
      });

      it('should use personal bucket when no parameters provided', () => {
        const result = getBucketName();
        expect(result).toBe('personal-bucket');
      });

      it('should use personal bucket when empty object provided', () => {
        const result = getBucketName({});
        expect(result).toBe('personal-bucket');
      });

      it('should use personal bucket when file object is empty', () => {
        const result = getBucketName({ file: {} });
        expect(result).toBe('personal-bucket');
      });
    });

    describe('Priority: workspace parameter over file object', () => {
      it('should prioritize workspace parameter over file.workspace', () => {
        const result = getBucketName({
          workspace: 'ws-from-param',
          file: { workspace: 'ws-from-file' },
        });
        expect(result).toBe('workspace-bucket');
      });

      it('should use file.workspace when workspace parameter is null', () => {
        const result = getBucketName({
          workspace: null,
          file: { workspace: 'ws-from-file' },
        });
        expect(result).toBe('workspace-bucket');
      });

      it('should use personal bucket when both are null', () => {
        const result = getBucketName({
          workspace: null,
          file: { workspace: null },
        });
        expect(result).toBe('personal-bucket');
      });
    });

    describe('Edge cases', () => {
      it('should handle empty string workspace as personal file', () => {
        const result = getBucketName({ workspace: '' });
        expect(result).toBe('personal-bucket');
      });

      it('should handle zero as workspace ID', () => {
        const result = getBucketName({ workspace: '0' });
        expect(result).toBe('workspace-bucket');
      });

      it('should handle boolean true as workspace ID', () => {
        const result = getBucketName({ workspace: true });
        expect(result).toBe('workspace-bucket');
      });

      it('should handle file object without workspace property', () => {
        const result = getBucketName({ file: { filename: 'test.txt' } });
        expect(result).toBe('personal-bucket');
      });
    });
  });

  describe('Environment variable validation', () => {
    it('should return personal bucket when AWS_BUCKET_NAME is set', () => {
      process.env.AWS_BUCKET_NAME = 'my-bucket';
      process.env.AWS_WORKSPACE_BUCKET_NAME = '';

      const result = getBucketName();
      expect(result).toBe('my-bucket');
    });

    it('should handle undefined AWS_BUCKET_NAME gracefully', () => {
      process.env.AWS_BUCKET_NAME = undefined;
      process.env.AWS_WORKSPACE_BUCKET_NAME = undefined;

      const result = getBucketName({ workspace: 'ws123' });
      expect(result).toBeUndefined();
    });

    it('should prioritize workspace bucket when both are set and workspace provided', () => {
      process.env.AWS_BUCKET_NAME = 'personal';
      process.env.AWS_WORKSPACE_BUCKET_NAME = 'workspace';

      const result = getBucketName({ workspace: 'ws123' });
      expect(result).toBe('workspace');
    });

    it('should fall back to personal bucket when workspace bucket is empty string', () => {
      process.env.AWS_BUCKET_NAME = 'personal';
      process.env.AWS_WORKSPACE_BUCKET_NAME = '';

      const result = getBucketName({ workspace: 'ws123' });
      expect(result).toBe('personal');
    });
  });

  describe('Real-world scenarios', () => {
    beforeEach(() => {
      process.env.AWS_BUCKET_NAME = 'librechat-personal';
      process.env.AWS_WORKSPACE_BUCKET_NAME = 'librechat-workspaces';
    });

    it('should handle file upload in workspace context', () => {
      const fileMetadata = {
        workspace: 'workspace-abc-123',
      };

      const result = getBucketName({ file: fileMetadata });
      expect(result).toBe('librechat-workspaces');
    });

    it('should handle file upload in personal context', () => {
      const fileMetadata = {
        workspace: null,
        user: 'user123',
      };

      const result = getBucketName({ file: fileMetadata });
      expect(result).toBe('librechat-personal');
    });

    it('should handle direct workspace parameter from upload route', () => {
      const workspaceId = 'ws-engineering-team';

      const result = getBucketName({ workspace: workspaceId });
      expect(result).toBe('librechat-workspaces');
    });

    it('should handle file deletion with workspace file object', () => {
      const fileToDelete = {
        file_id: 'file123',
        workspace: 'ws-marketing',
        filepath: 's3://bucket/path/to/file.pdf',
      };

      const result = getBucketName({ file: fileToDelete });
      expect(result).toBe('librechat-workspaces');
    });

    it('should handle file URL refresh with personal file', () => {
      const fileToRefresh = {
        file_id: 'file456',
        workspace: null,
        filepath: 's3://bucket/path/to/personal-file.jpg',
      };

      const result = getBucketName({ file: fileToRefresh });
      expect(result).toBe('librechat-personal');
    });

    it('should handle migration scenario - old files without workspace field', () => {
      const legacyFile = {
        file_id: 'old-file-789',
        filepath: 's3://old-bucket/file.txt',
        // No workspace field
      };

      const result = getBucketName({ file: legacyFile });
      expect(result).toBe('librechat-personal');
    });
  });

  describe('Integration scenarios', () => {
    it('should work with S3 upload flow', () => {
      process.env.AWS_BUCKET_NAME = 'personal';
      process.env.AWS_WORKSPACE_BUCKET_NAME = 'workspace';

      // Simulate upload in workspace
      const uploadParams = {
        workspace: 'ws-team-alpha',
      };

      const bucket = getBucketName(uploadParams);
      expect(bucket).toBe('workspace');
    });

    it('should work with file deletion flow', () => {
      process.env.AWS_BUCKET_NAME = 'personal';
      process.env.AWS_WORKSPACE_BUCKET_NAME = 'workspace';

      // Simulate deletion of workspace file
      const fileFromDB = {
        file_id: 'file-to-delete',
        workspace: 'ws-project-x',
        user: 'user123',
      };

      const bucket = getBucketName({ file: fileFromDB });
      expect(bucket).toBe('workspace');
    });

    it('should work with URL refresh flow for personal files', () => {
      process.env.AWS_BUCKET_NAME = 'personal';
      process.env.AWS_WORKSPACE_BUCKET_NAME = 'workspace';

      // Simulate URL refresh for personal file
      const fileObj = {
        filepath: 's3://personal/images/user123/avatar.jpg',
        source: 's3',
        workspace: null,
      };

      const bucket = getBucketName({ file: fileObj });
      expect(bucket).toBe('personal');
    });
  });
});
