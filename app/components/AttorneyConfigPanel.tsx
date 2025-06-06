'use client';

import React, { useState, useEffect } from 'react';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
}

interface AttorneyConfig {
  id: string;
  name: string;
  email: string;
  department: string;
  permissions: string[];
  activeWorkflows: string[];
}

export default function AttorneyConfigPanel() {
  const [attorneys, setAttorneys] = useState<AttorneyConfig[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedAttorney, setSelectedAttorney] = useState<AttorneyConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAttorneys();
    loadTemplates();
  }, []);

  const loadAttorneys = async () => {
    try {
      setAttorneys([
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@firm.com',
          department: 'Immigration',
          permissions: ['create_workflows', 'manage_cases', 'approve_documents'],
          activeWorkflows: ['immigration-case-template', 'document-review-template']
        },
        {
          id: '2',
          name: 'Michael Chen',
          email: 'michael.chen@firm.com',
          department: 'Corporate',
          permissions: ['create_workflows', 'manage_contracts'],
          activeWorkflows: ['contract-review-template']
        }
      ]);
    } catch (error) {
      console.error('Error loading attorneys:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      setTemplates([
        {
          id: 'immigration-case-template',
          name: 'Immigration Case Processing',
          description: 'Automated workflow for processing immigration cases',
          category: 'Immigration',
          isActive: true
        },
        {
          id: 'contract-review-template',
          name: 'Contract Review',
          description: 'Automated contract review and approval workflow',
          category: 'Corporate',
          isActive: true
        },
        {
          id: 'document-review-template',
          name: 'Document Review',
          description: 'General document review and processing',
          category: 'General',
          isActive: true
        }
      ]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading templates:', error);
      setIsLoading(false);
    }
  };

  const updateAttorneyWorkflows = async (attorneyId: string, workflowIds: string[]) => {
    try {
      setAttorneys(prev => prev.map(attorney => 
        attorney.id === attorneyId 
          ? { ...attorney, activeWorkflows: workflowIds }
          : attorney
      ));
    } catch (error) {
      console.error('Error updating attorney workflows:', error);
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
          Attorney Configuration Panel
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Attorneys</h4>
            <div className="space-y-3">
              {attorneys.map((attorney) => (
                <div
                  key={attorney.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAttorney?.id === attorney.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedAttorney(attorney)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium text-gray-900">{attorney.name}</h5>
                      <p className="text-sm text-gray-500">{attorney.email}</p>
                      <p className="text-sm text-gray-500">{attorney.department} Department</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {attorney.activeWorkflows.length} workflows
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            {selectedAttorney ? (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Configure Workflows for {selectedAttorney.name}
                </h4>
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{template.name}</h5>
                        <p className="text-sm text-gray-500">{template.description}</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                          {template.category}
                        </span>
                      </div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedAttorney.activeWorkflows.includes(template.id)}
                          onChange={(e) => {
                            const newWorkflows = e.target.checked
                              ? [...selectedAttorney.activeWorkflows, template.id]
                              : selectedAttorney.activeWorkflows.filter(id => id !== template.id);
                            updateAttorneyWorkflows(selectedAttorney.id, newWorkflows);
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {selectedAttorney.activeWorkflows.includes(template.id) ? 'Active' : 'Inactive'}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h5 className="font-medium text-gray-900 mb-2">Permissions</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedAttorney.permissions.map((permission) => (
                      <span
                        key={permission}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {permission.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Select an attorney to configure their workflows</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
