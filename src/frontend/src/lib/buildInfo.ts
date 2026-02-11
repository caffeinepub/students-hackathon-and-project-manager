/**
 * Build information helper
 * Provides build metadata for deployment verification
 */

interface BuildInfo {
  version: string;
  timestamp: string;
  environment: string;
}

export function getBuildInfo(): BuildInfo {
  // Use environment variables injected at build time
  const version = import.meta.env.VITE_APP_VERSION || '1.0.0';
  const buildTime = import.meta.env.VITE_BUILD_TIME || new Date().toISOString();
  const environment = import.meta.env.MODE || 'production';

  return {
    version,
    timestamp: buildTime,
    environment,
  };
}

export function getBuildDisplayString(): string {
  const info = getBuildInfo();
  const date = new Date(info.timestamp);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `v${info.version} • ${formattedDate} ${formattedTime}`;
}
