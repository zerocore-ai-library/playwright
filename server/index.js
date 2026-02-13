/**
 * Playwright MCPB entry point.
 *
 * This bundle vendors the official Playwright MCP package code under
 * `server/playwright-mcp/` and executes its CLI entrypoint.
 */

'use strict';

for (const key of [
  'PLAYWRIGHT_MCP_BROWSER',
  'PLAYWRIGHT_MCP_CAPS',
  'PLAYWRIGHT_MCP_HEADLESS',
  'PLAYWRIGHT_MCP_ISOLATED',
  'PLAYWRIGHT_MCP_IMAGE_RESPONSES',
  'PLAYWRIGHT_MCP_OUTPUT_DIR',
  'PLAYWRIGHT_MCP_SAVE_TRACE',
]) {
  if (process.env[key] === '') delete process.env[key];
}

require('./playwright-mcp/cli.js');
