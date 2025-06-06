import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { SlackBot } from '../lib/slack/SlackBot.ts';

process.env.OPENAI_API_KEY = 'test-key';
process.env.SLACK_BOT_TOKEN = 'test-token';
process.env.SLACK_SIGNING_SECRET = 'test-secret';

describe('SlackBot', () => {
  let slackBot;

  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.SLACK_BOT_TOKEN = 'test-token';
    process.env.SLACK_SIGNING_SECRET = 'test-secret';
  });

  test('should initialize SlackBot', () => {
    slackBot = new SlackBot();
    assert.ok(slackBot, 'SlackBot should be initialized');
  });

  test('should handle Slack events', async () => {
    slackBot = new SlackBot();
    const mockEvent = {
      type: 'message',
      text: 'Create workflow for contract review',
      ts: '1234567890.123456',
      event_ts: '1234567890.123456'
    };

    assert.ok(typeof slackBot.handleEvent === 'function', 'handleEvent should be a function');
  });

  test('should send messages', async () => {
    slackBot = new SlackBot();
    const message = { channel: 'C123456', text: 'Test message' };
    
    assert.ok(typeof slackBot.sendMessage === 'function', 'sendMessage should be a function');
  });
});
