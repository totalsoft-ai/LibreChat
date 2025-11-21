import { z } from 'zod';

/**
 * Workspace validation schemas matching backend constraints
 */

// Workspace name validation (required, max 100 chars)
export const workspaceNameSchema = z
  .string()
  .min(1, 'Workspace name is required')
  .max(100, 'Workspace name must be 100 characters or less')
  .trim();

// Workspace description validation (optional, max 500 chars)
export const workspaceDescriptionSchema = z
  .string()
  .max(500, 'Description must be 500 characters or less')
  .trim()
  .optional()
  .or(z.literal(''));

// Welcome message validation (optional, max 5000 chars)
export const welcomeMessageSchema = z
  .string()
  .max(5000, 'Welcome message must be 5000 characters or less')
  .trim()
  .optional()
  .or(z.literal(''));

// Guidelines validation (optional, max 5000 chars)
export const guidelinesSchema = z
  .string()
  .max(5000, 'Guidelines must be 5000 characters or less')
  .trim()
  .optional()
  .or(z.literal(''));

// Email validation for member search
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(3, 'Email must be at least 3 characters');

// Create workspace form schema
export const createWorkspaceSchema = z.object({
  name: workspaceNameSchema,
  description: workspaceDescriptionSchema,
});

// Update workspace form schema
export const updateWorkspaceSchema = z.object({
  name: workspaceNameSchema,
  description: workspaceDescriptionSchema,
});

// Update workspace information schema
export const updateWorkspaceInformationSchema = z.object({
  description: workspaceDescriptionSchema,
  welcomeMessage: welcomeMessageSchema,
  guidelines: guidelinesSchema,
});

// Start page link validation
export const startPageLinkSchema = z.object({
  title: z.string().min(1, 'Link title is required').max(100, 'Title must be 100 characters or less'),
  url: z.string().url('Please enter a valid URL'),
  icon: z.string().optional(),
});

// Start page configuration schema
export const startPageConfigSchema = z.object({
  enabled: z.boolean(),
  title: z.string().max(200, 'Title must be 200 characters or less'),
  content: z.string().max(10000, 'Content must be 10000 characters or less'),
  showStats: z.boolean(),
  customLinks: z.array(startPageLinkSchema).max(10, 'Maximum 10 custom links allowed'),
});

// Export types inferred from schemas
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type UpdateWorkspaceInformationInput = z.infer<typeof updateWorkspaceInformationSchema>;
export type StartPageLinkInput = z.infer<typeof startPageLinkSchema>;
export type StartPageConfigInput = z.infer<typeof startPageConfigSchema>;

/**
 * Validation helper functions
 */

// Validate and return errors for workspace name
export const validateWorkspaceName = (name: string): string | null => {
  const result = workspaceNameSchema.safeParse(name);
  return result.success ? null : result.error.errors[0]?.message || 'Invalid name';
};

// Validate and return errors for description
export const validateDescription = (description: string): string | null => {
  const result = workspaceDescriptionSchema.safeParse(description);
  return result.success ? null : result.error.errors[0]?.message || 'Invalid description';
};

// Validate and return errors for welcome message
export const validateWelcomeMessage = (message: string): string | null => {
  const result = welcomeMessageSchema.safeParse(message);
  return result.success ? null : result.error.errors[0]?.message || 'Invalid welcome message';
};

// Validate and return errors for guidelines
export const validateGuidelines = (guidelines: string): string | null => {
  const result = guidelinesSchema.safeParse(guidelines);
  return result.success ? null : result.error.errors[0]?.message || 'Invalid guidelines';
};

// Validate email for member search
export const validateEmail = (email: string): string | null => {
  const result = emailSchema.safeParse(email);
  return result.success ? null : result.error.errors[0]?.message || 'Invalid email';
};

// Character count helper with validation status
export interface CharacterCountStatus {
  current: number;
  max: number;
  remaining: number;
  percentage: number;
  status: 'safe' | 'warning' | 'danger' | 'error';
  message?: string;
}

export const getCharacterCountStatus = (
  value: string,
  maxLength: number,
): CharacterCountStatus => {
  const current = value.length;
  const remaining = maxLength - current;
  const percentage = (current / maxLength) * 100;

  let status: CharacterCountStatus['status'] = 'safe';
  let message: string | undefined;

  if (current > maxLength) {
    status = 'error';
    message = `${Math.abs(remaining)} characters over limit`;
  } else if (percentage >= 100) {
    status = 'error';
    message = 'Character limit reached';
  } else if (percentage >= 90) {
    status = 'danger';
    message = `${remaining} characters remaining`;
  } else if (percentage >= 75) {
    status = 'warning';
  }

  return {
    current,
    max: maxLength,
    remaining,
    percentage,
    status,
    message,
  };
};
