import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { UserRole } from '../backend';
import { toast } from 'sonner';
import { normalizeError } from '../lib/errors';

type ProfileFormData = {
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  bio?: string;
};

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.user);
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>();
  const saveProfile = useSaveCallerUserProfile();

  const onSubmit = async (data: ProfileFormData) => {
    if (!identity) return;

    try {
      await saveProfile.mutateAsync({
        principal: identity.getPrincipal(),
        name: data.name,
        email: data.email,
        role: selectedRole,
        studentId: selectedRole === UserRole.user && data.studentId ? data.studentId : undefined,
        bio: data.bio || undefined,
      });
      toast.success('Profile created successfully!');
    } catch (error) {
      toast.error(normalizeError(error));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Tell us about yourself to get started with Student Portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required', minLength: 2 })}
                placeholder="John Doe"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email', { required: 'Email is required' })}
                placeholder="john@university.edu"
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.user}>Student</SelectItem>
                  <SelectItem value={UserRole.admin}>Professor</SelectItem>
                  <SelectItem value={UserRole.guest}>Recruiter/Industry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedRole === UserRole.user && (
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID *</Label>
                <Input
                  id="studentId"
                  {...register('studentId', {
                    required: selectedRole === UserRole.user ? 'Student ID is required for students' : false,
                  })}
                  placeholder="STU12345"
                />
                {errors.studentId && <p className="text-sm text-destructive">{errors.studentId.message}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Textarea
                id="bio"
                {...register('bio')}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                'Create Profile'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

