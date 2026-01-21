'use client';

import { useState } from 'react';
import {
  PortalHeader,
  PortalSidebar,
  getProfessionalMenuItems,
  LineChartComponent,
  PieChartComponent,
  KPICard,
  DataTable,
  DataTableColumn,
} from '../../shared-ui/lib/portal-components';
export const dynamic = 'force-dynamic';
interface Assignment {
  id: string;
  client: string;
  project: string;
  status: 'active' | 'pending' | 'completed';
  hours: number;
  rate: string;
}

export default function ProfessionalPortal() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuItems = getProfessionalMenuItems();

  const earningsData = [
    { name: 'Jan', value: 5200 },
    { name: 'Feb', value: 6100 },
    { name: 'Mar', value: 5800 },
    { name: 'Apr', value: 7200 },
    { name: 'May', value: 6900 },
    { name: 'Jun', value: 8100 },
  ];

  const projectTypeData = [
    { name: 'Development', value: 45, fill: '#3b82f6' },
    { name: 'Consulting', value: 30, fill: '#10b981' },
    { name: 'Design', value: 15, fill: '#f59e0b' },
    { name: 'Other', value: 10, fill: '#6366f1' },
  ];

  const assignments: Assignment[] = [
    { id: '1', client: 'Acme Corp', project: 'Web Development', status: 'active', hours: 120, rate: '$85/hr' },
    { id: '2', client: 'TechStart', project: 'Mobile App', status: 'active', hours: 80, rate: '$95/hr' },
    { id: '3', client: 'Enterprise Co', project: 'Consulting', status: 'pending', hours: 40, rate: '$120/hr' },
    { id: '4', client: 'StartupXYZ', project: 'UI/UX Design', status: 'completed', hours: 60, rate: '$80/hr' },
  ];

  const assignmentColumns: DataTableColumn<Assignment>[] = [
    { id: 'client', header: 'Client', accessorKey: 'client' },
    { id: 'project', header: 'Project', accessorKey: 'project' },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.original.status === 'completed' ? 'bg-green-100 text-green-800' :
          row.original.status === 'active' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {row.original.status}
        </span>
      )
    },
    {
      id: 'hours',
      header: 'Hours',
      accessorKey: 'hours',
      cell: ({ row }) => `${row.original.hours}h`
    },
    { id: 'rate', header: 'Rate', accessorKey: 'rate' },
  ];

  const certifications = [
    { name: 'AWS Certified Solutions Architect', status: 'Active', expiry: '2026-12-31', icon: '🏆' },
    { name: 'Project Management Professional', status: 'Active', expiry: '2027-06-30', icon: '📜' },
    { name: 'Certified Scrum Master', status: 'Expiring Soon', expiry: '2026-02-28', icon: '⚠️' },
  ];

  const recentClients = [
    { name: 'Acme Corporation', projects: 5, rating: 4.9, icon: '🏢' },
    { name: 'TechStart Inc', projects: 3, rating: 5.0, icon: '💼' },
    { name: 'Enterprise Solutions', projects: 7, rating: 4.8, icon: '🏭' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader
        title="Professional Portal"
        userName="Alex Professional"
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
          <h2 className="text-3xl font-bold text-gray-900">Professional Dashboard</h2>
          <p className="text-gray-600">Manage your assignments, clients, and professional growth.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Active Assignments"
            value="5"
            subtitle="2 starting soon"
            icon={<span className="text-4xl">💼</span>}
            change={20}
          />
          <KPICard
            title="Monthly Earnings"
            value="$8,100"
            subtitle="This month"
            icon={<span className="text-4xl">💰</span>}
            change={15}
          />
          <KPICard
            title="Total Clients"
            value="18"
            subtitle="Active relationships"
            icon={<span className="text-4xl">👥</span>}
            change={12}
          />
          <KPICard
            title="Avg Rating"
            value="4.9"
            subtitle="Client satisfaction"
            icon={<span className="text-4xl">⭐</span>}
            change={3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <LineChartComponent title="Earnings Trend" data={earningsData} />
          <PieChartComponent title="Project Types" data={projectTypeData} />
        </div>

        <div className="mb-8">
          <DataTable
            title="Current Assignments"
            data={assignments}
            columns={assignmentColumns}
            enableRowSelection={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>🏆</span>
              Certifications
            </h3>
            <div className="space-y-4">
              {certifications.map((cert, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border hover:border-primary transition-colors">
                  <span className="text-2xl">{cert.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{cert.name}</h4>
                    <div className="flex justify-between items-center mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        cert.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {cert.status}
                      </span>
                      <span className="text-xs text-gray-500">Expires: {cert.expiry}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>🌟</span>
              Recent Clients
            </h3>
            <div className="space-y-4">
              {recentClients.map((client, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border hover:border-primary transition-colors">
                  <span className="text-2xl">{client.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{client.name}</h4>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-600">{client.projects} projects</span>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-xs font-medium">{client.rating}</span>
                      </div>
                    </div>
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
