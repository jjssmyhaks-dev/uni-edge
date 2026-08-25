import type { NextConfig } from 'next';

const newRelicBrowserKey = process.env.NEW_RELIC_BROWSER_LICENSE_KEY || '';
const newRelicAppId = process.env.NEW_RELIC_BROWSER_APPLICATION_ID || '';

const nextConfig: NextConfig = {
  transpilePackages: ['@uni-edge/types'],

  // New Relic Browser Agent — inject via custom headers
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js-agent.newrelic.com https://bam.nr-data.net https://*.clerk.accounts.dev https://challenges.cloudflare.com`,
            `connect-src 'self' https://bam.nr-data.net https://collector.newrelic.com https://gov-session-collector.newrelic.com https://*.clerk.accounts.dev https://clerk.telemetry.sentry.io`,
            `img-src 'self' data: https://*.clerk.accounts.dev https://*.clerk.dev https://img.clerk.com https://bam.nr-data.net`,
            `style-src 'self' 'unsafe-inline'`,
            `frame-src 'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com`,
            `worker-src 'self' blob:`,
            `font-src 'self' https://*.clerk.accounts.dev data:`,
          ].join('; '),
        },
      ],
    },
  ],

  // Sentry is removed — using New Relic for observability
  // See: https://docs.newrelic.com/docs/apm/agents/nodejs-agent/installation-configuration/nodejs-agent-configuration/
};

export default nextConfig;
