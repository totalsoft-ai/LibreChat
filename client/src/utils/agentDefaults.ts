import {
  alternateName,
  LocalStorageKeys,
  defaultAgentFormValues,
} from 'librechat-data-provider';

/**
 * Creates an Option object for a provider dropdown.
 */
export const createProviderOption = (provider: string) => ({
  label: (alternateName[provider] as string | undefined) ?? provider,
  value: provider,
});

/**
 * Gets default agent form values with localStorage values for model and provider.
 * This is used to initialize agent forms with the last used model and provider.
 */
export const getDefaultAgentFormValues = () => ({
  ...defaultAgentFormValues,
  model: localStorage.getItem(LocalStorageKeys.LAST_AGENT_MODEL) ?? '',
  provider: createProviderOption(localStorage.getItem(LocalStorageKeys.LAST_AGENT_PROVIDER) ?? ''),
});
