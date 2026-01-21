'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import {
  Dashboard,
  Assignment,
  People,
  Business,
  Assessment,
  Settings,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import {
  PortalHeader,
  getEmployeeMenuItems,
  LineChartComponent,
  BarChartComponent,
  KPICard,
  DataTable,

} from '@nexo-prj/shared-ui';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

export default function EmployeePortal() {
  const menuItems = getEmployeeMenuItems();

  // Sample data for charts
  const performanceData = [
    { name: 'Jan', value: 85 },
    { name: 'Feb', value: 88 },
    { name: 'Mar', value: 92 },
    { name: 'Apr', value: 90 },
    { name: 'May', value: 94 },
    { name: 'Jun', value: 96 },
  ];

  const tasksData = [
    { name: 'Completed', value: 45, fill: '#4caf50' },
    { name: 'In Progress', value: 12, fill: '#2196f3' },
    { name: 'Pending', value: 8, fill: '#ff9800' },
  ];

  // Sample tasks for table
  const tasks: Task[] = [
    {
      id: '1',
      title: 'Complete Q1 Report',
      status: 'in-progress',
      priority: 'high',
      dueDate: '2026-01-25',
    },
    {
      id: '2',
      title: 'Review Team Performance',
      status: 'pending',
      priority: 'medium',
      dueDate: '2026-01-28',
    },
    {
      id: '3',
      title: 'Update Documentation',
      status: 'completed',
      priority: 'low',
      dueDate: '2026-01-20',
    },
    {
      id: '4',
      title: 'Client Meeting Preparation',
      status: 'in-progress',
      priority: 'high',
      dueDate: '2026-01-22',
    },
  ];

  const columns: DataTableColumn<Task>[] = [
    {
      id: 'title',
      header: 'Task Title',
      accessorKey: 'title',
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status;
        const color =
          status === 'completed'
            ? 'success'
            : status === 'in-progress'
            ? 'primary'
            : 'warning';
        return <Chip label={status} color={color} size="small" />;
      },
    },
    {
      id: 'priority',
      header: 'Priority',
      accessorKey: 'priority',
      cell: ({ row }) => {
        const priority = row.original.priority;
        const color =
          priority === 'high'
            ? 'error'
            : priority === 'medium'
            ? 'warning'
            : 'default';
        return <Chip label={priority} color={color} size="small" />;
      },
    },
    {
      id: 'dueDate',
      header: 'Due Date',
      accessorKey: 'dueDate',
    },
  ];

  const quickActions = [
    {
      title: 'View Tasks',
      description: 'Check your assigned tasks and deadlines',
      action: 'View Tasks',
      color: 'primary' as const,
    },
    {
      title: 'Team Updates',
      description: 'See latest team announcements and updates',
      action: 'View Updates',
      color: 'secondary' as const,
    },
    {
      title: 'Time Tracking',
      description: 'Log your work hours and activities',
      action: 'Start Timer',
      color: 'success' as const,
    },
    {
      title: 'Performance',
      description: 'Review your performance metrics',
      action: 'View Metrics',
      color: 'warning' as const,
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <PortalHeader
        title="Employee Portal"
        userName="John Doe"
        showBackButton={true}
        backHref="/"
      />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Sidebar Menu */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Navigation
                </Typography>
                <List>
                  {menuItems.map((item, index) => (
                    <ListItem key={index} sx={{ cursor: 'pointer' }}>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Main Content */}
          <Grid size={{ xs: 12, md: 9 }}>
            {/* Welcome Section */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h4" gutterBottom>
                  Welcome back, John!
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Here's your employee dashboard overview
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip label="Active Employee" color="success" sx={{ mr: 1 }} />
                  <Chip label="Software Developer" variant="outlined" sx={{ mr: 1 }} />
                  <Chip label="Team Lead" variant="outlined" />
                </Box>
              </CardContent>
            </Card>

            {/* KPI Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <KPICard
                  title="Tasks Completed"
                  value="45"
                  change={12.5}
                  icon={<Assignment />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <KPICard
                  title="Performance Score"
                  value="96%"
                  change={4.2}
                  icon={<TrendingUp />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <KPICard
                  title="Active Projects"
                  value="8"
                  change={-2}
                  icon={<Business />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <KPICard
                  title="Team Members"
                  value="12"
                  change={8.3}
                  icon={<People />}
                />
              </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Card>
                  <CardContent>
                    <LineChartComponent
                      data={performanceData}
                      title="Performance Trend"
                      xAxisKey="name"
                      lines={[{ dataKey: 'value', stroke: '#2196f3', name: 'Score' }]}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card>
                  <CardContent>
                    <BarChartComponent
                      data={tasksData}
                      title="Tasks Overview"
                      xAxisKey="name"
                      bars={[{ dataKey: 'value', fill: '#4caf50' }]}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Tasks Table */}
            <Card sx={{ mb: 3 }}>
              <DataTable
                data={tasks}
                columns={columns}
                title="My Tasks"
                enableRowSelection
                enableSorting
                enableFiltering
              />
            </Card>

            {/* Quick Actions */}
            <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {quickActions.map((action, index) => (
                <Grid size={{ xs: 12, sm: 6 }} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {action.description}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        color={action.color}
                        variant="contained"
                        fullWidth
                      >
                        {action.action}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Recent Activity */}
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Recent Activity
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Assignment />
                    </ListItemIcon>
                    <ListItemText
                      primary="Completed task: User Authentication Module"
                      secondary="2 hours ago"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <People />
                    </ListItemIcon>
                    <ListItemText
                      primary="Team meeting scheduled for tomorrow"
                      secondary="4 hours ago"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <Assessment />
                    </ListItemIcon>
                    <ListItemText
                      primary="Monthly performance review available"
                      secondary="1 day ago"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}