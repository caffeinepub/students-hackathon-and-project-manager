import { Achievement, VerificationStatus } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ExternalLink, User, CheckCircle, XCircle, Clock, FileImage } from 'lucide-react';
import { formatDate, getCategoryLabel, getStatusColor } from '../lib/utils';

interface AchievementDetailPanelProps {
  achievement: Achievement;
  studentName?: string;
}

export default function AchievementDetailPanel({ achievement, studentName }: AchievementDetailPanelProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-2xl mb-2">{achievement.title}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{getCategoryLabel(achievement.category)}</Badge>
              <Badge className={getStatusColor(achievement.status)}>
                {achievement.status === VerificationStatus.verified && <CheckCircle className="h-3 w-3 mr-1" />}
                {achievement.status === VerificationStatus.rejected && <XCircle className="h-3 w-3 mr-1" />}
                {achievement.status === VerificationStatus.pending && <Clock className="h-3 w-3 mr-1" />}
                {achievement.status.charAt(0).toUpperCase() + achievement.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">{achievement.description}</p>
        </div>

        {achievement.certificateImage && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileImage className="h-4 w-4" />
              Certificate
            </h3>
            <div className="border rounded-lg overflow-hidden bg-muted/30">
              <img
                src={achievement.certificateImage.getDirectURL()}
                alt="Certificate"
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Date:</span>
            <span className="font-medium">{formatDate(achievement.date)}</span>
          </div>
          {studentName && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Student:</span>
              <span className="font-medium">{studentName} ({achievement.studentId})</span>
            </div>
          )}
        </div>

        {achievement.links && achievement.links.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Links</h3>
            <div className="space-y-2">
              {achievement.links.map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  {link}
                </a>
              ))}
            </div>
          </div>
        )}

        {achievement.verificationHistory.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Verification History</h3>
            <div className="space-y-3">
              {achievement.verificationHistory.map((event, index) => (
                <div key={index} className="border-l-2 border-primary/20 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getStatusColor(event.status)} variant="outline">
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(event.timestamp)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Verifier: {event.verifier.toString().slice(0, 10)}...
                  </p>
                  {event.notes && (
                    <p className="text-sm mt-1 bg-muted p-2 rounded">{event.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
