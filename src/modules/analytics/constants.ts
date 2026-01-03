import { Activity, Target, BrainCircuit, Database } from 'lucide-react';

export const ENGAGEMENT_DATA = [
  { name: 'Mon', engagement: 65, productivity: 80, sentiment: 72 },
  { name: 'Tue', engagement: 72, productivity: 85, sentiment: 78 },
  { name: 'Wed', engagement: 85, productivity: 82, sentiment: 84 },
  { name: 'Thu', engagement: 88, productivity: 90, sentiment: 82 },
  { name: 'Fri', engagement: 78, productivity: 75, sentiment: 80 },
];

export const GROWTH_DATA = [
  { name: 'Jan', count: 210, liability: 1.2 },
  { name: 'Feb', count: 225, liability: 1.3 },
  { name: 'Mar', count: 240, liability: 1.5 },
  { name: 'Apr', count: 235, liability: 1.4 },
  { name: 'May', count: 255, liability: 1.8 },
  { name: 'Jun', count: 280, liability: 2.1 },
];

export const DEMOGRAPHIC_DATA = [
  { name: 'Engineering', value: 45 },
  { name: 'Sales', value: 25 },
  { name: 'Product', value: 20 },
  { name: 'Finance', value: 10 },
];

import { PALETTE } from '@/theme/palette';

export const COLORS = PALETTE.charts;

export const ANALYTICS_STATS = [
  { label: 'Workforce Velocity', val: '24.2%', trend: '+4.5', icon: Activity, color: 'blue' },
  { label: 'Retention Vector', val: '94.8%', trend: '+2.1', icon: Target, color: 'indigo' },
  { label: 'Neural Alignment', val: '8.2/10', trend: '+0.5', icon: BrainCircuit, color: 'emerald' },
  { label: 'Asset Equity', val: '$2.4M', trend: 'Optimal', icon: Database, color: 'orange' },
];
