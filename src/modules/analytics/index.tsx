import React from 'react';
import { Download, Filter } from 'lucide-react';
import { ENGAGEMENT_DATA, DEMOGRAPHIC_DATA, COLORS, ANALYTICS_STATS } from './constants';

// Sub-components
import AnalyticsStats from './AnalyticsStats';
import ProductivityMatrix from './ProductivityMatrix';
import NeuralModeling from './NeuralModeling';
import ClusterDensity from './ClusterDensity';
import EntropyAlert from './EntropyAlert';
import EfficiencyPulse from './EfficiencyPulse';
import ForecastingMatrix from './ForecastingMatrix';
import PredictiveWorkforce from './PredictiveWorkforce';

const AnalyticsInsights: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none uppercase antialiased">
            Analytics
          </h1>
          <p className="text-muted-foreground mt-4 font-black uppercase tracking-[0.4em] text-[0.75rem] flex items-center gap-4">
            <span className="w-10 h-[0.125rem] bg-primary"></span>
            Workforce Intelligence & Strategic Projection
          </p>
        </div>
        <div className="flex gap-4 p-4 bg-card rounded-[2rem] shadow-2xl border border-border">
          <button
            aria-label="Filter analytics"
            className="bg-secondary p-4 rounded-2xl text-muted-foreground hover:text-primary transition-all"
          >
            <Filter size={20} />
          </button>
          <button className="bg-primary text-primary-foreground px-12 py-4 rounded-[1.375rem] font-black uppercase text-[0.625rem] tracking-widest flex items-center gap-4 shadow-2xl hover:scale-105 active:scale-95 transition-all">
            <Download size={18} /> Export Report
          </button>
        </div>
      </div>

      <AnalyticsStats stats={ANALYTICS_STATS} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          <ProductivityMatrix data={ENGAGEMENT_DATA} />
          <ForecastingMatrix />
          <PredictiveWorkforce />
          <NeuralModeling />
        </div>

        <div className="lg:col-span-4 space-y-12">
          <ClusterDensity data={DEMOGRAPHIC_DATA} colors={COLORS} />
          <EntropyAlert />
          <EfficiencyPulse />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsInsights;
