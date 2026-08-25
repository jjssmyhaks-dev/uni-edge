import { NextResponse } from 'next/server';

/**
 * New Relic Browser Agent endpoint.
 * The browser monitoring snippet is injected via next.config.ts headers.
 * This route serves the agent config for client-side instrumentation.
 */
export async function GET() {
  return NextResponse.json({
    browser_agent: !!process.env.NEW_RELIC_BROWSER_LICENSE_KEY,
    agent_config: {
      applicationId: process.env.NEW_RELIC_BROWSER_APPLICATION_ID || '',
      licenseKey: process.env.NEW_RELIC_BROWSER_LICENSE_KEY || '',
    },
  });
}
