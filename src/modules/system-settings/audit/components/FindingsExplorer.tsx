import React, { useState, useMemo } from 'react';
import {
    Search,
    ArrowUpRight,
    AlertTriangle,
    Info,
    CheckCircle2
} from 'lucide-react';

interface Finding {
    id: string;
    dimension: string;
    severity: string;
    title: string;
    description: string;
    recommendation: string;
    status?: string;
}

interface FindingsExplorerProps {
    findings: Finding[];
    onAcknowledge: (id: string) => void;
}

export const FindingsExplorer: React.FC<FindingsExplorerProps> = ({ findings, onAcknowledge }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSeverity, setFilterSeverity] = useState<string>('all');
    const [filterDimension, setFilterDimension] = useState<string>('all');

    const dimensions = useMemo(() => {
        const dims = new Set(findings.map(f => f.dimension));
        return ['all', ...Array.from(dims)];
    }, [findings]);

    const filteredFindings = useMemo(() => {
        return findings.filter(f => {
            const matchesSearch = f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                f.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSeverity = filterSeverity === 'all' || f.severity.toLowerCase() === filterSeverity.toLowerCase();
            const matchesDimension = filterDimension === 'all' || f.dimension === filterDimension;
            return matchesSearch && matchesSeverity && matchesDimension;
        });
    }, [findings, searchTerm, filterSeverity, filterDimension]);

    const getSeverityStyles = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'critical': return 'bg-danger/10 text-danger border-danger/20';
            case 'major': return 'bg-warning/10 text-warning border-warning/20';
            case 'minor': return 'bg-primary/10 text-primary border-primary/20';
            default: return 'bg-text-muted/10 text-text-muted border-text-muted/20';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'critical': return <AlertTriangle size={14} />;
            case 'major': return <AlertTriangle size={14} />;
            default: return <Info size={14} />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Search findings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl pl-12 pr-4 py-3 text-sm focus:border-primary transition-colors outline-none"
                        aria-label="Search audit findings"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        value={filterSeverity}
                        onChange={(e) => setFilterSeverity(e.target.value)}
                        className="bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none"
                        aria-label="Filter findings by severity"
                    >
                        <option value="all">All Severities</option>
                        <option value="critical">Critical</option>
                        <option value="major">Major</option>
                        <option value="minor">Minor</option>
                    </select>
                    <select
                        value={filterDimension}
                        onChange={(e) => setFilterDimension(e.target.value)}
                        className="bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none"
                        aria-label="Filter findings by dimension"
                    >
                        {dimensions.map(dim => (
                            <option key={dim} value={dim}>{dim === 'all' ? 'All Dimensions' : dim}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredFindings.length === 0 ? (
                    <div className="text-center py-12 bg-surface/50 rounded-3xl border border-dashed border-border">
                        <p className="text-text-muted">No findings matching your filters.</p>
                    </div>
                ) : (
                    filteredFindings.map(finding => (
                        <div key={finding.id} className="bg-surface border border-border rounded-2xl p-6 hover:border-primary/50 transition-all group">
                            <div className="flex flex-col md:flex-row gap-4 justify-between">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-md text-[0.625rem] font-black uppercase tracking-widest border ${getSeverityStyles(finding.severity)} flex items-center gap-1`}>
                                            {getSeverityIcon(finding.severity)}
                                            {finding.severity}
                                        </span>
                                        <span className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted">
                                            {finding.dimension}
                                        </span>
                                    </div>
                                    <h5 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors">
                                        {finding.title}
                                    </h5>
                                    <p className="text-sm text-text-muted leading-relaxed">
                                        {finding.description}
                                    </p>
                                    <div className="bg-background/50 rounded-xl p-4 mt-4">
                                        <div className="text-[0.625rem] font-black uppercase tracking-widest text-text-muted mb-1 flex items-center gap-2">
                                            <ArrowUpRight size={12} />
                                            Recommendation
                                        </div>
                                        <p className="text-sm font-medium text-text-primary">
                                            {finding.recommendation}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <button
                                        onClick={() => onAcknowledge(finding.id)}
                                        className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-all flex items-center gap-2"
                                        aria-label={`Acknowledge finding: ${finding.title}`}
                                    >
                                        <CheckCircle2 size={14} />
                                        Acknowledge
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
