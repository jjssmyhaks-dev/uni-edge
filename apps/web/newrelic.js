/**
 * New Relic Agent Configuration for Uni-Edge Web (Next.js)
 *
 * This file is loaded by the newrelic agent at startup.
 * See: https://docs.newrelic.com/docs/apm/agents/nodejs-agent/installation-configuration/nodejs-agent-configuration/
 */
exports.config = {
  app_name: ['uni-edge-web'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY || '',
  logging: {
    level: 'info',
    forwarding: { enabled: true },
  },
  allow_all_headers: true,
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*',
    ],
  },
  browser_monitoring: {
    enable: true,
    auto_instrument: true,
  },
 distributed_tracing: {
    enabled: true,
  },
  cross_application_tracer: {
    enabled: true,
  },
};
