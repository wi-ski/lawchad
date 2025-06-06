'use client'

import React, { useState } from 'react'

interface GmailAccount {
  email: string
  isConnected: boolean
  lastSync?: Date
  unreadCount?: number
  processedToday?: number
}

export default function GmailIntegration() {
  const [accounts, setAccounts] = useState<GmailAccount[]>([
    {
      email: 'john.doe@lawfirm.com',
      isConnected: true,
      lastSync: new Date(Date.now() - 5 * 60 * 1000),
      unreadCount: 12,
      processedToday: 8
    }
  ])
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnectGmail = async () => {
    setIsConnecting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      window.open('/api/gmail/oauth?user_id=current_user&channel_id=general', '_blank')
    } catch (error) {
      console.error('Error connecting Gmail:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnectAccount = (email: string) => {
    setAccounts(accounts.filter(account => account.email !== email))
  }

  const handleSyncNow = async (email: string) => {
    const updatedAccounts = accounts.map(account => 
      account.email === email 
        ? { ...account, lastSync: new Date() }
        : account
    )
    setAccounts(updatedAccounts)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gmail Integration</h2>
        <p className="text-gray-600">
          Connect Gmail accounts to automatically process and route legal emails
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Connected Accounts</h3>
              <button
                onClick={handleConnectGmail}
                disabled={isConnecting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isConnecting ? 'Connecting...' : '+ Add Account'}
              </button>
            </div>

            {accounts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📧</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No Accounts Connected
                </h4>
                <p className="text-gray-600 mb-6">
                  Connect your Gmail account to start processing emails automatically
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div key={account.email} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          account.isConnected ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className="font-medium text-gray-900">{account.email}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSyncNow(account.email)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Sync Now
                        </button>
                        <button
                          onClick={() => handleDisconnectAccount(account.email)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Unread</p>
                        <p className="font-medium">{account.unreadCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Processed Today</p>
                        <p className="font-medium">{account.processedToday || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Sync</p>
                        <p className="font-medium">
                          {account.lastSync ? account.lastSync.toLocaleTimeString() : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Processing Rules</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Contract Reviews</h4>
                  <span className="px-2 py-1 text-xs font-medium rounded-full text-green-600 bg-green-100">
                    Active
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Emails containing &quot;contract&quot; with PDF attachments → Senior Partner
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Immigration Cases</h4>
                  <span className="px-2 py-1 text-xs font-medium rounded-full text-green-600 bg-green-100">
                    Active
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  H1B, L1, O1 visa emails → Immigration Specialist
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Urgent Matters</h4>
                  <span className="px-2 py-1 text-xs font-medium rounded-full text-green-600 bg-green-100">
                    Active
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Emails marked urgent or with court deadlines → Immediate escalation
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Email Processing Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Processed</span>
                <span className="text-lg font-bold text-gray-900">247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Auto-Routed</span>
                <span className="text-lg font-bold text-green-600">198</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Manual Review</span>
                <span className="text-lg font-bold text-orange-600">49</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Processing Errors</span>
                <span className="text-lg font-bold text-red-600">0</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Security & Permissions</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">OAuth2 Authentication</p>
                  <p className="text-xs text-gray-500">Secure token-based access</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full text-green-600 bg-green-100">
                  ✓ Enabled
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Read-Only Access</p>
                  <p className="text-xs text-gray-500">Cannot modify or delete emails</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full text-green-600 bg-green-100">
                  ✓ Enabled
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Encrypted Storage</p>
                  <p className="text-xs text-gray-500">All tokens encrypted at rest</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full text-green-600 bg-green-100">
                  ✓ Enabled
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Auto Token Refresh</p>
                  <p className="text-xs text-gray-500">Maintains connection automatically</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full text-green-600 bg-green-100">
                  ✓ Enabled
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-600">Contract email processed</span>
                <span className="ml-auto text-gray-400">2 min ago</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-600">H1B case auto-assigned</span>
                <span className="ml-auto text-gray-400">5 min ago</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                <span className="text-gray-600">Urgent email escalated</span>
                <span className="ml-auto text-gray-400">12 min ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
