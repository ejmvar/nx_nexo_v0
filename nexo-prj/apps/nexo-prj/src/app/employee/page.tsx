'use client';

import { useState } from 'react';
import {
  PortalHeader,
  PortalSidebar,
  getEmployeeMenuItems,
  LineChartComponent,
  BarChartComponent,
  KPICard,
  DataTable,
  DataTableColumn,
} from '@nexo-prj/shared-ui';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

export default function EmployeePortal() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuItems = getEmployeeMenuItems();

  const performanceData = [
    { name: 'Jan', value: 85 },
    { name: 'Feb', value: 88 },
    { name: 'Mar', value: 92 },
    { name: 'Apr', value: 90 },
    { name: 'May', value: 94 },
    { name: 'Jun', value: 96 },
  ];

  const tasksData = [
    { name: 'Completed', value: 45 },
    { name: 'In Progress', value: 12 },
    { name: 'Pending', value: 8 },
  ];

  const tasks: Task[] = [
    { id: '1', title: 'Complete Q1 Report', status: 'in-progress', priority: 'high', dueDate: '2026-01-25' },
    { id: '2', title: 'Review Team Feedback', status: 'pending', priority: 'medium', dueDate: '2026-01-27' },
    { id: '3', title: 'Update Project Documentation', status: 'in-progress', priority: 'low', dueDate: '2026-01-30' },
    { id: '4', title: 'Prepare Presentation', status: 'completed', priority: 'high', dueDate: '2026-01-20' },
  ];

  const taskColumns: DataTableColumn<Task>[] = [
    { id: 'title', header: 'Task', accessorKey: 'title' },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.original.status === 'completed' ? 'bg-green-100 text-green-800' :
          row.original.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {row.original.status}
        </span>
      )
    },
    {
      id: 'priority',
      header: 'Priority',
      accessorKey: 'priority',
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.original.priority === 'high' ? 'bg-red-100 text-red-800' :
          row.original.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.original.priority}
        </span>
      )
    },
    { id: 'dueDate', header: 'Due Date', accessorKey: 'dueDate' },
  ];

  const upcomingEvents = [
    { title: 'Team Meeting', time: 'Today, 2:00 PM', icon: '📅' },
    { title: 'Project Review', time: 'Tomorrow, 10:00 AM', icon: '📊' },
    { title: 'Training Session', time: 'Jan 25, 3:00 PM', icon: '📚' },
  ];

  const teamUpdates = [
    { message: 'New project assigned to your team', time: '1 hour ago', icon: '🎯' },
    { message: 'Team meeting rescheduled', time: '3 hours ago', icon: '📅' },
    { message: 'Performance review completed', time: '1 day ago', icon: '✅' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader
        title="Employee Portal"
        userName="Jane Employee"
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
          <h2 className="text-3xl font-bold text-gray-900">My Dashboard</h2>
          <p className="text-gray-600">Track your tasks, performance, and team updates.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Tasks Completed"
            value="45"
            subtitle="This month"
            icon={<span className="text-4xl">✅</span>}
            change={12}
          />
          <KPICard
            title="Active Projects"
            value="8"
            subtitle="In progress"
            icon={<span className="text-4xl">📊</span>}
            change={-5}
          />
          <KPICard
            title="Team Members"
            value="15"
            subtitle="In your team"
            icon={<span className="text-4xl">👥</span>}
            change={0}
          />
          <KPICard
            title="Performance"
            value="96%"
            subtitle="Average rating"
            icon={<span className="text-4xl">⭐</span>}
            change={8}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <LineChartComponent title="Performance Over Time" data={performanceData} />
          <BarChartComponent title="Task Distribution" data={tasksData} />
        </div>

        <div className="mb-8">
          <DataTable
            title="My Tasks"
            data={tasks}
            columns={taskColumns}
            enableRowSelection={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>📅</span>
              Upcoming Events
            </h3>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-2xl">{event.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold">{event.title}</h4>
                    <p className="text-sm text-gray-600">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>📢</span>
              Team Updates
            </h3>
            <div className="space-y-4">
              {teamUpdates.map((update, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-2xl">{update.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{update.message}</p>
                    <p className="text-xs text-gray-500">{update.time}</p>
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
