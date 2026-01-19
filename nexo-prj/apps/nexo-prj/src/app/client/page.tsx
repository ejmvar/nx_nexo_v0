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
  Divider,
  LinearProgress
} from '@mui/material';
import {
  Dashboard,
  Assignment,
  Business,
  Assessment,
  Message,
  Settings,
  Logout,
  ArrowBack,
  TrendingUp
} from '@mui/icons-material';

export default function ClientPortal() {
  const menuItems = [
    { icon: <Dashboard />, text: 'Dashboard', href: '/client/dashboard' },
    { icon: <Assignment />, text: 'My Projects', href: '/client/projects' },
    { icon: <Business />, text: 'Company Profile', href: '/client/profile' },
    { icon: <Assessment />, text: 'Reports', href: '/client/reports' },
    { icon: <Message />, text: 'Messages', href: '/client/messages' },
    { icon: <Settings />, text: 'Settings', href: '/client/settings' },
  ];

  const projects = [
    {
      name: 'Website Redesign',
      progress: 75,
      status: 'In Progress',
      deadline: 'March 15, 2026',
      team: 'Design Team'
    },
    {
      name: 'Mobile App Development',
      progress: 45,
      status: 'In Progress',
      deadline: 'April 30, 2026',
      team: 'Development Team'
    },
    {
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