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
  LinearProgress,
  Badge
} from '@mui/material';
import {
  Dashboard,
  School,
  Business,
  Assessment,
  Settings,
  Logout,
  ArrowBack,
  Star,
  Work,
  Code
} from '@mui/icons-material';

export default function ProfessionalPortal() {
  const menuItems = [
    { icon: <Dashboard />, text: 'Dashboard', href: '/professional/dashboard' },
    { icon: <Work />, text: 'Job Opportunities', href: '/professional/jobs' },
    { icon: <School />, text: 'Certifications', href: '/professional/certifications' },
    { icon: <Code />, text: 'Development Tools', href: '/professional/tools' },
    { icon: <Business />, text: 'Professional Network', href: '/professional/network' },
    { icon: <Assessment />, text: 'Portfolio', href: '/professional/portfolio' },
    { icon: <Settings />, text: 'Settings', href: '/professional/settings' },
  ];

  const certifications = [
    {
      name: 'AWS Certified Solutions Architect',
      progress: 100,
      status: 'Certified',
      expiry: '2028-01-15',
      badge: 'Gold'
    },
    {
      name: 'Google Cloud Professional Developer',
      progress: 75,
      status: 'In Progress',
      expiry: 'N/A',
      badge: 'In Progress'
    },
    {
      name: 'Microsoft Azure Fundamentals',
      progress: 100,
      status: 'Certified',
      expiry: '2027-06-20',
      badge: 'Silver'
    },
    {
      name: 'Certified Kubernetes Administrator',
      progress: 45,
      status: 'In Progress',
      expiry: 'N/A',
      badge: 'In Progress'
    }
  ];

  const quickActions = [
    {
      title: 'Find Jobs',
      description: 'Browse and apply for new opportunities',
      action: 'Browse Jobs',
      color: 'primary'
    },
    {
      title: 'Update Portfolio',
      description: 'Showcase your latest projects and skills',
      action: 'Update Portfolio',
      color: 'secondary'
    },
    {
      title: 'Take Assessment',
      description: 'Complete certification assessments',
      action: 'Start Assessment',
      color: 'success'
    },
    {
      title: 'Network',
      description: 'Connect with other professionals',
      action: 'Find Connections',
      color: 'warning'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Certified': return 'success';
      case 'In Progress': return 'warning';
      case 'Expired': return 'error';
      default: return 'default';
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Gold': return 'warning';
      case 'Silver': return 'grey';
      case 'Bronze': return 'orange';
      default: return 'primary';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: 'warning.main' }}>
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
            Professional Portal
          </Typography>
          <Avatar sx={{ bgcolor: 'warning.dark', mr: 1 }}>MP</Avatar>
          <Typography variant="body1" sx={{ mr: 2 }}>Maria Professional</Typography>
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
                  Welcome back, Maria!
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Advance your career and expand your professional network
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip label="Senior Developer" color="primary" sx={{ mr: 1 }} />
                  <Chip label="5 Certifications" variant="outlined" sx={{ mr: 1 }} />
                  <Chip
                    icon={<Star />}
                    label="4.9 Rating"
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    icon={<Badge />}
                    label="Top Contributor"
                    color="warning"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Certifications Progress */}
            <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
              Certification Progress
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {certifications.map((cert, index) => (
                <Grid size={{ xs: 12, md: 6 }} key={index}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">{cert.name}</Typography>
                        <Chip
                          label={cert.badge}
                          color={getBadgeColor(cert.badge) as any}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Status: {cert.status} {cert.expiry !== 'N/A' && `• Expires: ${cert.expiry}`}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={cert.progress}
                            color={getStatusColor(cert.status) as any}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {cert.progress}%
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        color={cert.status === 'Certified' ? 'success' : 'primary'}
                        disabled={cert.status === 'Certified'}
                      >
                        {cert.status === 'Certified' ? 'View Certificate' : 'Continue Learning'}
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

            {/* Professional Stats */}
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Professional Statistics
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Work />
                    </ListItemIcon>
                    <ListItemText
                      primary="Active Job Applications: 3"
                      secondary="2 interviews scheduled, 1 offer pending"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <School />
                    </ListItemIcon>
                    <ListItemText
                      primary="Certifications Earned: 5"
                      secondary="2 expiring within 6 months"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <Code />
                    </ListItemIcon>
                    <ListItemText
                      primary="Projects Completed: 24"
                      secondary="8 featured in portfolio"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <Star />
                    </ListItemIcon>
                    <ListItemText
                      primary="Professional Rating: 4.9/5.0"
                      secondary="Based on 47 client reviews"
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