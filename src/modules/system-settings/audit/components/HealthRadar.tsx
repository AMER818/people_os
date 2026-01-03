import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts';

interface DimensionScore {
    dimension: string;
    score: number;
}

interface HealthRadarProps {
    data: DimensionScore[];
}

export const HealthRadar: React.FC<HealthRadarProps> = ({ data }) => {
    // Map dimension names for display
    const chartData = data.map(item => ({
        subject: item.dimension.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        A: item.score,
        fullMark: 5
    }));

    return (
        <div role="img" aria-label="System Health Radar Chart" className="bg-surface border border-border rounded-3xl p-8 h-[28.125rem]">
            <h3 className="text-lg font-black text-text-primary uppercase tracking-tight mb-6">
                System Health Profile
            </h3>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 'bold' }}
                    />
                    <PolarRadiusAxis
                        angle={30}
                        domain={[0, 5]}
                        tick={false}
                        axisLine={false}
                    />
                    <Radar
                        name="Health Score"
                        dataKey="A"
                        stroke="var(--primary)"
                        fill="var(--primary)"
                        fillOpacity={0.4}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--surface)',
                            border: '0.0625rem solid var(--border)',
                            borderRadius: '0.75rem',
                            fontSize: '0.75rem'
                        }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};
