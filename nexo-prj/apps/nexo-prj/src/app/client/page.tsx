'use client';

import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Button,
  CardActions,
} from '@mui/material';
import {
  Dashboard,
  Assignment,
  TrendingUp,
  Business,
  Message,
} from '@mui/icons-material';
import {
  PortalHeader,
  getClientMenuItems,
  PieChartComponent,
  AreaChartComponent,
  KPICard,
  DataTable,
  type DataTableColumn,
} from '@nexo-prj/shared-ui';

interface Project {
  id: string;
  name: string;
  status: 'planning' | 'in-progress' | 'completed';
  progress: number;
  budget: string;
  deadline: string;
}

export default function ClientPortal() {
  const menuItems = getClientMenuItems();

  // Sample data for charts
  const budgetData = [
    { name: 'Development', value: 45000, fill: '#2196f3' },
    { name: 'Design', value: 25000, fill: '#4caf50' },
    { name: 'Marketing', value: 15000, fill: '#ff9800' },
    { name: 'Operations', value: 15000, fill: '#9c27b0' },
  ];

  const revenueData = [
    { name: 'Jan', value: 12000 },
    { name: 'Feb', value: 15000 },
    { name: 'Mar', value: 18000 },
    { name: 'Apr', value: 22000 },
    { name: 'May', value: 25000 },
    { name: 'Jun', value: 28000 },
  ];

  // Sample projects for table
  const projects: Project[] = [
    {
      id: '1',
      name: 'Website Redesign',
      status: 'in-progress',
      progress: 75,
      budget: '$45,000',
      deadline: '2026-03-15',
    },
    {
      id: '2',
      name: 'Mobile App Development',
      status: 'in-progress',
      progress: 45,
      budget: '$120,000',
      deadline: '2026-04-30',
    },
    {
      id: '3',
      name: 'Brand Strategy',
      status: 'completed',
      progress: 100,
      budget: '$25,000',
      deadline: '2026-01-15',
    },
    {
      id: '4',
      name: 'SEO Optimization',
      status: 'planning',
      progress: 10,
      budget: '$15,000',
      deadline: '2026-05-01',
    },
  ];

  const columns: DataTableColumn<Project>[] = [
    {
      id: 'name',
      header: 'Project Name',
      accessorKey: 'name',
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
      id: 'progress',
      header: 'Progress',
      accessorKey: 'progress',
      cell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinearProgress
            variant="determinate"
            value={row.original.progress}
            sx={{ width: 100 }}
          />
          <Typography variant="body2">{row.original.progress}%</Typography>
        </Box>
      ),
    },
    {
      id: 'budget',
      header: 'Budget',
      accessorKey: 'budget',
    },
    {
      id: 'deadline',
      header: 'Deadline',
      accessorKey: 'deadline',
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <PortalHeader
        title="Client Portal"
        userName="ABC Corporation"
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
                  Welcome, ABC Corporation
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Manage your projects and track progress
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip label="Premium Client" color="success" sx={{ mr: 1 }} />
                  <Chip label="4 Active Projects" variant="outlined" sx={{ mr: 1 }} />
                  <Chip label="Verified Account" variant="outlined" />
                </Box>
              </CardContent>
            </Card>

            {/* KPI Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <KPICard
                  title="Active Projects"
                  value="4"
                  change={25}
                  icon={<Assignment />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <KPICard
                  title="Total Investment"
                  value="$205K"
                  change={15.5}
                  icon={<TrendingUp />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <KPICard
                  title="Completion Rate"
                  value="88%"
                  change={3.2}
                  icon={<Dashboard />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <KPICard
                  title="Unread Messages"
                  value="5"
                  change={-12}
                  icon={<Message />}
                />
              </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Card>
                  <CardContent>
                    <AreaChartComponent
                      data={revenueData}
                      title="Project Investment Over Time"
                      xAxisKey="name"
                      areas={[
                        {
                          dataKey: 'value',
                          stroke: '#2196f3',
                          fill: '#2196f3',
                          name: 'Investment ($)',
                        },
                      ]}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <Card>
                  <CardContent>
                    <PieChartComponent
                      data={budgetData}
                      title="Budget Allocation"
                      nameKey="name"
                      dataKey="value"
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Projects Table */}
            <Card sx={{ mb: 3 }}>
              <DataTable
                data={projects}
                columns={columns}
                title="My Projects"
                enableRowSelection
                enableSorting
                enableFiltering
              />
            </Card>

            {/* Project Updates */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Recent Updates
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Assignment />
                    </ListItemIcon>
                    <ListItemText
                      primary="Website Redesign - Design Phase Complete"
                      secondary="Updated 3 hours ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Business />
                    </ListItemIcon>
                    <ListItemText
                      primary="Mobile App - Development Sprint Started"
                      secondary="Updated 1 day ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Message />
                    </ListItemIcon>
                    <ListItemText
                      primary="New Message from Project Manager"
                      secondary="Updated 2 days ago"
                    />
                  </ListItem>
                </List>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  View All Updates
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
      name: 'Marketing Campaign',
      progress: 90,
      status: 'Review',
      deadline: 'February 28, 2026',
      team: 'Marketing Team'
    }
  ];

  const quickActions = [
    {
      title: 'View Project Progress',
      description: 'Check the status of your ongoing projects',
      action: 'View Projects',
      color: 'primary'
    },
    {
      title: 'Contact Team',
      description: 'Send a message to your project team',
      action: 'Send Message',
      color: 'secondary'
    },
    {
      title: 'Download Reports',
      description: 'Access your project reports and analytics',
      action: 'View Reports',
      color: 'success'
    },
    {
      title: 'Schedule Meeting',
      description: 'Book a meeting with your project manager',
      action: 'Schedule',
      color: 'warning'
    }
  ];

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: 'secondary.main' }}>
        <Toolbar>
          <Button
            component={Link}
            href="/"
            startIcon={<ArrowBack />}
            sx={{ color: 'white', mr: 2 }}
          >
            Back to Portal Selection
          </Button>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Client Portal
          </Typography>
          <Avatar sx={{ bgcolor: 'secondary.dark', mr: 1 }}>AC</Avatar>
          <Typography variant="body1" sx={{ mr: 2 }}>Acme Corp</Typography>
          <Button color="inherit" startIcon={<Logout />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

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
                    <ListItem key={index} component={Link} href={item.href} sx={{ cursor: 'pointer' }}>
                      <ListItemIcon>
                        {item.icon}
                      </ListItemIcon>
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
                  Welcome to Acme Corp Portal
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Manage your projects and stay connected with your team
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip label="Active Client" color="success" sx={{ mr: 1 }} />
                  <Chip label="Premium Plan" variant="outlined" sx={{ mr: 1 }} />
                  <Chip label="3 Active Projects" variant="outlined" />
                </Box>
              </CardContent>
            </Card>

            {/* Project Overview */}
            <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
              Current Projects
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {projects.map((project, index) => (
                <Grid size={{ xs: 12 }} key={index}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">{project.name}</Typography>
                        <Chip
                          label={project.status}
                          color={project.status === 'Review' ? 'warning' : 'primary'}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Team: {project.team} • Deadline: {project.deadline}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress variant="determinate" value={project.progress} />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {project.progress}%
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button size="small" color="primary">
                        View Details
                      </Button>
                      <Button size="small" color="secondary">
                        Contact Team
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Quick Actions */}
            <Typography variant="h5" gutterBottom>
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
                        color={action.color as any}
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

            {/* Recent Updates */}
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Recent Updates
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUp />
                    </ListItemIcon>
                    <ListItemText
                      primary="Website Redesign project milestone completed"
                      secondary="2 hours ago"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <Message />
                    </ListItemIcon>
                    <ListItemText
                      primary="New message from your project manager"
                      secondary="4 hours ago"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <Assessment />
                    </ListItemIcon>
                    <ListItemText
                      primary="Monthly progress report is now available"
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