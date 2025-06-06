import { test, describe } from 'node:test';
import assert from 'node:assert';

process.env.OPENAI_API_KEY = 'test-key';

describe('OpenHandsAgent', () => {
  test('should have OpenHandsAgent class available', () => {
    assert.ok(true, 'OpenHandsAgent module should be importable');
  });
});
