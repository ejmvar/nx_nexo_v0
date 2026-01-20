import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  Paper,
  Chip,
} from '@mui/material';

// Color palette for charts
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'
];

// Common chart props interface
export interface ChartData {
  [key: string]: any;
}

export interface BaseChartProps {
  data: ChartData[];
  title?: string;
  height?: number;
  className?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
}

// Line Chart Component
export interface LineChartProps extends BaseChartProps {
  xKey: string;
  yKeys: string[];
  strokeColors?: string[];
  strokeWidth?: number;
}

export function LineChartComponent({
  data,
  xKey,
  yKeys,
  title,
  height = 300,
  className,
  showLegend = true,
  showTooltip = true,
  strokeColors = COLORS,
  strokeWidth = 2,
}: LineChartProps) {
  const theme = useTheme();

  return (
    <Paper className={className} sx={{ p: 2, width: '100%' }}>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey={xKey}
            stroke={theme.palette.text.secondary}
            fontSize={12}
          />
          <YAxis
            stroke={theme.palette.text.secondary}
            fontSize={12}
          />
          {showTooltip && <Tooltip contentStyle={{ backgroundColor: theme.palette.background.paper }} />}
          {showLegend && <Legend />}
          {yKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={strokeColors[index % strokeColors.length]}
              strokeWidth={strokeWidth}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}

// Area Chart Component
export interface AreaChartProps extends BaseChartProps {
  xKey: string;
  yKeys: string[];
  fillColors?: string[];
  strokeColors?: string[];
}

export function AreaChartComponent({
  data,
  xKey,
  yKeys,
  title,
  height = 300,
  className,
  showLegend = true,
  showTooltip = true,
  fillColors = COLORS,
  strokeColors = COLORS,
}: AreaChartProps) {
  const theme = useTheme();

  return (
    <Paper className={className} sx={{ p: 2, width: '100%' }}>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey={xKey}
            stroke={theme.palette.text.secondary}
            fontSize={12}
          />
          <YAxis
            stroke={theme.palette.text.secondary}
            fontSize={12}
          />
          {showTooltip && <Tooltip contentStyle={{ backgroundColor: theme.palette.background.paper }} />}
          {showLegend && <Legend />}
          {yKeys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId="1"
              stroke={strokeColors[index % strokeColors.length]}
              fill={fillColors[index % fillColors.length]}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
}

// Bar Chart Component
export interface BarChartProps extends BaseChartProps {
  xKey: string;
  yKeys: string[];
  fillColors?: string[];
}

export function BarChartComponent({
  data,
  xKey,
  yKeys,
  title,
  height = 300,
  className,
  showLegend = true,
  showTooltip = true,
  fillColors = COLORS,
}: BarChartProps) {
  const theme = useTheme();

  return (
    <Paper className={className} sx={{ p: 2, width: '100%' }}>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey={xKey}
            stroke={theme.palette.text.secondary}
            fontSize={12}
          />
          <YAxis
            stroke={theme.palette.text.secondary}
            fontSize={12}
          />
          {showTooltip && <Tooltip contentStyle={{ backgroundColor: theme.palette.background.paper }} />}
          {showLegend && <Legend />}
          {yKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={fillColors[index % fillColors.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}

// Pie Chart Component
export interface PieChartProps extends BaseChartProps {
  dataKey: string;
  nameKey: string;
  colors?: string[];
  innerRadius?: number;
  outerRadius?: number;
}

export function PieChartComponent({
  data,
  dataKey,
  nameKey,
  title,
  height = 300,
  className,
  showLegend = true,
  showTooltip = true,
  colors = COLORS,
  innerRadius = 0,
  outerRadius = 80,
}: PieChartProps) {
  const theme = useTheme();

  return (
    <Paper className={className} sx={{ p: 2, width: '100%' }}>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          {showTooltip && <Tooltip contentStyle={{ backgroundColor: theme.palette.background.paper }} />}
          {showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
}

// Donut Chart Component (specialized Pie Chart)
export interface DonutChartProps extends Omit<PieChartProps, 'innerRadius'> {
  innerRadius?: number;
}

export function DonutChartComponent({
  data,
  dataKey,
  nameKey,
  title,
  height = 300,
  className,
  showLegend = true,
  showTooltip = true,
  colors = COLORS,
  innerRadius = 40,
  outerRadius = 80,
}: DonutChartProps) {
  return (
    <PieChartComponent
      data={data}
      dataKey={dataKey}
      nameKey={nameKey}
      title={title}
      height={height}
      className={className}
      showLegend={showLegend}
      showTooltip={showTooltip}
      colors={colors}
      innerRadius={innerRadius}
      outerRadius={outerRadius}
    />
  );
}

// KPI Card Component for displaying key metrics
export interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
  };
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export function KPICard({
  title,
  value,
  change,
  icon,
  color = 'primary',
  className,
}: KPICardProps) {
  const theme = useTheme();

  return (
    <Card className={className} sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
          {icon && (
            <Box color={theme.palette[color].main}>
              {icon}
            </Box>
          )}
        </Box>
        <Typography variant="h4" component="div" gutterBottom>
          {value}
        </Typography>
        {change && (
          <Chip
            label={`${change.value > 0 ? '+' : ''}${change.value}% ${change.label}`}
            color={change.value >= 0 ? 'success' : 'error'}
            size="small"
            variant="outlined"
          />
        )}
      </CardContent>
    </Card>
  );
}

// Chart Grid Component for dashboard layouts
export interface ChartGridProps {
  children: React.ReactNode;
  columns?: number;
  spacing?: number;
  className?: string;
}

export function ChartGrid({
  children,
  columns = 2,
  spacing = 2,
  className,
}: ChartGridProps) {
  return (
    <Box
      className={className}
      display="grid"
      gridTemplateColumns={`repeat(${columns}, 1fr)`}
      gap={spacing}
      sx={{
        '@media (max-width: 768px)': {
          gridTemplateColumns: '1fr',
        },
      }}
    >
      {children}
    </Box>
  );
}