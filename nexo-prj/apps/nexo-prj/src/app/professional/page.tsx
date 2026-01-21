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