import { AchievementCategory } from '../backend';

export type ChatbotFilters = {
  studentId?: string;
  category?: AchievementCategory;
  textTerms: string[];
  year?: number;
};

export type ParseResult =
  | {
      type: 'success';
      filters: ChatbotFilters;
    }
  | {
      type: 'clarification';
      message: string;
    };

export function parsePrompt(prompt: string): ParseResult {
  const lowerPrompt = prompt.toLowerCase();
  const filters: ChatbotFilters = {
    textTerms: [],
  };

  // Extract Student ID patterns (e.g., STU12345, 12345, etc.)
  const studentIdMatch = prompt.match(/\b(stu\d+|\d{4,})\b/i);
  if (studentIdMatch) {
    filters.studentId = studentIdMatch[0].toUpperCase();
  }

  // Extract category keywords
  if (lowerPrompt.includes('project')) {
    filters.category = AchievementCategory.project;
  } else if (lowerPrompt.includes('research') || lowerPrompt.includes('paper')) {
    filters.category = AchievementCategory.researchPaper;
  } else if (lowerPrompt.includes('hackathon')) {
    filters.category = AchievementCategory.hackathon;
  } else if (lowerPrompt.includes('certificate')) {
    filters.category = AchievementCategory.certificate;
  }

  // Extract year
  const yearMatch = prompt.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    filters.year = parseInt(yearMatch[0], 10);
  }

  // Extract text search terms (remove common words and extracted patterns)
  const commonWords = new Set([
    'show',
    'find',
    'search',
    'get',
    'list',
    'display',
    'for',
    'student',
    'the',
    'all',
    'in',
    'from',
    'with',
    'about',
    'of',
    'by',
  ]);

  const words = prompt
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !commonWords.has(word));

  // Remove category keywords and student ID from text terms
  const categoryKeywords = ['project', 'research', 'paper', 'hackathon', 'certificate'];
  filters.textTerms = words.filter(
    (word) => !categoryKeywords.includes(word) && !(filters.studentId && word.includes(filters.studentId.toLowerCase()))
  );

  // Check if we have enough information
  if (!filters.studentId && !filters.category && filters.textTerms.length === 0) {
    return {
      type: 'clarification',
      message:
        'I need more information to search. Please try:\n\n' +
        '• "Show projects for student STU12345"\n' +
        '• "Find hackathon wins in 2024"\n' +
        '• "Search for machine learning projects"\n' +
        '• "Show all verified certificates"',
    };
  }

  return {
    type: 'success',
    filters,
  };
}

