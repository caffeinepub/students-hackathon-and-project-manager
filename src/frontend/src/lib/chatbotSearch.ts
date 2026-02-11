import { backendInterface, Achievement, AchievementCategory } from '../backend';
import { ChatbotFilters } from './chatbotParser';

export type ChatbotSearchResult = {
  achievements: Achievement[];
  appliedFilters: ChatbotFilters;
};

export async function executeChatbotSearch(
  actor: backendInterface,
  filters: ChatbotFilters
): Promise<ChatbotSearchResult> {
  let achievements: Achievement[] = [];

  // Priority 1: Search by Student ID
  if (filters.studentId) {
    achievements = await actor.getAchievementsByStudentId(filters.studentId);
  }
  // Priority 2: Search by category
  else if (filters.category) {
    achievements = await actor.getVerifiedAchievementsByCategory(filters.category);
  }
  // Priority 3: Text search
  else if (filters.textTerms.length > 0) {
    const searchTerm = filters.textTerms.join(' ');
    achievements = await actor.searchAchievements(searchTerm);
  }

  // Apply additional filters
  if (filters.category && !filters.studentId) {
    achievements = achievements.filter((a) => a.category === filters.category);
  }

  if (filters.year) {
    achievements = achievements.filter((a) => {
      const date = new Date(Number(a.date) / 1000000);
      return date.getFullYear() === filters.year;
    });
  }

  if (filters.textTerms.length > 0 && filters.studentId) {
    // Additional text filtering when searching by student ID
    const searchTerms = filters.textTerms.map((t) => t.toLowerCase());
    achievements = achievements.filter((a) => {
      const searchableText = `${a.title} ${a.description}`.toLowerCase();
      return searchTerms.some((term) => searchableText.includes(term));
    });
  }

  return {
    achievements,
    appliedFilters: filters,
  };
}

