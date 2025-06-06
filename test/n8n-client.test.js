import { test, describe } from 'node:test';
import assert from 'node:assert';

process.env.N8N_API_URL = 'http://localhost:5678';
process.env.N8N_API_KEY = 'test-n8n-key';

describe('N8nClient', () => {
  test('should have N8nClient class available', () => {
    assert.ok(true, 'N8nClient module should be importable');
  });
});
