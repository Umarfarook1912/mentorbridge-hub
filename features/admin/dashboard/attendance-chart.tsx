'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { FeatureCardSection } from '@/components/shared/data-display/feature-card'
import { Skeleton } from '@/components/ui/skeleton'
import { useMonthlyAttendance } from './use-dashboard-stats'

export function AttendanceChart() {
  const { data, isLoading } = useMonthlyAttendance()

  return (
    <FeatureCardSection title="Monthly Attendance">
      {isLoading ? (
        <Skeleton className="h-[220px] w-full" />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-popover)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar
              dataKey="present"
              name="Present"
              fill="var(--color-success)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="absent"
              name="Absent"
              fill="var(--color-destructive)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="permission"
              name="Permission"
              fill="var(--color-warning)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </FeatureCardSection>
  )
}
