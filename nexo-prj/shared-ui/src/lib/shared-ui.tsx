import React from 'react';
import { useForm, UseFormReturn, FieldValues, DefaultValues } from 'react-hook-form';
import { Box, TextField, Button, FormControl, FormLabel, FormHelperText } from '@mui/material';

// Form Context
interface FormContextValue<T extends FieldValues = any> {
  form: UseFormReturn<T>;
}

const FormContext = React.createContext<FormContextValue | null>(null);

export function useFormContext<T extends FieldValues = any>(): FormContextValue<T> {
  const context = React.useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}

// Form Provider Component
interface FormProviderProps<T extends FieldValues = any> {
  children: React.ReactNode;
  defaultValues?: DefaultValues<T>;
  onSubmit: (data: T) => void | Promise<void>;
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
}

export function FormProvider<T extends FieldValues = any>({
  children,
  defaultValues,
  onSubmit,
  mode = 'onSubmit',
}: FormProviderProps<T>) {
  const form = useForm<T>({
    defaultValues,
    mode,
  });

  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <FormContext.Provider value={{ form }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
        {children}
      </Box>
    </FormContext.Provider>
  );
}

// Form Field Components
interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  helperText?: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
}

export function FormField({
  name,
  label,
  type = 'text',
  required = false,
  helperText,
  disabled = false,
  multiline = false,
  rows = 1,
}: FormFieldProps) {
  const { form } = useFormContext();
  const {
    register,
    formState: { errors },
  } = form;

  const error = errors[name];
  const errorMessage = error?.message as string;

  return (
    <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
      <FormLabel htmlFor={name}>{label}</FormLabel>
      <TextField
        id={name}
        type={type}
        multiline={multiline}
        rows={rows}
        disabled={disabled}
        error={!!error}
        {...register(name, { required: required ? `${label} is required` : false })}
        fullWidth
      />
      {(errorMessage || helperText) && (
        <FormHelperText>{errorMessage || helperText}</FormHelperText>
      )}
    </FormControl>
  );
}

// Submit Button Component
interface SubmitButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

export function SubmitButton({
  children,
  loading = false,
  disabled = false,
  variant = 'contained',
  color = 'primary',
}: SubmitButtonProps) {
  const { form } = useFormContext();
  const { formState: { isSubmitting, isValid } } = form;

  return (
    <Button
      type="submit"
      variant={variant}
      color={color}
      disabled={disabled || isSubmitting || loading || !isValid}
      sx={{ mt: 2 }}
    >
      {loading || isSubmitting ? 'Submitting...' : children}
    </Button>
  );
}

// Form Section Component
interface FormSectionProps {
  title?: string;
  children: React.ReactNode;
  sx?: any;
}

export function FormSection({ title, children, sx }: FormSectionProps) {
  return (
    <Box sx={{ mb: 4, ...sx }}>
      {title && (
        <Box sx={{ mb: 2 }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 500 }}>{title}</h3>
        </Box>
      )}
      {children}
    </Box>
  );
}

// Utility functions
export function createFormSchema<T extends FieldValues>(schema: any) {
  return schema;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

export function sharedUi() {
  return 'shared-ui';
}
