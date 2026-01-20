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
  Badge,
} from '@mui/material';
import {
  Dashboard,
  School,
  Work,
  Code,
  Star,
  TrendingUp,
  People,
} from '@mui/icons-material';
import {
  PortalHeader,
  getProfessionalMenuItems,
  LineChartComponent,
  PieChartComponent,
  KPICard,
  DataTable,
  type DataTableColumn,
} from '@nexo-prj/shared-ui';

interface Certification {
  id: string;
  name: string;
  status: 'certified' | 'in-progress' | 'planned';
  progress: number;
  expiry: string;
  provider: string;
}

export default function ProfessionalPortal() {
  const menuItems = getProfessionalMenuItems();

  // Sample data for charts
  const skillProgressData = [
    { name: 'React', value: 95 },
    { name: 'Node.js', value: 88 },
    { name: 'Python', value: 82 },
    { name: 'AWS', value: 78 },
    { name: 'Docker', value: 85 },
    { name: 'TypeScript', value: 92 },
  ];

  const certificationStatusData = [
    { name: 'Certified', value: 8, fill: '#4caf50' },
    { name: 'In Progress', value: 3, fill: '#2196f3' },
    { name: 'Planned', value: 2, fill: '#ff9800' },
  ];

  // Sample certifications for table
  const certifications: Certification[] = [
    {
      id: '1',
      name: 'AWS Certified Solutions Architect',
      status: 'certified',
      progress: 100,
      expiry: '2028-01-15',
      provider: 'AWS',
    },
    {
      id: '2',
      name: 'Google Cloud Professional Developer',
      status: 'in-progress',
      progress: 75,
      expiry: 'N/A',
      provider: 'Google Cloud',
    },
    {
      id: '3',
      name: 'Certified Kubernetes Administrator',
      status: 'certified',
      progress: 100,
      expiry: '2027-06-20',
      provider: 'CNCF',
    },
    {
      id: '4',
      name: 'Professional Scrum Master',
      status: 'planned',
      progress: 0,
      expiry: 'N/A',
      provider: 'Scrum.org',
    },
  ];

  const columns: DataTableColumn<Certification>[] = [
    {
      id: 'name',
      header: 'Certification',
      accessorKey: 'name',
    },
    {
      id: 'provider',
      header: 'Provider',
      accessorKey: 'provider',
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status;
        const colorMap = {
          certified: 'success' as const,
          'in-progress': 'primary' as const,
          planned: 'warning' as const,
        };
        return <Chip label={status} color={colorMap[status]} size="small" />;
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
      id: 'expiry',
      header: 'Expiry',
      accessorKey: 'expiry',
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <PortalHeader
        title="Professional Portal"
        userName="Jane Developer"
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
                  Welcome, Jane Developer
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Track your professional development and certifications
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Badge badgeContent={8} color="success" sx={{ mr: 3 }}>
                    <Chip label="Certifications" icon={<School />} />
                  </Badge>
                  <Chip label="Senior Developer" variant="outlined" sx={{ mr: 1 }} />
                  <Chip
                    label="5 Years Experience"
                    variant="outlined"
                    icon={<Star />}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* KPI Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <KPICard
                  title="Certifications"
                  value="8"
                  change={33.3}
                  icon={<School />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <KPICard
                  title="Skill Rating"
                  value="4.8/5"
                  change={5.2}
                  icon={<Star />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <KPICard
                  title="Projects Completed"
                  value="24"
                  change={14.3}
                  icon={<Work />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <KPICard
                  title="Network Connections"
                  value="342"
                  change={8.9}
                  icon={<People />}
                />
              </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Card>
                  <CardContent>
                    <LineChartComponent
                      data={skillProgressData}
                      title="Skill Proficiency Levels"
                      xAxisKey="name"
                      lines={[
                        {
                          dataKey: 'value',
                          stroke: '#9c27b0',
                          name: 'Proficiency (%)',
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
                      data={certificationStatusData}
                      title="Certification Status"
                      nameKey="name"
                      dataKey="value"
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Certifications Table */}
            <Card sx={{ mb: 3 }}>
              <DataTable
                data={certifications}
                columns={columns}
                title="My Certifications"
                enableRowSelection
                enableSorting
                enableFiltering
              />
            </Card>

            {/* Active Learning Paths */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Active Learning Paths
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Code />
                    </ListItemIcon>
                    <ListItemText
                      primary="Advanced React Patterns"
                      secondary="75% complete - 12 lessons remaining"
                    />
                    <LinearProgress
                      variant="determinate"
                      value={75}
                      sx={{ width: 100, ml: 2 }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <School />
                    </ListItemIcon>
                    <ListItemText
                      primary="Cloud Architecture Fundamentals"
                      secondary="45% complete - 22 lessons remaining"
                    />
                    <LinearProgress
                      variant="determinate"
                      value={45}
                      sx={{ width: 100, ml: 2 }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUp />
                    </ListItemIcon>
                    <ListItemText
                      primary="DevOps Best Practices"
                      secondary="30% complete - 35 lessons remaining"
                    />
                    <LinearProgress
                      variant="determinate"
                      value={30}
                      sx={{ width: 100, ml: 2 }}
                    />
                  </ListItem>
                </List>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  View All Courses
                </Button>
              </CardActions>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Recent Achievements
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Star sx={{ color: '#ffd700' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Earned AWS Solutions Architect Certification"
                      secondary="2 weeks ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Work />
                    </ListItemIcon>
                    <ListItemText
                      primary="Completed E-commerce Platform Project"
                      secondary="3 weeks ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <People />
                    </ListItemIcon>
                    <ListItemText
                      primary="Joined Advanced React Developer Community"
                      secondary="1 month ago"
                    />
                  </ListItem>
                </List>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  View Portfolio
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
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