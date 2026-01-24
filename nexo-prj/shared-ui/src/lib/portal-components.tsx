import React from 'react';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Logout,
  Settings,
  AccountCircle,
  ArrowBack
} from '@mui/icons-material';

export interface PortalHeaderProps {
  portalName: string;
  userName: string;
  userInitials: string;
  onLogout?: () => void;
  backToSelection?: boolean;
  avatarColor?: string;
  headerColor?: string;
}

export function PortalHeader({
  portalName,
  userName,
  userInitials,
  onLogout,
  backToSelection = true,
  avatarColor = 'primary.dark',
  headerColor = 'primary.main'
}: PortalHeaderProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout?.();
  };

  return (
    <AppBar position="static" sx={{ bgcolor: headerColor }}>
      <Toolbar>
        {backToSelection && (
          <Button
            component={Link}
            href="/"
            startIcon={<ArrowBack />}
            sx={{ color: 'white', mr: 2 }}
          >
            Back to Portal Selection
          </Button>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {portalName}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ mr: 2, color: 'white' }}>
            {userName}
          </Typography>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            sx={{ color: 'white' }}
          >
            <Avatar sx={{ bgcolor: avatarColor, width: 32, height: 32 }}>
              {userInitials}
            </Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export interface PortalSidebarProps {
  menuItems: Array<{
    icon: React.ReactNode;
    text: string;
    href: string;
  }>;
}

export function PortalSidebar({ menuItems }: PortalSidebarProps) {
  return (
    <Box sx={{ width: '100%' }}>
      {menuItems.map((item, index) => (
        <Button
          key={index}
          component={Link}
          href={item.href}
          fullWidth
          sx={{
            justifyContent: 'flex-start',
            py: 1.5,
            px: 2,
            textTransform: 'none',
            color: 'text.primary',
            '&:hover': {
              bgcolor: 'action.hover',
            }
          }}
        >
          <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
            {item.icon}
          </Box>
          <Typography variant="body1">
            {item.text}
          </Typography>
        </Button>
      ))}
    </Box>
  );
}