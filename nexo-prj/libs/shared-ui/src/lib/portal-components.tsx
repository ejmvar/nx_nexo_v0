import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu,
  Dashboard,
  Assignment,
  People,
  Business,
  Assessment,
  Settings,
  Logout,
  ArrowBack,
} from '@mui/icons-material';
import Link from 'next/link';

export interface PortalHeaderProps {
  title: string;
  userName?: string;
  userAvatar?: string;
  onLogout?: () => void;
  showBackButton?: boolean;
  backHref?: string;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  title,
  userName = 'User',
  userAvatar,
  onLogout,
  showBackButton = false,
  backHref = '/',
}) => {
  return (
    <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
      <Toolbar>
        {showBackButton && (
          <Button
            component={Link}
            href={backHref}
            startIcon={<ArrowBack />}
            sx={{ color: 'white', mr: 2 }}
          >
            Back to Portal Selection
          </Button>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <Avatar sx={{ bgcolor: 'primary.dark', mr: 1 }}>
          {userAvatar || userName.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="body1" sx={{ mr: 2 }}>
          {userName}
        </Typography>
        <Button color="inherit" startIcon={<Logout />} onClick={onLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export interface MenuItem {
  icon: React.ReactNode;
  text: string;
  href: string;
}

export interface PortalSidebarProps {
  menuItems: MenuItem[];
  isOpen: boolean;
  onToggle: () => void;
}

export const PortalSidebar: React.FC<PortalSidebarProps> = ({
  menuItems,
  isOpen,
  onToggle,
}) => {
  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation">
      <Typography variant="h6" sx={{ p: 2 }}>
        Navigation
      </Typography>
      <Divider />
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
    </Box>
  );

  return (
    <Drawer anchor="left" open={isOpen} onClose={onToggle}>
      {drawerContent}
    </Drawer>
  );
};

// Default menu items for different portals
export const getEmployeeMenuItems = (): MenuItem[] => [
  { icon: <Dashboard />, text: 'Dashboard', href: '/employee/dashboard' },
  { icon: <Assignment />, text: 'My Tasks', href: '/employee/tasks' },
  { icon: <People />, text: 'Team', href: '/employee/team' },
  { icon: <Business />, text: 'Projects', href: '/employee/projects' },
  { icon: <Assessment />, text: 'Reports', href: '/employee/reports' },
  { icon: <Settings />, text: 'Settings', href: '/employee/settings' },
];

export const getClientMenuItems = (): MenuItem[] => [
  { icon: <Dashboard />, text: 'Dashboard', href: '/client/dashboard' },
  { icon: <Assignment />, text: 'My Projects', href: '/client/projects' },
  { icon: <Business />, text: 'Services', href: '/client/services' },
  { icon: <Assessment />, text: 'Reports', href: '/client/reports' },
  { icon: <Settings />, text: 'Settings', href: '/client/settings' },
];

export const getSupplierMenuItems = (): MenuItem[] => [
  { icon: <Dashboard />, text: 'Dashboard', href: '/supplier/dashboard' },
  { icon: <Assignment />, text: 'Orders', href: '/supplier/orders' },
  { icon: <Business />, text: 'Products', href: '/supplier/products' },
  { icon: <Assessment />, text: 'Analytics', href: '/supplier/analytics' },
  { icon: <Settings />, text: 'Settings', href: '/supplier/settings' },
];

export const getProfessionalMenuItems = (): MenuItem[] => [
  { icon: <Dashboard />, text: 'Dashboard', href: '/professional/dashboard' },
  { icon: <Assignment />, text: 'Assignments', href: '/professional/assignments' },
  { icon: <People />, text: 'Clients', href: '/professional/clients' },
  { icon: <Assessment />, text: 'Performance', href: '/professional/performance' },
  { icon: <Settings />, text: 'Settings', href: '/professional/settings' },
];