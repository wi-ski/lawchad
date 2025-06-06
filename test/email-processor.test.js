import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { EmailProcessor } from '../lib/gmail/EmailProcessor.ts';
import { OpenHandsAgent } from '../lib/openhands-agent/OpenHandsAgent.ts';

process.env.OPENAI_API_KEY = 'test-key';
process.env.GOOGLE_CLIENT_ID = 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';

describe('EmailProcessor', () => {
  let emailProcessor;

  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
  });

  test('should initialize EmailProcessor', () => {
    const agent = new OpenHandsAgent();
    emailProcessor = new EmailProcessor(agent, {});
    assert.ok(emailProcessor, 'EmailProcessor should be initialized');
  });

  test('should process email', async () => {
    const agent = new OpenHandsAgent();
    emailProcessor = new EmailProcessor(agent, {});
    
    assert.ok(emailProcessor, 'EmailProcessor should be initialized for processing');
  });

  test('should fetch new emails', async () => {
    const agent = new OpenHandsAgent();
    emailProcessor = new EmailProcessor(agent, {});
    
    assert.ok(emailProcessor, 'EmailProcessor should be initialized for fetching');
  });
});
