import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { PALETTE } from '@/theme/palette';
import { formatDate } from '@/utils/formatting';

interface AuditReport {
  id: string;
  created_at: string;
  overall_score: number;
  risk_level: string;
}

export const TrendAnalysis: React.FC = () => {
  const [data, setData] = useState<AuditReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/system/audit/reports');
        const json = await response.json();
        if (json.reports) {
          // Format date for chart
          const formattedUrl = json.reports.map((r: any) => ({
            ...r,
            date: formatDate(r.created_at),
            score: r.overall_score,
          }));
          setData(formattedUrl);
        }
      } catch (error) {
        console.error('Failed to fetch audit trends', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-4">Loading trends...</div>;
  }

  return (
    <Card className="col-span-4 bg-white/5 border border-white/10 backdrop-blur-xl rounded-[3rem] hover:bg-white/10 transition-all relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none"></div>
      <CardHeader className="relative z-10">
        <CardTitle>System Health Trends</CardTitle>
      </CardHeader>
      <CardContent className="pl-2 relative z-10">
        <div className="h-[18.75rem] w-full" role="img" aria-label="System Health Trends Chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                stroke={PALETTE.axis}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={PALETTE.axis}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 5]}
                tickCount={6}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: `0.0625rem solid ${PALETTE.border}`,
                  borderRadius: '0.25rem',
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke={PALETTE.primary}
                strokeWidth={2}
                activeDot={{ r: 8 }}
                name="Health Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
