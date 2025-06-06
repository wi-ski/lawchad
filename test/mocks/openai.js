export class OpenAI {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.OPENAI_API_KEY || 'test-key';
  }

  chat = {
    completions: {
      create: async (params) => {
        return {
          choices: [{
            message: {
              content: JSON.stringify({
                success: true,
                changes: ['Added PDF extraction step'],
                workflowId: 'workflow-123'
              })
            }
          }]
        };
      }
    }
  };
}
