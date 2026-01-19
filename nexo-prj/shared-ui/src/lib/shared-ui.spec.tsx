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
import { DataTable, SimpleTable, DataTableColumn } from './data-table';
import {
  LineChartComponent,
  AreaChartComponent,
  BarChartComponent,
  PieChartComponent,
  DonutChartComponent,
  KPICard,
  ChartGrid,
} from './charts';
import {
  PDFViewer,
  PDFThumbnail,
  PDFThumbnails,
  PDFViewerWithThumbnails,
} from './pdf-viewer';

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

  describe('DataTable', () => {
    interface TestData {
      id: number;
      name: string;
      email: string;
      role: string;
    }

    const mockData: TestData[] = [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
    ];

    const mockColumns: DataTableColumn<TestData>[] = [
      { id: 'name', header: 'Name', accessorKey: 'name' },
      { id: 'email', header: 'Email', accessorKey: 'email' },
      { id: 'role', header: 'Role', accessorKey: 'role' },
    ];

    it('should render table with data', () => {
      render(<DataTable data={mockData} columns={mockColumns} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getAllByText('User')).toHaveLength(2);
    });

    it('should render table headers', () => {
      render(<DataTable data={mockData} columns={mockColumns} />);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
    });

    it('should show title when provided', () => {
      render(<DataTable data={mockData} columns={mockColumns} title="Test Table" />);

      expect(screen.getByText('Test Table')).toBeInTheDocument();
    });

    it('should show empty message when no data', () => {
      render(<DataTable data={[]} columns={mockColumns} emptyMessage="No users found" />);

      expect(screen.getByText('No users found')).toBeInTheDocument();
    });

    it('should render loading state', () => {
      render(<DataTable data={[]} columns={mockColumns} loading />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render row selection checkboxes when enabled', () => {
      render(<DataTable data={mockData} columns={mockColumns} enableRowSelection />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });

  describe('SimpleTable', () => {
    interface TestData {
      id: number;
      name: string;
      email: string;
    }

    const mockData: TestData[] = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ];

    const mockColumns = [
      { key: 'name' as keyof TestData, header: 'Name' },
      { key: 'email' as keyof TestData, header: 'Email' },
    ];

    it('should render simple table with data', () => {
      render(<SimpleTable data={mockData} columns={mockColumns} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('should render table headers', () => {
      render(<SimpleTable data={mockData} columns={mockColumns} />);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('should show title when provided', () => {
      render(<SimpleTable data={mockData} columns={mockColumns} title="Simple Test Table" />);

      expect(screen.getByText('Simple Test Table')).toBeInTheDocument();
    });

    it('should render custom cell content', () => {
      const columnsWithRender = [
        {
          key: 'name' as keyof TestData,
          header: 'Name',
          render: (value: string) => <strong>{value.toUpperCase()}</strong>,
        },
        { key: 'email' as keyof TestData, header: 'Email' },
      ];

      render(<SimpleTable data={mockData} columns={columnsWithRender} />);

      expect(screen.getByText('JOHN DOE')).toBeInTheDocument();
    });
  });
});

describe('Chart Components', () => {
  const mockChartData = [
    { month: 'Jan', sales: 4000, profit: 2400, users: 1200 },
    { month: 'Feb', sales: 3000, profit: 1398, users: 1100 },
    { month: 'Mar', sales: 2000, profit: 9800, users: 1300 },
    { month: 'Apr', sales: 2780, profit: 3908, users: 1400 },
  ];

  const mockPieData = [
    { name: 'Desktop', value: 400 },
    { name: 'Mobile', value: 300 },
    { name: 'Tablet', value: 200 },
  ];

  describe('LineChartComponent', () => {
    it('should render line chart with data', () => {
      render(
        <LineChartComponent
          data={mockChartData}
          xKey="month"
          yKeys={['sales', 'profit']}
          title="Sales & Profit"
        />
      );

      expect(screen.getByText('Sales & Profit')).toBeInTheDocument();
    });

    it('should render without title', () => {
      render(
        <LineChartComponent
          data={mockChartData}
          xKey="month"
          yKeys={['sales']}
        />
      );

      // Chart should render without title
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('AreaChartComponent', () => {
    it('should render area chart with data', () => {
      render(
        <AreaChartComponent
          data={mockChartData}
          xKey="month"
          yKeys={['sales', 'profit']}
          title="Area Chart"
        />
      );

      expect(screen.getByText('Area Chart')).toBeInTheDocument();
    });
  });

  describe('BarChartComponent', () => {
    it('should render bar chart with data', () => {
      render(
        <BarChartComponent
          data={mockChartData}
          xKey="month"
          yKeys={['sales', 'users']}
          title="Bar Chart"
        />
      );

      expect(screen.getByText('Bar Chart')).toBeInTheDocument();
    });
  });

  describe('PieChartComponent', () => {
    it('should render pie chart with data', () => {
      render(
        <PieChartComponent
          data={mockPieData}
          dataKey="value"
          nameKey="name"
          title="Device Usage"
        />
      );

      expect(screen.getByText('Device Usage')).toBeInTheDocument();
    });

    it('should display percentage labels', () => {
      render(
        <PieChartComponent
          data={mockPieData}
          dataKey="value"
          nameKey="name"
        />
      );

      // Check that the chart container is rendered (labels are in SVG)
      expect(document.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });
  });

  describe('DonutChartComponent', () => {
    it('should render donut chart with data', () => {
      render(
        <DonutChartComponent
          data={mockPieData}
          dataKey="value"
          nameKey="name"
          title="Donut Chart"
        />
      );

      expect(screen.getByText('Donut Chart')).toBeInTheDocument();
    });
  });

  describe('KPICard', () => {
    it('should render KPI card with title and value', () => {
      render(
        <KPICard
          title="Total Sales"
          value="$12,345"
        />
      );

      expect(screen.getByText('Total Sales')).toBeInTheDocument();
      expect(screen.getByText('$12,345')).toBeInTheDocument();
    });

    it('should render with change indicator', () => {
      render(
        <KPICard
          title="Revenue"
          value="10,000"
          change={{ value: 15.5, label: 'vs last month' }}
        />
      );

      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('10,000')).toBeInTheDocument();
      expect(screen.getByText('+15.5% vs last month')).toBeInTheDocument();
    });

    it('should render with negative change', () => {
      render(
        <KPICard
          title="Expenses"
          value="5,000"
          change={{ value: -8.2, label: 'vs last month' }}
        />
      );

      expect(screen.getByText('-8.2% vs last month')).toBeInTheDocument();
    });
  });

  describe('ChartGrid', () => {
    it('should render children in grid layout', () => {
      render(
        <ChartGrid columns={2}>
          <div>Chart 1</div>
          <div>Chart 2</div>
          <div>Chart 3</div>
        </ChartGrid>
      );

      expect(screen.getByText('Chart 1')).toBeInTheDocument();
      expect(screen.getByText('Chart 2')).toBeInTheDocument();
      expect(screen.getByText('Chart 3')).toBeInTheDocument();
    });
  });
});

describe('PDF Components', () => {
  // Mock PDF.js
  beforeAll(() => {
    // Mock PDF.js library
    (window as any).pdfjsLib = {
      getDocument: vi.fn(() => ({
        promise: Promise.resolve({
          numPages: 3,
          getPage: vi.fn((pageNum) => ({
            getViewport: vi.fn(() => ({ width: 600, height: 800 })),
            getTextContent: vi.fn(() => ({
              items: [{ str: 'Sample text' }]
            })),
            render: vi.fn(() => ({ promise: Promise.resolve() }))
          }))
        })
      })),
      GlobalWorkerOptions: {
        workerSrc: ''
      }
    };
  });

  describe('PDFViewer', () => {
    it('should render loading state initially', () => {
      render(<PDFViewer url="test.pdf" />);

      expect(screen.getByText('Loading PDF...')).toBeInTheDocument();
    });

    it('should render with custom title', () => {
      render(<PDFViewer url="test.pdf" showToolbar={false} />);

      // Should not show toolbar when disabled
      expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
    });

    it('should handle error state', async () => {
      // Mock a failed PDF load
      (window as any).pdfjsLib.getDocument.mockImplementationOnce(() => ({
        promise: Promise.reject(new Error('Failed to load PDF'))
      }));

      const onError = vi.fn();
      render(<PDFViewer url="invalid.pdf" onError={onError} />);

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });
  });

  describe('PDFThumbnail', () => {
    it('should render loading state', () => {
      render(<PDFThumbnail url="test.pdf" pageNumber={1} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should render page number', () => {
      render(<PDFThumbnail url="test.pdf" pageNumber={2} />);

      expect(screen.getByText('Page 2')).toBeInTheDocument();
    });

    it('should handle click events', () => {
      const onClick = vi.fn();
      render(<PDFThumbnail url="test.pdf" pageNumber={1} onClick={onClick} />);

      fireEvent.click(screen.getByText('Page 1').closest('div')!);
      expect(onClick).toHaveBeenCalledWith(1);
    });
  });

  describe('PDFThumbnails', () => {
    it('should render thumbnails for all pages', () => {
      render(
        <PDFThumbnails
          url="test.pdf"
          numPages={3}
          currentPage={1}
          onPageSelect={vi.fn()}
        />
      );

      expect(screen.getByText('Pages')).toBeInTheDocument();
      expect(screen.getAllByText(/Page \d/)).toHaveLength(3);
    });
  });

  describe('PDFViewerWithThumbnails', () => {
    it('should render viewer with thumbnails when pages are loaded', async () => {
      render(<PDFViewerWithThumbnails url="test.pdf" />);

      // Initially should show loading
      expect(screen.getByText('Loading PDF...')).toBeInTheDocument();

      // After PDF loads, thumbnails should appear
      await waitFor(() => {
        expect(screen.getByText('Pages')).toBeInTheDocument();
      });
    });

    it('should hide thumbnails when disabled', () => {
      render(<PDFViewerWithThumbnails url="test.pdf" showThumbnails={false} />);

      expect(screen.queryByText('Pages')).not.toBeInTheDocument();
    });
  });
});
