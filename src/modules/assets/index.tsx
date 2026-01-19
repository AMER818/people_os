import React, { useState, useMemo, useEffect } from 'react';
import {
  Package,
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  MousePointer2,
  Cpu,
  Car,
  Activity,
  AlertTriangle,
  Database,
} from 'lucide-react';
import { Asset, AssetCategory } from '../../types';
import { CATEGORIES } from './constants';
import { api } from '../../services/api';

// Sub-components
import AssetStats from './AssetStats';
import AssetTable from './AssetTable';
import AssetGrid from './AssetGrid';
import AssetMaintenanceForecast from './AssetMaintenanceForecast';
import AssetLifecycleMatrix from './AssetLifecycleMatrix';
import ProvisionAssetModal from './ProvisionAssetModal';
import AssetAuditModal from './AssetAuditModal';
import AssetHeader from './AssetHeader';
import AssetControls from './AssetControls';

const AssetManagement: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    name: '',
    category: 'Laptop',
    serialNumber: '',
    status: 'Storage',
    custodianName: '---',
    specifications: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const data = await api.getAssets();
    setAssets(data);
    setIsLoading(false);
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.custodianName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || a.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, assets, filterCategory]);

  const stats = [
    { label: 'Asset Nodes', val: assets.length, icon: Package, color: 'blue' },
    {
      label: 'Utilization',
      val:
        assets.length > 0
          ? `${Math.round((assets.filter((a) => a.status === 'Deployed').length / assets.length) * 100)}%`
          : '0%',
      icon: Activity,
      color: 'emerald',
    },
    {
      label: 'Health Risk',
      val: assets.filter((a) => a.status === 'Maintenance').length,
      icon: AlertTriangle,
      color: 'rose',
    },
    { label: 'Fiscal Equity', val: '$584k', icon: Database, color: 'indigo' },
  ];

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    const assetNode: Asset = {
      id: `AST-${Math.floor(Math.random() * 9000) + 1000}`,
      name: newAsset.name || 'Generic Asset',
      category: newAsset.category as AssetCategory,
      serialNumber: newAsset.serialNumber || 'S/N-PENDING',
      custodianName: newAsset.custodianName || '---',
      custodianId: '',
      status: newAsset.status as any,
      assignedDate: newAsset.status === 'Deployed' ? new Date().toISOString().split('T')[0] : '---',
      specifications: newAsset.specifications,
    };
    await api.saveAsset(assetNode);
    await loadData();
    setIsModalOpen(false);
    setNewAsset({
      name: '',
      category: 'Laptop',
      serialNumber: '',
      status: 'Storage',
      custodianName: '---',
      specifications: '',
    });
  };

  const handleStatusChange = async (id: string, status: Asset['status']) => {
    await api.updateAssetStatus(id, status);
    await loadData();
    if (selectedAsset?.id === id) {
      setSelectedAsset((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const getCategoryIcon = (cat: AssetCategory) => {
    switch (cat) {
      case 'Laptop':
        return <Laptop size={20} />;
      case 'Desktop PC':
        return <Monitor size={20} />;
      case 'Mobile':
        return <Smartphone size={20} />;
      case 'Tablet':
        return <Tablet size={20} />;
      case 'Vehicle':
        return <Car size={20} />;
      case 'IT Gadget':
        return <MousePointer2 size={20} />;
      case 'Network':
        return <Cpu size={20} />;
      default:
        return <Package size={20} />;
    }
  };

  return (
    <div
      className="space-y-12 animate-in fade-in duration-700 pb-20"
      aria-label="Asset Management Module"
    >
      <AssetHeader onReset={loadData} onProvision={() => setIsModalOpen(true)} />

      <AssetStats stats={stats} />

      <div className="bg-card rounded-[2rem] border border-border shadow-2xl overflow-hidden min-h-[43.75rem] flex flex-col">
        <AssetControls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          view={view}
          setView={setView}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          categories={CATEGORIES}
        />

        {isLoading ? (
          <div className="p-12 text-center text-slate-500">Loading assets...</div>
        ) : view === 'list' ? (
          <AssetTable
            assets={filteredAssets}
            getCategoryIcon={getCategoryIcon}
            onSelectAsset={setSelectedAsset}
          />
        ) : (
          <AssetGrid
            assets={filteredAssets}
            getCategoryIcon={getCategoryIcon}
            onSelectAsset={setSelectedAsset}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <AssetMaintenanceForecast />
        <AssetLifecycleMatrix />
      </div>

      {isModalOpen && (
        <ProvisionAssetModal
          newAsset={newAsset}
          setNewAsset={setNewAsset}
          onEnroll={handleEnroll}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {selectedAsset && (
        <AssetAuditModal
          asset={selectedAsset}
          getCategoryIcon={getCategoryIcon}
          onStatusChange={handleStatusChange}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  );
};

export default AssetManagement;
