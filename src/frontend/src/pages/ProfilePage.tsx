import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Edit, Save, X } from 'lucide-react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';
import { normalizeError } from '../lib/errors';
import { UserRole } from '../backend';

type ProfileFormData = {
  name: string;
  email: string;
  bio?: string;
};

export default function ProfilePage() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
    values: profile
      ? {
          name: profile.name,
          email: profile.email,
          bio: profile.bio || '',
        }
      : undefined,
  });

  const onSubmit = async (data: ProfileFormData) => {
    if (!identity || !profile) return;

    try {
      await saveProfile.mutateAsync({
        ...profile,
        name: data.name,
        email: data.email,
        bio: data.bio || undefined,
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(normalizeError(error));
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.user:
        return 'Student';
      case UserRole.admin:
        return 'Professor';
      case UserRole.guest:
        return 'Recruiter/Industry';
      default:
        return role;
    }
  };

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-container">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container max-w-3xl">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">My Profile</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Name is required', minLength: 2 })}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  {...register('bio')}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={saveProfile.isPending}>
                  {saveProfile.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button type="button" onClick={handleCancel} variant="outline">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="text-lg font-medium mt-1">{profile.name}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="text-lg font-medium mt-1">{profile.email}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Role</Label>
                <div className="mt-1">
                  <Badge variant="outline" className="text-sm">
                    {getRoleLabel(profile.role)}
                  </Badge>
                </div>
              </div>

              {profile.studentId && (
                <div>
                  <Label className="text-muted-foreground">Student ID</Label>
                  <p className="text-lg font-medium mt-1">{profile.studentId}</p>
                </div>
              )}

              {profile.bio && (
                <div>
                  <Label className="text-muted-foreground">Bio</Label>
                  <p className="text-base mt-1 whitespace-pre-wrap">{profile.bio}</p>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground">Principal ID</Label>
                <p className="text-sm font-mono mt-1 break-all text-muted-foreground">
                  {profile.principal.toString()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

