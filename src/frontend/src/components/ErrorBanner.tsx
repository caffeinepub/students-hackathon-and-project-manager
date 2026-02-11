import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ErrorBannerProps {
  error: string | Error | null;
  title?: string;
}

export default function ErrorBanner({ error, title = 'Error' }: ErrorBannerProps) {
  if (!error) return null;

  const message = typeof error === 'string' ? error : error.message;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

