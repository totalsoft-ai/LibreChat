import request from './request';

export interface UserLookupResult {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  username?: string;
}

/**
 * Lookup users by partial email match
 * Used for adding members to workspaces
 * Returns up to 10 matching users
 */
export const lookupUserByEmail = async (email: string): Promise<UserLookupResult[]> => {
  const response = await request.get<{ users: UserLookupResult[] }>(
    `/api/user/lookup?email=${encodeURIComponent(email)}`,
  );
  return response.users;
};
