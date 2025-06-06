'use client'

import React, { useState } from 'react'

interface SlackConnection {
  isConnected: boolean
  teamName?: string
  botUserId?: string
  lastActivity?: Date
}

export default function SlackIntegration() {
  const [connection, setConnection] = useState<SlackConnection>({
    isConnected: false
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [testMessage, setTestMessage] = useState('')
  const [isSendingTest, setIsSendingTest] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setConnection({
        isConnected: true,
        teamName: 'Legal Firm Workspace',
        botUserId: 'U1234567890',
        lastActivity: new Date()
      })
    } catch (error) {
      console.error('Error connecting to Slack:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    setConnection({ isConnected: false })
  }

  const handleSendTest = async () => {
    if (!testMessage.trim()) return
    
    setIsSendingTest(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Test message sent successfully!')
      setTestMessage('')
    } catch (error) {
      console.error('Error sending test message:', error)
      alert('Failed to send test message')
    } finally {
      setIsSendingTest(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Slack Integration</h2>
        <p className="text-gray-600">
          Connect your Slack workspace to receive workflow notifications and interact with the AI agent
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Connection Status</h3>
            
            {!connection.isConnected ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">💬</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Not Connected
                </h4>
                <p className="text-gray-600 mb-6">
                  Connect your Slack workspace to start receiving notifications
                </p>
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting ? 'Connecting...' : 'Connect to Slack'}
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-green-600 font-medium">Connected</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Team:</span>
                    <span className="text-sm font-medium">{connection.teamName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bot User ID:</span>
                    <span className="text-sm font-mono">{connection.botUserId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Activity:</span>
                    <span className="text-sm">{connection.lastActivity?.toLocaleString()}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleDisconnect}
                  className="mt-4 w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>

          {connection.isConnected && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Test Connection</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Message
                  </label>
                  <textarea
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Enter a test message to send to Slack..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                <button
                  onClick={handleSendTest}
                  disabled={!testMessage.trim() || isSendingTest}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingTest ? 'Sending...' : 'Send Test Message'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Available Commands</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <code className="text-sm font-mono text-blue-600">/workflow</code>
                <p className="text-sm text-gray-600 mt-1">
                  Create or modify workflows using natural language
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Example: &quot;/workflow Create an H1B processing workflow&quot;
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <code className="text-sm font-mono text-blue-600">/email-setup</code>
                <p className="text-sm text-gray-600 mt-1">
                  Connect your Gmail account for email processing
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <code className="text-sm font-mono text-blue-600">/status</code>
                <p className="text-sm text-gray-600 mt-1">
                  Check the status of your workflows and integrations
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">High Priority Emails</p>
                  <p className="text-xs text-gray-500">Immediate notifications for urgent emails</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Workflow Completions</p>
                  <p className="text-xs text-gray-500">Notify when workflows finish processing</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Daily Summaries</p>
                  <p className="text-xs text-gray-500">Daily digest of workflow activity</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Error Alerts</p>
                  <p className="text-xs text-gray-500">Notifications for workflow errors</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
