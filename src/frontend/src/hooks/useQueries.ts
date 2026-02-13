import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Profile, Achievement, AchievementInput, AchievementCategory, VerificationStatus, GeminiChatRequest, GeminiChatResponse } from '../backend';

// Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<Profile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Profile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAllProfiles() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Profile[]>({
    queryKey: ['allProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProfiles();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Achievement Queries
export function useGetAchievementsByStudentId(studentId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Achievement[]>({
    queryKey: ['achievements', 'byStudentId', studentId],
    queryFn: async () => {
      if (!actor || !studentId) return [];
      return actor.getAchievementsByStudentId(studentId);
    },
    enabled: !!actor && !actorFetching && !!studentId,
  });
}

export function useSearchAchievements(searchTerm: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Achievement[]>({
    queryKey: ['achievements', 'search', searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm) return [];
      return actor.searchAchievements(searchTerm);
    },
    enabled: !!actor && !actorFetching && !!searchTerm,
  });
}

export function useGetVerifiedAchievementsByCategory(category: AchievementCategory) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Achievement[]>({
    queryKey: ['achievements', 'verified', category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVerifiedAchievementsByCategory(category);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAchievementsForVerification() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Achievement[]>({
    queryKey: ['achievements', 'verification'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAchievementsForVerification();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateAchievement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (achievementInput: AchievementInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createAchievement(achievementInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });
}

export function useVerifyAchievement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      achievementId,
      status,
      notes,
    }: {
      achievementId: string;
      status: VerificationStatus;
      notes: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.verifyAchievement(achievementId, status, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });
}

// Gemini Chat Queries
export function useChatWithGemini() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (chatRequest: GeminiChatRequest): Promise<GeminiChatResponse> => {
      if (!actor) throw new Error('Actor not available');
      return actor.chatWithGemini(chatRequest);
    },
  });
}
