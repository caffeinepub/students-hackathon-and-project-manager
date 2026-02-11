import { Achievement } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';
import { formatDate, getCategoryLabel, getStatusColor } from '../lib/utils';
import { Button } from '@/components/ui/button';

interface SearchResultsListProps {
  achievements: Achievement[];
  onViewDetails: (achievement: Achievement) => void;
  studentNames?: Map<string, string>;
}

export default function SearchResultsList({ achievements, onViewDetails, studentNames }: SearchResultsListProps) {
  if (achievements.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No achievements found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {achievements.map((achievement) => (
        <Card key={achievement.achievementId} className="card-hover">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">{achievement.title}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{getCategoryLabel(achievement.category)}</Badge>
                  <Badge className={getStatusColor(achievement.status)}>
                    {achievement.status.charAt(0).toUpperCase() + achievement.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <Button onClick={() => onViewDetails(achievement)} variant="outline" size="sm">
                View Details
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{achievement.description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(achievement.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>
                  {studentNames?.get(achievement.studentId) || 'Student'} ({achievement.studentId})
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

