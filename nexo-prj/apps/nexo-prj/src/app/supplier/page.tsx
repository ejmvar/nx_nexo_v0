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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Dashboard,
  Assignment,
  Business,
  Assessment,
  LocalShipping,
  Settings,
  Logout,
  ArrowBack,
  Inventory
} from '@mui/icons-material';

export default function SupplierPortal() {
  const menuItems = [
    { icon: <Dashboard />, text: 'Dashboard', href: '/supplier/dashboard' },
    { icon: <Assignment />, text: 'Orders', href: '/supplier/orders' },
    { icon: <LocalShipping />, text: 'Deliveries', href: '/supplier/deliveries' },
    { icon: <Inventory />, text: 'Inventory', href: '/supplier/inventory' },
    { icon: <Business />, text: 'Company Profile', href: '/supplier/profile' },
    { icon: <Assessment />, text: 'Reports', href: '/supplier/reports' },
    { icon: <Settings />, text: 'Settings', href: '/supplier/settings' },
  ];

  const recentOrders = [
    { id: 'ORD-2026-001', client: 'Acme Corp', status: 'Processing', amount: '$12,500', date: '2026-01-15' },
    { id: 'ORD-2026-002', client: 'TechStart Inc', status: 'Shipped', amount: '$8,750', date: '2026-01-12' },
    { id: 'ORD-2026-003', client: 'Global Solutions', status: 'Delivered', amount: '$15,200', date: '2026-01-10' },
    { id: 'ORD-2026-004', client: 'Innovate Ltd', status: 'Processing', amount: '$9,800', date: '2026-01-18' },
  ];

  const quickActions = [
    {
      title: 'New Order',
      description: 'Create a new order for a client',
      action: 'Create Order',
      color: 'primary'
    },
    {
      title: 'Update Inventory',
      description: 'Manage your product inventory',
      action: 'Update Stock',
      color: 'secondary'
    },
    {
      title: 'Track Deliveries',
      description: 'Monitor shipment status and delivery',
      action: 'View Deliveries',
      color: 'success'
    },
    {
      title: 'Generate Invoice',
      description: 'Create invoices for completed orders',
      action: 'Create Invoice',
      color: 'warning'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing': return 'warning';
      case 'Shipped': return 'info';
      case 'Delivered': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: 'success.main' }}>
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
            Supplier Portal
          </Typography>
          <Avatar sx={{ bgcolor: 'success.dark', mr: 1 }}>SS</Avatar>
          <Typography variant="body1" sx={{ mr: 2 }}>Supply Solutions Inc</Typography>
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
                  Welcome to Supply Solutions Portal
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Manage your orders, inventory, and supplier relationships
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip label="Verified Supplier" color="success" sx={{ mr: 1 }} />
                  <Chip label="Premium Partner" variant="outlined" sx={{ mr: 1 }} />
                  <Chip label="4 Active Orders" variant="outlined" />
                </Box>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
              Recent Orders
            </Typography>
            <Card sx={{ mb: 4 }}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{order.client}</TableCell>
                        <TableCell>
                          <Chip
                            label={order.status}
                            color={getStatusColor(order.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{order.amount}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <Button size="small" color="primary">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>

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

            {/* Supplier Stats */}
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Supplier Statistics
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Assignment />
                    </ListItemIcon>
                    <ListItemText
                      primary="Total Orders This Month: 24"
                      secondary="12 completed, 8 in progress, 4 pending"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <LocalShipping />
                    </ListItemIcon>
                    <ListItemText
                      primary="On-Time Delivery Rate: 96%"
                      secondary="Above industry average"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <Inventory />
                    </ListItemIcon>
                    <ListItemText
                      primary="Inventory Status: 85% stocked"
                      secondary="Low stock alerts for 3 items"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <Assessment />
                    </ListItemIcon>
                    <ListItemText
                      primary="Monthly Revenue: $142,500"
                      secondary="15% increase from last month"
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