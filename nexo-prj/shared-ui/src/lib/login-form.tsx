import { Box, Alert, Link, Typography } from '@mui/material';
import { FormProvider, FormField, SubmitButton, FormSection, validateEmail } from './shared-ui';

export interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void | Promise<void>;
  loading?: boolean;
  error?: string;
  portalType?: 'employee' | 'client' | 'supplier' | 'professional';
}

export function LoginForm({ onSubmit, loading = false, error, portalType }: LoginFormProps) {
  const handleSubmit = async (data: LoginFormData) => {
    // Basic validation
    if (!validateEmail(data.email)) {
      throw new Error('Please enter a valid email address');
    }
    if (data.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    await onSubmit(data);
  };

  const getPortalTitle = () => {
    switch (portalType) {
      case 'employee':
        return 'Employee Portal';
      case 'client':
        return 'Client Portal';
      case 'supplier':
        return 'Supplier Portal';
      case 'professional':
        return 'Professional Portal';
      default:
        return 'NEXO Portal';
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        {getPortalTitle()}
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Sign in to access your account
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <FormProvider<LoginFormData>
        onSubmit={handleSubmit}
        defaultValues={{ email: '', password: '' }}
        mode="onChange"
      >
        <FormSection>
          <FormField
            name="email"
            label="Email Address"
            type="email"
            required
            helperText="Enter your registered email address"
          />
          <FormField
            name="password"
            label="Password"
            type="password"
            required
            helperText="Enter your password"
          />
        </FormSection>

        <SubmitButton loading={loading}>
          Sign In
        </SubmitButton>
      </FormProvider>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Link href="#" variant="body2">
          Forgot your password?
        </Link>
      </Box>

      {portalType && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Need help? Contact support
          </Typography>
        </Box>
      )}
    </Box>
  );
}