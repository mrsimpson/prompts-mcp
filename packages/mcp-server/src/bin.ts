#!/usr/bin/env node
/**
 * CLI entry point for MCP Prompts Server
 * 
 * This is the main executable that users will run to start the server.
 */

import { startServer } from './index.js';
import { createLogger } from './utils/logger.js';

const logger = createLogger('CLI');

// Start the server
startServer().catch((error: Error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
