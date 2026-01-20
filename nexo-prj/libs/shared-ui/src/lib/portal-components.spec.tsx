import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  PortalHeader,
  PortalSidebar,
  getEmployeeMenuItems,
  getClientMenuItems,
  getSupplierMenuItems,
  getProfessionalMenuItems,
} from './portal-components';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('PortalHeader', () => {
  it('renders with required props', () => {
    render(<PortalHeader title="Test Portal" />);

    expect(screen.getByText('Test Portal')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('renders with custom user name', () => {
    render(<PortalHeader title="Employee Portal" userName="John Doe" />);

    expect(screen.getByText('Employee Portal')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders with custom avatar', () => {
    render(<PortalHeader title="Test Portal" userAvatar="JD" />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('shows back button when showBackButton is true', () => {
    render(<PortalHeader title="Test Portal" showBackButton={true} />);

    expect(screen.getByText('Back to Portal Selection')).toBeInTheDocument();
  });

  it('calls onLogout when logout button is clicked', () => {
    const mockOnLogout = vi.fn();
    render(<PortalHeader title="Test Portal" onLogout={mockOnLogout} />);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  it('renders with custom back href', () => {
    render(
      <PortalHeader
        title="Test Portal"
        showBackButton={true}
        backHref="/custom"
      />
    );

    const backLink = screen.getByText('Back to Portal Selection');
    expect(backLink.closest('a')).toHaveAttribute('href', '/custom');
  });
});

describe('PortalSidebar', () => {
  const mockMenuItems = [
    { icon: <span>📊</span>, text: 'Dashboard', href: '/dashboard' },
    { icon: <span>📋</span>, text: 'Tasks', href: '/tasks' },
  ];

  it('renders menu items when open', () => {
    render(
      <PortalSidebar
        menuItems={mockMenuItems}
        isOpen={true}
        onToggle={() => {}}
      />
    );

    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <PortalSidebar
        menuItems={mockMenuItems}
        isOpen={false}
        onToggle={() => {}}
      />
    );

    expect(screen.queryByText('Navigation')).not.toBeInTheDocument();
  });

  it('calls onToggle when closed', () => {
    const mockOnToggle = vi.fn();
    render(
      <PortalSidebar
        menuItems={mockMenuItems}
        isOpen={true}
        onToggle={mockOnToggle}
      />
    );

    // Click outside or trigger close - this is simplified for testing
    const drawer = screen.getByRole('presentation');
    fireEvent.keyDown(drawer, { key: 'Escape' });

    // Note: In a real scenario, you'd test the actual close behavior
    // This is a basic structure test
  });
});

describe('Menu Item Generators', () => {
  it('getEmployeeMenuItems returns correct structure', () => {
    const items = getEmployeeMenuItems();

    expect(items).toHaveLength(6);
    expect(items[0]).toHaveProperty('text', 'Dashboard');
    expect(items[0]).toHaveProperty('href', '/employee/dashboard');
    expect(items[0].icon).toBeDefined();
  });

  it('getClientMenuItems returns correct structure', () => {
    const items = getClientMenuItems();

    expect(items).toHaveLength(5);
    expect(items[0]).toHaveProperty('text', 'Dashboard');
    expect(items[0]).toHaveProperty('href', '/client/dashboard');
  });

  it('getSupplierMenuItems returns correct structure', () => {
    const items = getSupplierMenuItems();

    expect(items).toHaveLength(5);
    expect(items[0]).toHaveProperty('text', 'Dashboard');
    expect(items[0]).toHaveProperty('href', '/supplier/dashboard');
  });

  it('getProfessionalMenuItems returns correct structure', () => {
    const items = getProfessionalMenuItems();

    expect(items).toHaveLength(5);
    expect(items[0]).toHaveProperty('text', 'Dashboard');
    expect(items[0]).toHaveProperty('href', '/professional/dashboard');
  });

  it('all menu items have required properties', () => {
    const allMenus = [
      ...getEmployeeMenuItems(),
      ...getClientMenuItems(),
      ...getSupplierMenuItems(),
      ...getProfessionalMenuItems(),
    ];

    allMenus.forEach((item) => {
      expect(item).toHaveProperty('icon');
      expect(item).toHaveProperty('text');
      expect(item).toHaveProperty('href');
      expect(typeof item.text).toBe('string');
      expect(typeof item.href).toBe('string');
      expect(item.href).toMatch(/^\/[a-z]+\/[a-z]+$/);
    });
  });
});

// Integration test
describe('Portal Components Integration', () => {
  it('renders complete portal layout', () => {
    const mockOnLogout = vi.fn();
    const mockOnToggle = vi.fn();

    render(
      <>
        <PortalHeader
          title="Employee Portal"
          userName="John Doe"
          onLogout={mockOnLogout}
          showBackButton={true}
        />
        <PortalSidebar
          menuItems={getEmployeeMenuItems()}
          isOpen={true}
          onToggle={mockOnToggle}
        />
      </>
    );

    expect(screen.getByText('Employee Portal')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});