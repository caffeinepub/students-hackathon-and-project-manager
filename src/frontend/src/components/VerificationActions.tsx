import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle, XCircle, Send, Loader2 } from 'lucide-react';
import { VerificationStatus } from '../backend';

interface VerificationActionsProps {
  achievementId: string;
  onVerify: (achievementId: string, status: VerificationStatus, notes?: string) => Promise<void>;
  isSubmitting: boolean;
}

export default function VerificationActions({ achievementId, onVerify, isSubmitting }: VerificationActionsProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [action, setAction] = useState<'verify' | 'reject'>('verify');
  const [notes, setNotes] = useState('');

  const handleAction = (actionType: 'verify' | 'reject') => {
    setAction(actionType);
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    const status = action === 'verify' ? VerificationStatus.verified : VerificationStatus.rejected;
    await onVerify(achievementId, status, notes.trim() || undefined);
    setShowDialog(false);
    setNotes('');
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={() => handleAction('verify')}
          disabled={isSubmitting}
          className="flex-1"
          variant="default"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Verify
        </Button>
        <Button
          onClick={() => handleAction('reject')}
          disabled={isSubmitting}
          className="flex-1"
          variant="destructive"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Reject
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'verify' ? 'Verify Achievement' : 'Reject Achievement'}
            </DialogTitle>
            <DialogDescription>
              {action === 'verify'
                ? 'Confirm that this achievement is valid and accurate.'
                : 'Provide a reason for rejecting this achievement.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes {action === 'reject' && '(Required)'}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  action === 'verify'
                    ? 'Add any comments (optional)...'
                    : 'Explain why this achievement is being rejected...'
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || (action === 'reject' && !notes.trim())}
              variant={action === 'verify' ? 'default' : 'destructive'}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Confirm {action === 'verify' ? 'Verification' : 'Rejection'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

