import { Box, Grid, MenuItem, Select, FormControl, InputLabel, FormHelperText } from '@mui/material';
import { FormProvider, FormField, SubmitButton, FormSection, useFormContext } from './shared-ui';

export interface DataEntryFormData {
  [key: string]: any;
}

interface DataEntryField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'select';
  required?: boolean;
  helperText?: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  options?: { value: string | number; label: string }[];
  gridSize?: { xs?: number; sm?: number; md?: number; lg?: number };
}

interface DataEntryFormProps {
  fields: DataEntryField[];
  onSubmit: (data: DataEntryFormData) => void | Promise<void>;
  loading?: boolean;
  error?: string;
  title?: string;
  submitLabel?: string;
  defaultValues?: DataEntryFormData;
  columns?: number;
}

// Select Field Component
function SelectField({ field }: { field: DataEntryField }) {
  const { form } = useFormContext();
  const {
    register,
    formState: { errors },
  } = form;

  const error = errors[field.name];
  const errorMessage = error?.message as string;

  return (
    <FormControl
      fullWidth
      error={!!error}
      sx={{ mb: 2 }}
      size="small"
    >
      <InputLabel htmlFor={field.name}>{field.label}</InputLabel>
      <Select
        id={field.name}
        label={field.label}
        disabled={field.disabled}
        {...register(field.name, {
          required: field.required ? `${field.label} is required` : false,
        })}
      >
        {field.options?.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {(errorMessage || field.helperText) && (
        <FormHelperText>{errorMessage || field.helperText}</FormHelperText>
      )}
    </FormControl>
  );
}

export function DataEntryForm({
  fields,
  onSubmit,
  loading = false,
  error,
  title,
  submitLabel = 'Submit',
  defaultValues = {},
  columns = 1,
}: DataEntryFormProps) {
  const handleSubmit = async (data: DataEntryFormData) => {
    await onSubmit(data);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {title && (
        <Box sx={{ mb: 3 }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>{title}</h2>
        </Box>
      )}

      {error && (
        <Box sx={{ mb: 2 }}>
          <div style={{ color: 'red', fontSize: '0.875rem' }}>{error}</div>
        </Box>
      )}

      <FormProvider<DataEntryFormData>
        onSubmit={handleSubmit}
        defaultValues={defaultValues}
        mode="onChange"
      >
        <FormSection>
          <Grid container spacing={2}>
            {fields.map((field) => {
              const gridSize = field.gridSize || {};
              const gridProps = columns > 1 ? gridSize : {};

              return (
                <Grid key={field.name} size={{ xs: 12, ...gridProps }}>
                  {field.type === 'select' ? (
                    <SelectField field={field} />
                  ) : (
                    <FormField
                      name={field.name}
                      label={field.label}
                      type={field.type || 'text'}
                      required={field.required}
                      helperText={field.helperText}
                      disabled={field.disabled}
                      multiline={field.multiline}
                      rows={field.rows}
                    />
                  )}
                </Grid>
              );
            })}
          </Grid>
        </FormSection>

        <SubmitButton loading={loading}>
          {submitLabel}
        </SubmitButton>
      </FormProvider>
    </Box>
  );
}