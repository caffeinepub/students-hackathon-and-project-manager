import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, LogIn, AlertCircle, RefreshCw } from 'lucide-react';
import ProfileSetupModal from './ProfileSetupModal';
import { normalizeError } from '../lib/errors';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { identity, login, loginStatus, isInitializing } = useInternetIdentity();
  const { 
    data: userProfile, 
    isLoading: profileLoading, 
    isFetched,
    error: profileError,
    refetch: refetchProfile 
  } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  // Show loading during initialization
  if (isInitializing || (isAuthenticated && profileLoading && !profileError)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show profile fetch error with retry option
  if (isAuthenticated && profileError && isFetched) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Connection Error
            </CardTitle>
            <CardDescription>
              Unable to load your profile or connect to the backend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {normalizeError(profileError)}
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button
                onClick={() => refetchProfile()}
                className="flex-1"
                variant="outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="flex-1"
                variant="outline"
              >
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto">
              <img
                src="/assets/generated/student-innovation-logo.dim_512x512.png"
                alt="Logo"
                className="h-20 w-20 mx-auto rounded-2xl"
              />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Welcome to Students-project-list-manager.com</CardTitle>
              <CardDescription className="mt-2">
                Manage and showcase your academic achievements, projects, and innovations
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={login}
              disabled={loginStatus === 'logging-in'}
              className="w-full h-12 text-base"
              size="lg"
            >
              {loginStatus === 'logging-in' ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In with Internet Identity
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Secure authentication powered by Internet Computer
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show profile setup if user is authenticated but has no profile
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null && !profileError;

  if (showProfileSetup) {
    return <ProfileSetupModal />;
  }

  // Show main app
  return <>{children}</>;
}
