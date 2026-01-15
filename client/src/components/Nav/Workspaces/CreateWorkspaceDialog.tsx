import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { OGDialog, OGDialogTemplate, Input, Label, Button } from '@librechat/client';
import { useLocalize } from '~/hooks';
import { useCreateWorkspaceMutation, type CreateWorkspacePayload } from '~/data-provider';
import type { Workspace } from '~/data-provider';

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (workspace: Workspace) => void;
}

export default function CreateWorkspaceDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateWorkspaceDialogProps) {
  const localize = useLocalize();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState<string>('');
  const createWorkspaceMutation = useCreateWorkspaceMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateWorkspacePayload>({
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (data: CreateWorkspacePayload) => {
    setIsSubmitting(true);
    setNameError(''); // Clear any previous errors
    try {
      const workspace = await createWorkspaceMutation.mutateAsync(data);
      reset();
      // Close dialog first
      onOpenChange(false);
      // Then call onSuccess callback
      onSuccess?.(workspace);
    } catch (error: any) {
      console.error('Failed to create workspace:', error);

      // Handle workspace name already exists error (409 Conflict)
      if (error?.response?.status === 409 || error?.response?.data?.error === 'WORKSPACE_NAME_EXISTS') {
        setNameError(
          error?.response?.data?.message ||
          localize('com_nav_workspace_name_exists') ||
          'A workspace with this name already exists. Please choose a different name.'
        );
      }
      // Don't close dialog on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <OGDialog open={open} onOpenChange={onOpenChange}>
      <OGDialogTemplate
        title={localize('com_nav_workspace_create') || 'Create Workspace'}
        className="max-w-md"
        showCancelButton={false}
        main={
          <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-left text-sm font-medium">
                {localize('com_nav_workspace_name') || 'Workspace Name'} *
              </Label>
              <Input
                id="name"
                {...register('name', {
                  required: localize('com_nav_workspace_name_required') || 'Name is required',
                  maxLength: {
                    value: 100,
                    message: localize('com_nav_workspace_name_max') || 'Maximum 100 characters',
                  },
                  onChange: () => setNameError(''), // Clear error on input change
                })}
                placeholder={localize('com_nav_workspace_name_placeholder') || 'My Workspace'}
                className="w-full"
              />
              {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
              {nameError && <span className="text-xs text-red-500">{nameError}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description" className="text-left text-sm font-medium">
                {localize('com_nav_workspace_description') || 'Description'}
              </Label>
              <textarea
                id="description"
                {...register('description')}
                placeholder={
                  localize('com_nav_workspace_description_placeholder') ||
                  'Optional description for your workspace'
                }
                className="min-h-[80px] w-full rounded-lg border border-border-medium bg-surface-primary px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:border-primary focus:outline-none"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                {localize('com_ui_cancel') || 'Cancel'}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? localize('com_ui_creating') || 'Creating...'
                  : localize('com_ui_create') || 'Create'}
              </Button>
            </div>
          </form>
        }
      />
    </OGDialog>
  );
}
