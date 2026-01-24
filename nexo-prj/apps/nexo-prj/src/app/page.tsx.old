'use client';

import Link from 'next/link';
import { Box, Card, CardContent, Typography, Grid, Button } from '@mui/material';
import { Business, People, Engineering, Person } from '@mui/icons-material';

export default function PortalSelection() {
  const portals = [
    {
      id: 'employee',
      title: 'Employee Portal',
      description: 'Access your employee dashboard, tasks, and company resources',
      icon: <People sx={{ fontSize: 48, color: 'primary.main' }} />,
      href: '/employee',
      color: 'primary.main'
    },
    {
      id: 'client',
      title: 'Client Portal',
      description: 'Manage your projects, view progress, and communicate with your team',
      icon: <Business sx={{ fontSize: 48, color: 'secondary.main' }} />,
      href: '/client',
      color: 'secondary.main'
    },
    {
      id: 'supplier',
      title: 'Supplier Portal',
      description: 'Manage orders, deliveries, and supplier relationships',
      icon: <Engineering sx={{ fontSize: 48, color: 'success.main' }} />,
      href: '/supplier',
      color: 'success.main'
    },
    {
      id: 'professional',
      title: 'Professional Portal',
      description: 'Access professional services, certifications, and development tools',
      icon: <Person sx={{ fontSize: 48, color: 'warning.main' }} />,
      href: '/professional',
      color: 'warning.main'
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Box sx={{ maxWidth: 1200, width: '100%' }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Welcome to NEXO
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'white',
              opacity: 0.9,
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            Multi-Portal Business Management System
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {portals.map((portal) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={portal.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  },
                  cursor: 'pointer'
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                  <Box sx={{ mb: 3 }}>
                    {portal.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{ mb: 2, fontWeight: 'bold' }}
                  >
                    {portal.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3, minHeight: 60 }}
                  >
                    {portal.description}
                  </Typography>
                  <Button
                    component={Link}
                    href={portal.href}
                    variant="contained"
                    fullWidth
                    sx={{
                      backgroundColor: portal.color,
                      '&:hover': {
                        backgroundColor: portal.color,
                        opacity: 0.9
                      }
                    }}
                  >
                    Access Portal
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="body2" sx={{ color: 'white', opacity: 0.7 }}>
            © 2026 NEXO Business Solutions. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
