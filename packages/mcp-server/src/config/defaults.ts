/**
 * Default configuration values
 */

import type { ServerConfig } from './types.js';

export const DEFAULT_CONFIG: ServerConfig = {
  httpPort: 3000,
  logLevel: 'info',
  enableStdio: true,
  enableHttp: false, // HTTP must be explicitly enabled
};

export const DEFAULT_HTTP_PORT = 3000;
export const MIN_PORT = 1024;
export const MAX_PORT = 65535;
