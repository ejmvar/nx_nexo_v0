'use client';

import { useState } from 'react';
import {
  PortalHeader,
  PortalSidebar,
  getClientMenuItems,
  PieChartComponent,
  AreaChartComponent,
  KPICard,
  DataTable,
  DataTableColumn,
} from '../../shared-ui/lib/portal-components';

export const dynamic = 'force-dynamic';

interface Project {
  id: string;
  name: string;
  status: 'planning' | 'in-progress' | 'completed';
  progress: number;
  budget: string;
  deadline: string;
}

export default function ClientPortal() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuItems = getClientMenuItems();

  const budgetData = [
    { name: 'Development', value: 45000, fill: '#2196f3' },
    { name: 'Design', value: 25000, fill: '#4caf50' },
    { name: 'Marketing', value: 15000, fill: '#ff9800' },
    { name: 'Operations', value: 15000, fill: '#9c27b0' },
  ];

  const revenueData = [
    { name: 'Q1', value: 120000 },
    { name: 'Q2', value: 145000 },
    { name: 'Q3', value: 165000 },
    { name: 'Q4', value: 185000 },
  ];

  const projects: Project[] = [
    { id: '1', name: 'Website Redesign', status: 'in-progress', progress: 65, budget: '$45,000', deadline: '2026-03-15' },
    { id: '2', name: 'Mobile App', status: 'planning', progress: 20, budget: '$85,000', deadline: '2026-06-30' },
    { id: '3', name: 'Marketing Campaign', status: 'in-progress', progress: 80, budget: '$25,000', deadline: '2026-02-28' },
    { id: '4', name: 'CRM Integration', status: 'completed', progress: 100, budget: '$35,000', deadline: '2026-01-15' },
  ];

  const projectColumns: DataTableColumn<Project>[] = [
    { id: 'name', header: 'Project Name', accessorKey: 'name' },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.original.status === 'completed' ? 'bg-green-100 text-green-800' :
          row.original.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.original.status}
        </span>
      )
    },
    {
      id: 'progress',
      header: 'Progress',
      accessorKey: 'progress',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${row.original.progress}%` }}
            />
          </div>
          <span className="text-sm text-gray-600">{row.original.progress}%</span>
        </div>
      )
    },
    { id: 'budget', header: 'Budget', accessorKey: 'budget' },
    { id: 'deadline', header: 'Deadline', accessorKey: 'deadline' },
  ];

  const recentActivity = [
    { icon: '📋', text: 'Project milestone completed', time: '2 hours ago' },
    { icon: '💬', text: 'New message from team', time: '5 hours ago' },
    { icon: '📊', text: 'Weekly report generated', time: '1 day ago' },
    { icon: '✅', text: 'Invoice approved', time: '2 days ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader
        title="Client Portal"
        userName="John Client"
        onLogout={() => console.log('Logout')}
        showBackButton={true}
        backHref="/"
      />

      <PortalSidebar
        menuItems={menuItems}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed left-4 top-20 z-30 bg-primary text-white p-2 rounded-md shadow-lg hover:bg-primary/90"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <main className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600">Welcome back! Here's what's happening with your projects.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Active Projects"
            value="12"
            subtitle="3 completed this month"
            icon={<span className="text-4xl">📊</span>}
            change={15}
          />
          <KPICard
            title="Total Budget"
            value="$190K"
            subtitle="Across all projects"
            icon={<span className="text-4xl">💰</span>}
            change={8}
          />
          <KPICard
            title="Team Members"
            value="24"
            subtitle="Active collaborators"
            icon={<span className="text-4xl">👥</span>}
            change={12}
          />
          <KPICard
            title="Completion Rate"
            value="87%"
            subtitle="On-time delivery"
            icon={<span className="text-4xl">✅</span>}
            change={5}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PieChartComponent title="Budget Distribution" data={budgetData} />
          <AreaChartComponent title="Revenue Trends" data={revenueData} />
        </div>

        <div className="mb-8">
          <DataTable
            title="Active Projects"
            data={projects}
            columns={projectColumns}
            enableRowSelection={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Project Timeline</h3>
            <div className="space-y-4">
              {projects.slice(0, 3).map((project) => (
                <div key={project.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{project.name}</h4>
                      <p className="text-sm text-gray-600">Due: {project.deadline}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      project.status === 'completed' ? 'bg-green-100 text-green-800' :
                      project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-2xl">{activity.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.text}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
