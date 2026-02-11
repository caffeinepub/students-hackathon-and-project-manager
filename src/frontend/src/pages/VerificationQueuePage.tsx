import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useGetCallerUserProfile, useGetAchievementsForVerification, useVerifyAchievement } from '../hooks/useQueries';
import { canVerify } from '../lib/permissions';
import AchievementDetailPanel from '../components/AchievementDetailPanel';
import VerificationActions from '../components/VerificationActions';
import SearchResultsList from '../components/SearchResultsList';
import { Achievement, VerificationStatus } from '../backend';
import { toast } from 'sonner';
import { normalizeError } from '../lib/errors';

export default function VerificationQueuePage() {
  const { data: profile } = useGetCallerUserProfile();
  const { data: achievements = [], isLoading } = useGetAchievementsForVerification();
  const verifyAchievement = useVerifyAchievement();
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const handleVerify = async (achievementId: string, status: VerificationStatus, notes?: string) => {
    try {
      await verifyAchievement.mutateAsync({ achievementId, status, notes: notes || null });
      toast.success(`Achievement ${status === VerificationStatus.verified ? 'verified' : 'rejected'} successfully!`);
      setShowDetail(false);
      setSelectedAchievement(null);
    } catch (error) {
      toast.error(normalizeError(error));
    }
  };

  if (!profile || !canVerify(profile)) {
    return (
      <div className="page-container">
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              Only professors and administrators can access the verification queue.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Verification Queue</h1>
        <p className="text-muted-foreground mt-1">
          Review and verify student achievements ({achievements.length} pending)
        </p>
      </div>

      {achievements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No achievements pending verification</p>
          </CardContent>
        </Card>
      ) : (
        <SearchResultsList
          achievements={achievements}
          onViewDetails={(achievement) => {
            setSelectedAchievement(achievement);
            setShowDetail(true);
          }}
        />
      )}

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedAchievement && (
            <div className="space-y-4">
              <AchievementDetailPanel achievement={selectedAchievement} />
              <VerificationActions
                achievementId={selectedAchievement.achievementId}
                onVerify={handleVerify}
                isSubmitting={verifyAchievement.isPending}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

