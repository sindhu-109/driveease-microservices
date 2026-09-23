import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { getAllVehicles } from '../services/vehicleService';
import VehicleCard from '../components/VehicleCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const STATUS_FILTERS = [
  { value: 'all',       label: 'All'       },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'RESERVED',  label: 'Reserved'  },
  { value: 'RENTED',    label: 'Rented'    },
];

export default function Vehicles() {
  const [vehicles, setVehicles]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [statusFilter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      // GET /ms2/vehicles → VehicleResponse[]
      const data = await getAllVehicles();
      setVehicles(data);
    } catch {
      setError('Cannot reach the Vehicle Service. Make sure MS2 is running on :8002.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = vehicles.filter((v) => {
    const matchSearch = !search.trim()
      || v.model?.toLowerCase().includes(search.toLowerCase())
      || v.type?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || v.availabilityStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Fleet Vehicles</h1>
          <p className="page-subtitle">Browse and book available fleet assets.</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input type="text" className="search-input"
            placeholder="Search by type or model…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="filter-pills">
          {STATUS_FILTERS.map((f) => (
            <button key={f.value}
              className={`pill ${statusFilter === f.value ? 'pill-active' : ''}`}
              onClick={() => setFilter(f.value)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <Loading message="Loading vehicles…" />}
      {!loading && error && <ErrorMessage message={error} onRetry={load} />}

      {!loading && !error && (
        filtered.length === 0
          ? <div className="empty-state"><p>No vehicles match your filter.</p></div>
          : <div className="vehicle-grid">
              {filtered.map((v) => <VehicleCard key={v.vehicleId} vehicle={v} />)}
            </div>
      )}
    </div>
  );
}
