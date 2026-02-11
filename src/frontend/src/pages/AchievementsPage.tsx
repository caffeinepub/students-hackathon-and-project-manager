import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Loader2, Calendar, Edit, Trash2 } from 'lucide-react';
import {
  useGetCallerUserProfile,
  useGetAchievementsByStudentId,
  useCreateAchievement,
  useVerifyAchievement,
} from '../hooks/useQueries';
import AchievementForm from '../components/AchievementForm';
import AchievementDetailPanel from '../components/AchievementDetailPanel';
import VerificationActions from '../components/VerificationActions';
import { Achievement, AchievementCategory, VerificationStatus, UserRole } from '../backend';
import { formatDate, getCategoryLabel, getStatusColor } from '../lib/utils';
import { toast } from 'sonner';
import { normalizeError } from '../lib/errors';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function AchievementsPage() {
  const { identity } = useInternetIdentity();
  const { data: profile } = useGetCallerUserProfile();
  const { data: achievements = [], isLoading } = useGetAchievementsByStudentId(profile?.studentId || '');
  const createAchievement = useCreateAchievement();
  const verifyAchievement = useVerifyAchievement();

  const [showForm, setShowForm] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const isStudent = profile?.role === UserRole.user;

  const handleCreate = async (data: any) => {
    if (!identity || !profile?.studentId) return;

    try {
      const achievementId = `${profile.studentId}-${Date.now()}`;
      await createAchievement.mutateAsync({
        achievementId,
        studentId: profile.studentId,
        studentPrincipal: identity.getPrincipal(),
        title: data.title,
        category: data.category,
        description: data.description,
        date: BigInt(new Date(data.date).getTime() * 1000000),
        links: data.links,
        certificateImage: data.certificateImage,
      });
      toast.success('Achievement created successfully!');
      setShowForm(false);
    } catch (error) {
      toast.error(normalizeError(error));
    }
  };

  const handleVerify = async (achievementId: string, status: VerificationStatus, notes?: string) => {
    try {
      await verifyAchievement.mutateAsync({ achievementId, status, notes: notes || null });
      toast.success(`Achievement ${status === VerificationStatus.verified ? 'verified' : 'rejected'} successfully!`);
      setShowDetail(false);
    } catch (error) {
      toast.error(normalizeError(error));
    }
  };

  const filterByCategory = (category?: AchievementCategory) => {
    if (!category) return achievements;
    return achievements.filter((a) => a.category === category);
  };

  const AchievementCard = ({ achievement }: { achievement: Achievement }) => (
    <Card
      className="card-hover cursor-pointer"
      onClick={() => {
        setSelectedAchievement(achievement);
        setShowDetail(true);
      }}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{achievement.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Calendar className="h-3 w-3" />
              {formatDate(achievement.date)}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(achievement.status)}>
            {achievement.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{getCategoryLabel(achievement.category)}</Badge>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Achievements</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your academic accomplishments
          </p>
        </div>
        {isStudent && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Achievement
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({achievements.length})</TabsTrigger>
          <TabsTrigger value="project">
            Projects ({filterByCategory(AchievementCategory.project).length})
          </TabsTrigger>
          <TabsTrigger value="research">
            Research ({filterByCategory(AchievementCategory.researchPaper).length})
          </TabsTrigger>
          <TabsTrigger value="hackathon">
            Hackathons ({filterByCategory(AchievementCategory.hackathon).length})
          </TabsTrigger>
          <TabsTrigger value="certificate">
            Certificates ({filterByCategory(AchievementCategory.certificate).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {achievements.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No achievements yet. Start by adding your first one!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement) => (
                <AchievementCard key={achievement.achievementId} achievement={achievement} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="project" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterByCategory(AchievementCategory.project).map((achievement) => (
              <AchievementCard key={achievement.achievementId} achievement={achievement} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="research" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterByCategory(AchievementCategory.researchPaper).map((achievement) => (
              <AchievementCard key={achievement.achievementId} achievement={achievement} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="hackathon" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterByCategory(AchievementCategory.hackathon).map((achievement) => (
              <AchievementCard key={achievement.achievementId} achievement={achievement} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="certificate" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterByCategory(AchievementCategory.certificate).map((achievement) => (
              <AchievementCard key={achievement.achievementId} achievement={achievement} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Achievement</DialogTitle>
          </DialogHeader>
          <AchievementForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            isSubmitting={createAchievement.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedAchievement && (
            <>
              <AchievementDetailPanel achievement={selectedAchievement} />
              {profile && profile.role === UserRole.admin && selectedAchievement.status === VerificationStatus.pending && (
                <div className="mt-4">
                  <VerificationActions
                    achievementId={selectedAchievement.achievementId}
                    onVerify={handleVerify}
                    isSubmitting={verifyAchievement.isPending}
                  />
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
