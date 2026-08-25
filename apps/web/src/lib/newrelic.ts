import newrelic from 'newrelic';

/**
 * New Relic instrumentation for Next.js App Router.
 * Import this in the root layout to ensure the agent is loaded early.
 * The actual agent initialization is handled by newrelic.js config.
 */
export function initNewRelic() {
  if (process.env.NEW_RELIC_LICENSE_KEY) {
    newrelic.addCustomAttribute('app', 'uni-edge-web');
    console.log('✅ New Relic agent initialized');
  }
}
