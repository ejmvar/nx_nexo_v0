'use client';

import { useSession } from 'next-auth/react';
import { unstable_noStore as noStore } from 'next/cache';
import {
  Layout,
  Header,
  Sidebar,
  Main,
  Card,
  CardHeader,
  CardContent,
  Button,
  Badge,
  Alert
} from '@nexo-prj/ui';

export default function Dashboard() {
  noStore();
  const { data: session } = useSession();

  const stats = [
    { title: 'Total Contacts', value: '1,234', change: '+12%', trend: 'up' },
    { title: 'Active Projects', value: '56', change: '+8%', trend: 'up' },
    { title: 'Pending Tasks', value: '23', change: '-5%', trend: 'down' },
    { title: 'Revenue', value: '$45,678', change: '+15%', trend: 'up' },
  ];

  const recentActivities = [
    { id: 1, action: 'New contact added', user: 'John Doe', time: '2 hours ago' },
    { id: 2, action: 'Project completed', user: 'Jane Smith', time: '4 hours ago' },
    { id: 3, action: 'Task assigned', user: 'Bob Johnson', time: '6 hours ago' },
    { id: 4, action: 'Meeting scheduled', user: 'Alice Brown', time: '8 hours ago' },
  ];

  return (
    <Layout>
      <Header>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Badge variant="success">Online</Badge>
            <span className="text-sm text-gray-600">
              Welcome, {session?.user?.name || 'Employee'}
            </span>
          </div>
        </div>
      </Header>

      <div className="flex">
        <Sidebar>
          <nav className="space-y-2">
            <a href="/dashboard" className="block px-4 py-2 bg-blue-50 text-blue-700 rounded">
              Dashboard
            </a>
            <a href="/contacts" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Contacts
            </a>
            <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Projects
            </a>
            <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Tasks
            </a>
            <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Reports
            </a>
          </nav>
        </Sidebar>

        <Main>
          <div className="space-y-6">
            {/* Welcome Alert */}
            <Alert variant="info" title="Welcome to NEXO CRM">
              Here's an overview of your current activities and metrics.
            </Alert>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <Badge
                        variant={stat.trend === 'up' ? 'success' : 'danger'}
                      >
                        {stat.change}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">by {activity.user}</p>
                      </div>
                      <span className="text-sm text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="secondary" size="sm">
                    View All Activities
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <a href="/contacts">
                    <Button variant="primary">
                      Add New Contact
                    </Button>
                  </a>
                  <Button variant="secondary">
                    Create Project
                  </Button>
                  <Button variant="success">
                    Schedule Meeting
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </Main>
      </div>
    </Layout>
  );
}