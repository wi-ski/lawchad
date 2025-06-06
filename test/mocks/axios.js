export default {
  create: () => ({
    get: async (url) => ({ data: { status: 'ok' } }),
    post: async (url, data) => ({ 
      data: { 
        success: true, 
        id: 'workflow-123',
        executionId: 'exec-456'
      } 
    }),
    put: async (url, data) => ({ data: { success: true } }),
    delete: async (url) => ({ data: { success: true } })
  }),
  get: async (url) => ({ data: { status: 'ok' } }),
  post: async (url, data) => ({ 
    data: { 
      success: true, 
      id: 'workflow-123',
      executionId: 'exec-456'
    } 
  })
};
