/**
 * New Relic Agent Configuration for Uni-Edge API (Express)
 */
exports.config = {
  app_name: ['uni-edge-api'],
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
  distributed_tracing: {
    enabled: true,
  },
  cross_application_tracer: {
    enabled: true,
  },
  agent_started: {
    config: {
      enabled: true,
    },
  },
};
