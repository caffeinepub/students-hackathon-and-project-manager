import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, CheckCircle, Search, MessageSquare, TrendingUp, Users } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useGetCallerUserProfile, useGetAchievementsByStudentId } from '../hooks/useQueries';
import { canVerify } from '../lib/permissions';
import { UserRole } from '../backend';

export default function DashboardPage() {
  const { data: profile } = useGetCallerUserProfile();
  const { data: myAchievements = [] } = useGetAchievementsByStudentId(profile?.studentId || '');

  const isStudent = profile?.role === UserRole.user;
  const isVerifier = profile && canVerify(profile);

  const verifiedCount = myAchievements.filter((a) => a.status === 'verified').length;
  const pendingCount = myAchievements.filter((a) => a.status === 'pending').length;

  return (
    <div className="page-container">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="absolute inset-0">
          <img
            src="/assets/generated/student-portfolio-hero.dim_1600x900.png"
            alt="Hero"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Welcome back, {profile?.name || 'User'}!
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {isStudent
              ? 'Manage your academic achievements, showcase your innovations, and get them verified.'
              : isVerifier
              ? 'Review and verify student achievements to help build credible academic portfolios.'
              : 'Discover verified student achievements and connect with talented innovators.'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {isStudent && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Achievements</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myAchievements.length}</div>
              <p className="text-xs text-muted-foreground">Your portfolio items</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{verifiedCount}</div>
              <p className="text-xs text-muted-foreground">Approved achievements</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <TrendingUp className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting verification</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="card-hover">
          <CardHeader>
            <Award className="h-10 w-10 text-primary mb-2" />
            <CardTitle>My Achievements</CardTitle>
            <CardDescription>
              {isStudent
                ? 'View and manage your projects, papers, and certificates'
                : 'Browse your achievement portfolio'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/achievements">
              <Button className="w-full">View Achievements</Button>
            </Link>
          </CardContent>
        </Card>

        {isVerifier && (
          <Card className="card-hover">
            <CardHeader>
              <CheckCircle className="h-10 w-10 text-success mb-2" />
              <CardTitle>Verification Queue</CardTitle>
              <CardDescription>Review and verify student achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/verification">
                <Button className="w-full">Review Submissions</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <Card className="card-hover">
          <CardHeader>
            <Search className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Search Achievements</CardTitle>
            <CardDescription>Find verified achievements by student ID or keywords</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/search">
              <Button className="w-full" variant="outline">
                Start Searching
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <MessageSquare className="h-10 w-10 text-primary mb-2" />
            <CardTitle>AI Assistant</CardTitle>
            <CardDescription>Ask questions and get intelligent search results</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/chat">
              <Button className="w-full" variant="outline">
                Open Assistant
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <Users className="h-10 w-10 text-primary mb-2" />
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Update your information and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/profile">
              <Button className="w-full" variant="outline">
                Edit Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

