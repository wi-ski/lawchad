'use client'

import React, { useState, useEffect } from 'react'

interface WorkflowStats {
  totalWorkflows: number
  activeWorkflows: number
  emailsProcessed: number
  pendingReviews: number
}

interface RecentActivity {
  id: string
  type: string
  description: string
  timestamp: Date
  status: 'completed' | 'pending' | 'failed'
}

export default function WorkflowDashboard() {
  const [stats, setStats] = useState<WorkflowStats>({
    totalWorkflows: 0,
    activeWorkflows: 0,
    emailsProcessed: 0,
    pendingReviews: 0
  })
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setStats({
        totalWorkflows: 12,
        activeWorkflows: 8,
        emailsProcessed: 247,
        pendingReviews: 5
      })

      setRecentActivity([
        {
          id: '1',
          type: 'email_processed',
          description: 'Contract review email from BigCorp processed',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          status: 'completed'
        },
        {
          id: '2',
          type: 'workflow_triggered',
          description: 'Immigration H1B workflow triggered for new case',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          status: 'pending'
        },
        {
          id: '3',
          type: 'notification_sent',
          description: 'Slack notification sent to senior partner',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          status: 'completed'
        }
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email_processed':
        return '📧'
      case 'workflow_triggered':
        return '⚙️'
      case 'notification_sent':
        return '🔔'
      default:
        return '📋'
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
          <div className="bg-gray-200 h-64 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <div className="text-2xl mr-3">📊</div>
            <div>
              <p className="text-sm font-medium text-blue-600">Total Workflows</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalWorkflows}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center">
            <div className="text-2xl mr-3">✅</div>
            <div>
              <p className="text-sm font-medium text-green-600">Active Workflows</p>
              <p className="text-2xl font-bold text-green-900">{stats.activeWorkflows}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <div className="text-2xl mr-3">📧</div>
            <div>
              <p className="text-sm font-medium text-purple-600">Emails Processed</p>
              <p className="text-2xl font-bold text-purple-900">{stats.emailsProcessed}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center">
            <div className="text-2xl mr-3">⏳</div>
            <div>
              <p className="text-sm font-medium text-orange-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-orange-900">{stats.pendingReviews}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-xl mr-3">{getActivityIcon(activity.type)}</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activity.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <span className="text-xl mr-3">➕</span>
                <span className="font-medium">Create New Workflow</span>
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <span className="text-xl mr-3">🔗</span>
                <span className="font-medium">Connect Gmail Account</span>
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <span className="text-xl mr-3">💬</span>
                <span className="font-medium">Setup Slack Integration</span>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">OpenHands Agent</span>
              <span className="px-2 py-1 text-xs font-medium rounded-full text-green-600 bg-green-100">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">N8n Workflows</span>
              <span className="px-2 py-1 text-xs font-medium rounded-full text-green-600 bg-green-100">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Slack Bot</span>
              <span className="px-2 py-1 text-xs font-medium rounded-full text-yellow-600 bg-yellow-100">
                Pending Setup
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Gmail Integration</span>
              <span className="px-2 py-1 text-xs font-medium rounded-full text-yellow-600 bg-yellow-100">
                Pending Setup
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
