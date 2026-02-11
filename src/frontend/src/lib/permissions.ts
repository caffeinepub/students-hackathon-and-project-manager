import { Profile, UserRole } from '../backend';

export function canVerify(profile: Profile): boolean {
  return profile.role === UserRole.admin;
}

export function isStudent(profile: Profile): boolean {
  return profile.role === UserRole.user;
}

export function canEditAchievement(profile: Profile, achievementOwnerId: string): boolean {
  // Students can only edit their own achievements
  if (profile.role === UserRole.user) {
    return profile.principal.toString() === achievementOwnerId;
  }
  // Admins can edit any achievement
  return profile.role === UserRole.admin;
}

