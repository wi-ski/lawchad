'use client'

import React, { useState } from 'react'

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: string
}

interface CustomWorkflow {
  id: string
  name: string
  description: string
  isActive: boolean
  lastModified: Date
}

export default function WorkflowBuilder() {
  const [activeTab, setActiveTab] = useState<'templates' | 'custom' | 'create'>('templates')
  const [customWorkflows, setCustomWorkflows] = useState<CustomWorkflow[]>([
    {
      id: '1',
      name: 'BigCorp Contract Processing',
      description: 'Custom workflow for BigCorp contract reviews with expedited approval',
      isActive: true,
      lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      name: 'Immigration Priority Queue',
      description: 'H1B cases with priority handling for tech companies',
      isActive: true,
      lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ])

  const templates: WorkflowTemplate[] = [
    {
      id: 'contract_review',
      name: 'Contract Review Workflow',
      description: 'Automated contract review and approval workflow with value-based routing',
      category: 'Corporate',
      icon: '📄'
    },
    {
      id: 'immigration_case',
      name: 'Immigration Case Management',
      description: 'H1B, L1, and O1 visa case management with priority handling',
      category: 'Immigration',
      icon: '🛂'
    },
    {
      id: 'litigation_support',
      name: 'Litigation Support Workflow',
      description: 'Court deadline tracking and litigation document management',
      category: 'Litigation',
      icon: '⚖️'
    },
    {
      id: 'corporate_compliance',
      name: 'Corporate Compliance Workflow',
      description: 'SEC reporting and regulatory compliance management',
      category: 'Compliance',
      icon: '📊'
    },
    {
      id: 'real_estate',
      name: 'Real Estate Transaction Workflow',
      description: 'Property transaction and closing coordination',
      category: 'Real Estate',
      icon: '🏠'
    }
  ]

  const handleCreateFromTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      const newWorkflow: CustomWorkflow = {
        id: Date.now().toString(),
        name: `${template.name} - Custom`,
        description: `Custom workflow based on ${template.name}`,
        isActive: false,
        lastModified: new Date()
      }
      setCustomWorkflows([...customWorkflows, newWorkflow])
      setActiveTab('custom')
    }
  }

  const handleToggleWorkflow = (workflowId: string) => {
    setCustomWorkflows(customWorkflows.map(workflow => 
      workflow.id === workflowId 
        ? { ...workflow, isActive: !workflow.isActive }
        : workflow
    ))
  }

  const handleDeleteWorkflow = (workflowId: string) => {
    setCustomWorkflows(customWorkflows.filter(workflow => workflow.id !== workflowId))
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Workflow Builder</h2>
        <p className="text-gray-600">
          Create and manage automated workflows for legal document processing
        </p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'templates', name: 'Templates', icon: '📋' },
            { id: 'custom', name: 'My Workflows', icon: '⚙️' },
            { id: 'create', name: 'Create New', icon: '➕' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'templates' | 'custom' | 'create')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3">{template.icon}</div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                  <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    {template.category}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{template.description}</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleCreateFromTemplate(template.id)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  Use Template
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'custom' && (
        <div className="space-y-4">
          {customWorkflows.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚙️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Custom Workflows</h3>
              <p className="text-gray-600 mb-6">
                Create your first custom workflow from a template or start from scratch
              </p>
              <button
                onClick={() => setActiveTab('templates')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Browse Templates
              </button>
            </div>
          ) : (
            customWorkflows.map((workflow) => (
              <div key={workflow.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-medium text-gray-900 mr-3">{workflow.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        workflow.isActive 
                          ? 'text-green-600 bg-green-100' 
                          : 'text-gray-600 bg-gray-100'
                      }`}>
                        {workflow.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{workflow.description}</p>
                    <p className="text-xs text-gray-500">
                      Last modified: {workflow.lastModified.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleWorkflow(workflow.id)}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        workflow.isActive
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {workflow.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteWorkflow(workflow.id)}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Create Custom Workflow</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workflow Name
                </label>
                <input
                  type="text"
                  placeholder="Enter workflow name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Describe what this workflow does..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Natural Language Instructions
                </label>
                <textarea
                  placeholder="Describe your workflow in plain English. For example: 'When I receive an email about H1B visas, assign it to Sarah and notify the team in Slack...'"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The AI agent will convert your instructions into a working workflow
                </p>
              </div>
              
              <div className="flex space-x-4">
                <button className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  Generate Workflow
                </button>
                <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Save Draft
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips for Better Workflows</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be specific about email triggers (keywords, senders, attachments)</li>
              <li>• Define clear routing rules (who gets what type of case)</li>
              <li>• Include notification preferences (Slack channels, urgency levels)</li>
              <li>• Mention any special handling for high-value or urgent matters</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
