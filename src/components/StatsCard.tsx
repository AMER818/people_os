import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from './ui/Card';
import { cn } from '../lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  change,
  trend,
  icon: Icon,
  color,
}) => {
  // Map legacy colors to semantic tokens safely
  const getSemanticColor = (c: string) => {
    if (['emerald', 'green', 'success'].includes(c)) {
      return 'success';
    }
    if (['rose', 'red', 'destructive', 'danger'].includes(c)) {
      return 'danger';
    }
    if (['amber', 'yellow', 'orange', 'warning'].includes(c)) {
      return 'warning';
    }
    if (['purple', 'violet'].includes(c)) {
      return 'primary';
    } // Mapping purple to primary (quartz theme)
    return 'primary';
  };

  const semanticColor = getSemanticColor(color);

  const colorStyles = {
    primary: {
      soft: 'bg-primary-soft',
      text: 'text-primary',
      blob: 'bg-primary-soft/20',
    },
    success: {
      soft: 'bg-success-soft',
      text: 'text-success',
      blob: 'bg-success-soft/20',
    },
    warning: {
      soft: 'bg-warning-soft',
      text: 'text-warning',
      blob: 'bg-warning-soft/20',
    },
    danger: {
      soft: 'bg-danger-soft',
      text: 'text-danger',
      blob: 'bg-danger-soft/20',
    },
  };

  const styles = colorStyles[semanticColor as keyof typeof colorStyles] || colorStyles.primary;

  return (
    <Card
      aria-label={label}
      className="relative overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group border-border p-8"
    >
      <div
        className={cn(
          'absolute -bottom-10 -right-10 w-32 h-32 blur-3xl rounded-full transition-colors',
          styles.blob
        )}
      ></div>
      <div className="flex items-start justify-between mb-6">
        <div
          className={cn(
            'p-3 rounded-xl transition-transform group-hover:scale-110 shadow-sm',
            styles.soft,
            styles.text
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div
          className={cn(
            'flex items-center gap-1 text-[0.625rem] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border',
            trend === 'up'
              ? 'bg-success-soft text-success border-success/20'
              : trend === 'down'
                ? 'bg-danger-soft text-danger border-danger/20'
                : 'bg-muted text-text-muted border-border'
          )}
        >
          {trend === 'up' && <TrendingUp className="w-3 h-3" />}
          {trend === 'down' && <TrendingDown className="w-3 h-3" />}
          {trend === 'neutral' && <Minus className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      </div>
      <p className="text-text-muted text-[0.625rem] font-black uppercase tracking-widest mb-1">
        {label}
      </p>
      <h3 className="text-3xl font-black text-text-primary tracking-tighter">{value}</h3>
    </Card>
  );
};

export default StatsCard;
