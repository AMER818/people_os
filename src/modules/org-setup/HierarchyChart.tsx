import React, { useState } from 'react';
import { useOrgStore } from '@/store/orgStore';
import {
  Network,
  Building2,
  Users,
  ChevronRight,
  ChevronDown,
  Factory,
  Building,
  Briefcase,
  Award,
  Maximize2,
  Minimize2,
} from 'lucide-react';

type ViewMode = 'structural' | 'employment';

const TreeNode = ({
  label,
  type,
  children,
  icon: Icon,
  expanded = true,
}: {
  label: string;
  type: string;
  children?: React.ReactNode;
  icon: any;
  expanded?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  return (
    <div className="flex flex-col items-center">
      <div
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg border shadow-sm cursor-pointer transition-all
          ${type === 'root' ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(37,99,235,0.6)]' : 'card-vibrant hover:border-primary hover:shadow-[0_0_15px_rgba(37,99,235,0.3)]'}
        `}
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        aria-expanded={isExpanded}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        aria-label={`${label} (${type})`}
      >
        <Icon
          size={16}
          className={type === 'root' ? 'text-primary-foreground' : 'text-text-muted'}
        />
        <span className="font-medium text-sm whitespace-nowrap text-text-primary">{label}</span>
        {children && (
          <div className="ml-2">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
        )}
      </div>

      {isExpanded && children && (
        <div className="flex flex-col items-center animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="h-6 w-px bg-border"></div>
          <div className="flex gap-6 items-start">
            {React.Children.map(children, (child, index) => {
              if (!React.isValidElement(child)) {
                return null;
              }
              const isLast = index === React.Children.count(children) - 1;
              const isFirst = index === 0;
              const isOnly = React.Children.count(children) === 1;

              return (
                <div className="flex flex-col items-center relative">
                  {/* Top Connector Line logic */}
                  {!isOnly && (
                    <>
                      <div
                        className={`absolute top-0 w-1/2 h-px bg-border ${isFirst ? 'right-0' : 'left-0'}`}
                      ></div>
                      {!isFirst && !isLast && (
                        <div className="absolute top-0 w-full h-px bg-border"></div>
                      )}
                    </>
                  )}
                  {child}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const HierarchyChart: React.FC = () => {
  const { plants, departments, designations, jobLevels, grades, profile } = useOrgStore();

  const [viewMode, setViewMode] = useState<ViewMode>('structural');
  const [treeKey, setTreeKey] = useState(0);
  const [defaultExpanded, setDefaultExpanded] = useState(false);

  // Handlers for Expand/Collapse All
  const handleExpandAll = () => {
    setDefaultExpanded(true);
    setTreeKey((prev) => prev + 1);
  };

  const handleCollapseAll = () => {
    setDefaultExpanded(false);
    setTreeKey((prev) => prev + 1);
  };

  const renderStructuralTree = () => {
    return (
      <TreeNode label={profile.name || 'Organization'} type="root" icon={Building2} expanded={true}>
        {plants.map((plant) => (
          <TreeNode
            key={plant.id}
            label={plant.name}
            type="plant"
            icon={Factory}
            expanded={defaultExpanded}
          >
            {departments
              .filter((d) => d.plantId === plant.id)
              .map((dept) => (
                <TreeNode
                  key={dept.id}
                  label={dept.name}
                  type="department"
                  icon={Building}
                  expanded={defaultExpanded}
                >
                  {designations
                    .filter((desig) => desig.departmentId === dept.id)
                    .map((desig) => (
                      <TreeNode key={desig.id} label={desig.name} type="designation" icon={Users} />
                    ))}
                  {/* Handle Empty State */}
                  {designations.filter((desig) => desig.departmentId === dept.id).length === 0 && (
                    <div className="text-xs text-text-muted italic py-2">No Designations</div>
                  )}
                </TreeNode>
              ))}
          </TreeNode>
        ))}
      </TreeNode>
    );
  };

  const renderEmploymentTree = () => {
    // Sort levels by hierarchy if possible, otherwise list them
    // Assuming grades link to levels
    return (
      <TreeNode label={profile.name || 'Organization'} type="root" icon={Building2} expanded={true}>
        {jobLevels.map((level: any) => {
          const levelGrades = grades.filter((g) => g.jobLevelId === level.id);
          // Sort grades by level number if available
          levelGrades.sort((a, b) => a.level - b.level);

          return (
            <TreeNode
              key={level.id}
              label={level.name}
              type="level"
              icon={Briefcase}
              expanded={defaultExpanded}
            >
              {levelGrades.map((grade) => (
                <TreeNode
                  key={grade.id}
                  label={grade.name}
                  type="grade"
                  icon={Award}
                  expanded={defaultExpanded}
                >
                  {designations
                    .filter((desig) => desig.gradeId === grade.id)
                    .map((desig) => (
                      <TreeNode key={desig.id} label={desig.name} type="designation" icon={Users} />
                    ))}
                </TreeNode>
              ))}
              {levelGrades.length === 0 && (
                <div className="text-xs text-text-muted italic py-2">No Grades</div>
              )}
            </TreeNode>
          );
        })}
      </TreeNode>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 card-vibrant p-4">
        <div>
          <h2 className="text-lg font-bold text-vibrant flex items-center gap-2">
            <Network className="text-primary" size={20} />
            Organization Chart
          </h2>
          <p className="text-sm text-text-muted">View the company structure.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggles */}
          <div className="flex bg-bg p-1 rounded-lg border border-border">
            <button
              onClick={() => setViewMode('structural')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                viewMode === 'structural'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Department View
            </button>
            <button
              onClick={() => setViewMode('employment')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                viewMode === 'employment'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Seniority View
            </button>
          </div>

          {/* Expand/Collapse Actions */}
          <div className="flex bg-surface p-1 rounded-lg border border-border/50 gap-1 ml-2">
            <button
              onClick={handleExpandAll}
              className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
              title="Expand All"
              aria-label="Expand All"
            >
              <Maximize2 size={18} />
            </button>
            <button
              onClick={handleCollapseAll}
              className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
              title="Collapse All"
              aria-label="Collapse All"
            >
              <Minimize2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-8 pt-4">
        <div
          key={treeKey}
          className="min-w-max mx-auto px-8 animate-in fade-in zoom-in-95 duration-300"
        >
          {viewMode === 'structural' ? renderStructuralTree() : renderEmploymentTree()}
        </div>
      </div>
    </div>
  );
};

export default HierarchyChart;
