import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import {
  FormProvider,
  FormField,
  SubmitButton,
} from './shared-ui';
import { LoginForm } from './login-form';
import { DataEntryForm } from './data-entry-form';

describe('Form Components', () => {
  describe('FormProvider', () => {
    it('should render form with children', () => {
      const mockSubmit = vi.fn();
      render(
        <FormProvider onSubmit={mockSubmit}>
          <div>Test Form</div>
        </FormProvider>
      );
      expect(screen.getByText('Test Form')).toBeInTheDocument();
    });

    it('should call onSubmit when form is submitted', async () => {
      const mockSubmit = vi.fn();
      render(
        <FormProvider onSubmit={mockSubmit}>
          <button type="submit">Submit</button>
        </FormProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: /submit/i }));
      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('FormField', () => {
    it('should render text input field', () => {
      const mockSubmit = vi.fn();
      render(
        <FormProvider onSubmit={mockSubmit}>
          <FormField name="testField" label="Test Field" />
        </FormProvider>
      );

      expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
    });

    it('should show error message when field is required and empty', async () => {
      const mockSubmit = vi.fn();
      render(
        <FormProvider onSubmit={mockSubmit}>
          <FormField name="testField" label="Test Field" required />
          <button type="submit">Submit</button>
        </FormProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText('Test Field is required')).toBeInTheDocument();
      });
    });
  });

  describe('SubmitButton', () => {
    it('should render submit button', () => {
      const mockSubmit = vi.fn();
      render(
        <FormProvider onSubmit={mockSubmit}>
          <SubmitButton>Submit Form</SubmitButton>
        </FormProvider>
      );

      expect(screen.getByRole('button', { name: /submit form/i })).toBeInTheDocument();
    });

    it('should be disabled when form is invalid', () => {
      const mockSubmit = vi.fn();
      render(
        <FormProvider onSubmit={mockSubmit}>
          <FormField name="requiredField" label="Required" required />
          <SubmitButton>Submit Form</SubmitButton>
        </FormProvider>
      );

      expect(screen.getByRole('button', { name: /submit form/i })).toBeDisabled();
    });
  });

  describe('LoginForm', () => {
    it('should render login form with email and password fields', () => {
      const mockSubmit = vi.fn();
      render(<LoginForm onSubmit={mockSubmit} />);

      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should show portal-specific title', () => {
      const mockSubmit = vi.fn();
      render(<LoginForm onSubmit={mockSubmit} portalType="employee" />);

      expect(screen.getByText('Employee Portal')).toBeInTheDocument();
    });

    it('should show error message when provided', () => {
      const mockSubmit = vi.fn();
      render(<LoginForm onSubmit={mockSubmit} error="Invalid credentials" />);

      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  describe('DataEntryForm', () => {
    const mockFields = [
      { name: 'name', label: 'Name', required: true },
      { name: 'email', label: 'Email', type: 'email' as const },
      {
        name: 'role',
        label: 'Role',
        type: 'select' as const,
        options: [
          { value: 'admin', label: 'Admin' },
          { value: 'user', label: 'User' },
        ],
      },
    ];

    it('should render data entry form with specified fields', () => {
      const mockSubmit = vi.fn();
      render(<DataEntryForm fields={mockFields} onSubmit={mockSubmit} />);

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      // Check for select field by its ID
      expect(document.getElementById('role')).toBeInTheDocument();
    });

    it('should render select field with options', () => {
      const mockSubmit = vi.fn();
      render(<DataEntryForm fields={mockFields} onSubmit={mockSubmit} />);

      const select = document.getElementById('role');
      expect(select).toBeInTheDocument();

      // Check if options are available (this might need adjustment based on MUI select implementation)
      fireEvent.mouseDown(select!);
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
    });
  });
});
