import { test, describe } from 'node:test';
import assert from 'node:assert';
import { GmailOAuth } from '../lib/gmail/GmailOAuth.ts';

describe('GmailOAuth', () => {
  let gmailOAuth;

  test('should initialize GmailOAuth', () => {
    gmailOAuth = new GmailOAuth();
    assert.ok(gmailOAuth, 'GmailOAuth should be initialized');
  });

  test('should generate auth URL', async () => {
    gmailOAuth = new GmailOAuth();
    
    const result = await gmailOAuth.generateAuthUrl('attorney-1');
    
    assert.ok(typeof result === 'string', 'Should return auth URL string');
    assert.ok(result.includes('accounts.google.com'), 'Should contain Google OAuth URL');
  });

  test('should handle auth callback', async () => {
    gmailOAuth = new GmailOAuth();
    
    const result = await gmailOAuth.handleAuthCallback('test-code', 'test-state');
    
    assert.ok(result.success !== undefined, 'Should return result with success property');
  });
});
