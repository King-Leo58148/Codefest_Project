import type { ProfileUpdateInput } from '../types';

export const normalizeMomo = (value?: string) => (value || '').replace(/\D/g, '');

export const didMomoChange = (original?: string, next?: string) =>
  Boolean(next?.trim()) && normalizeMomo(original) !== normalizeMomo(next);

export function buildProfileUpdate(input: ProfileUpdateInput): ProfileUpdateInput {
  const value: ProfileUpdateInput = {};
  if (input.name?.trim()) value.name = input.name.trim();
  if (input.momoNumber?.trim()) value.momoNumber = normalizeMomo(input.momoNumber);
  if (input.currentPassword?.trim()) value.currentPassword = input.currentPassword;
  if (input.newPassword?.trim()) value.newPassword = input.newPassword;
  if (input.confirmPassword?.trim()) value.confirmPassword = input.confirmPassword;
  return value;
}
