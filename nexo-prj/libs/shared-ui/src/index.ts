export * from './lib/portal-components';

// Explicitly export the DataTableColumn type for Next.js compatibility
export type DataTableColumn<T = any> = {
  id: string;
  header: string;
  accessorKey: keyof T;
  cell?: (props: { row: { original: T } }) => React.ReactNode;
};

// Also export a runtime value to ensure the type is available
export const DataTableColumn = {} as any;