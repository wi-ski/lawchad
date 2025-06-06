'use client';

import React, { useState, useEffect } from 'react';

interface WorkflowExecution {
  id: string;
  workflowName: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  startTime: Date;
  endTime?: Date;
  attorney: string;
  triggerType: 'email' | 'slack' | 'manual';
  progress: number;
  steps: WorkflowStep[];
}

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  output?: string;
}

export default function WorkflowMonitor() {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExecutions();
    const interval = setInterval(loadExecutions, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadExecutions = async () => {
    try {
      setExecutions([
        {
          id: '1',
          workflowName: 'Immigration Case Processing',
          status: 'running',
          startTime: new Date(Date.now() - 300000),
          attorney: 'Sarah Johnson',
          triggerType: 'email',
          progress: 65,
          steps: [
            { id: '1', name: 'Email Analysis', status: 'completed', duration: 2000 },
            { id: '2', name: 'Document Extraction', status: 'completed', duration: 5000 },
            { id: '3', name: 'Case Classification', status: 'running' },
            { id: '4', name: 'Attorney Assignment', status: 'pending' },
            { id: '5', name: 'Notification Sending', status: 'pending' }
          ]
        },
        {
          id: '2',
          workflowName: 'Contract Review',
          status: 'completed',
          startTime: new Date(Date.now() - 900000),
          endTime: new Date(Date.now() - 300000),
          attorney: 'Michael Chen',
          triggerType: 'slack',
          progress: 100,
          steps: [
            { id: '1', name: 'Contract Upload', status: 'completed', duration: 1000 },
            { id: '2', name: 'Legal Analysis', status: 'completed', duration: 15000 },
            { id: '3', name: 'Risk Assessment', status: 'completed', duration: 8000 },
            { id: '4', name: 'Approval Workflow', status: 'completed', duration: 12000 }
          ]
        },
        {
          id: '3',
          workflowName: 'Document Review',
          status: 'failed',
          startTime: new Date(Date.now() - 1200000),
          endTime: new Date(Date.now() - 1000000),
          attorney: 'Sarah Johnson',
          triggerType: 'manual',
          progress: 30,
          steps: [
            { id: '1', name: 'Document Upload', status: 'completed', duration: 2000 },
            { id: '2', name: 'Content Analysis', status: 'failed', output: 'Error: Unable to parse document format' },
            { id: '3', name: 'Legal Review', status: 'pending' }
          ]
        }
      ]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading executions:', error);
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'email': return '📧';
      case 'slack': return '💬';
      case 'manual': return '👤';
      default: return '⚡';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Workflow Monitor
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Active & Recent Executions</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {executions.map((execution) => (
                <div
                  key={execution.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedExecution?.id === execution.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedExecution(execution)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getTriggerIcon(execution.triggerType)}</span>
                      <h5 className="font-medium text-gray-900">{execution.workflowName}</h5>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(execution.status)}`}>
                      {execution.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-2">Attorney: {execution.attorney}</p>
                  
                  {execution.status === 'running' && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${execution.progress}%` }}
                      ></div>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-2">
                    Started: {execution.startTime.toLocaleTimeString()}
                    {execution.endTime && ` • Ended: ${execution.endTime.toLocaleTimeString()}`}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            {selectedExecution ? (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Execution Details: {selectedExecution.workflowName}
                </h4>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedExecution.status)}`}>
                        {selectedExecution.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Progress:</span>
                      <span className="ml-2 text-gray-900">{selectedExecution.progress}%</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Attorney:</span>
                      <span className="ml-2 text-gray-900">{selectedExecution.attorney}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Trigger:</span>
                      <span className="ml-2 text-gray-900">{selectedExecution.triggerType}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Workflow Steps</h5>
                  <div className="space-y-3">
                    {selectedExecution.steps.map((step, index) => (
                      <div key={step.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            step.status === 'completed' ? 'bg-green-100 text-green-800' :
                            step.status === 'running' ? 'bg-blue-100 text-blue-800' :
                            step.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">{step.name}</p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(step.status)}`}>
                              {step.status}
                            </span>
                          </div>
                          {step.duration && (
                            <p className="text-xs text-gray-500">Duration: {(step.duration / 1000).toFixed(1)}s</p>
                          )}
                          {step.output && (
                            <p className="text-xs text-red-600 mt-1">{step.output}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Select an execution to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
