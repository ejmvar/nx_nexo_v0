'use client';

import Link from 'next/link';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Dashboard,
  Assignment,
  People,
  Business,
  Assessment,
  Settings,
  Logout,
  ArrowBack
} from '@mui/icons-material';

export default function EmployeePortal() {
  const menuItems = [
    { icon: <Dashboard />, text: 'Dashboard', href: '/employee/dashboard' },
    { icon: <Assignment />, text: 'My Tasks', href: '/employee/tasks' },
    { icon: <People />, text: 'Team', href: '/employee/team' },
    { icon: <Business />, text: 'Projects', href: '/employee/projects' },
    { icon: <Assessment />, text: 'Reports', href: '/employee/reports' },
    { icon: <Settings />, text: 'Settings', href: '/employee/settings' },
  ];

  const quickActions = [
    {
      title: 'View Tasks',
      description: 'Check your assigned tasks and deadlines',
      action: 'View Tasks',
      color: 'primary'
    },
    {
      title: 'Team Updates',
      description: 'See latest team announcements and updates',
      action: 'View Updates',
      color: 'secondary'
    },
    {
      title: 'Time Tracking',
      description: 'Log your work hours and activities',
      action: 'Start Timer',
      color: 'success'
    },
    {
      title: 'Performance',
      description: 'Review your performance metrics',
      action: 'View Metrics',
      color: 'warning'
    }
  ];

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
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
            Employee Portal
          </Typography>
          <Avatar sx={{ bgcolor: 'primary.dark', mr: 1 }}>JD</Avatar>
          <Typography variant="body1" sx={{ mr: 2 }}>John Doe</Typography>
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