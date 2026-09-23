import { useEffect, useState, useCallback } from 'react';
import { Plus, RefreshCw, Search } from 'lucide-react';
import {
  getAllVehicles, createVehicle, updateVehicle,
  deleteVehicle, updateVehicleStatus,
} from '../services/vehicleService';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmDialog from '../components/ConfirmDialog';
import { extractError } from '../utils/errorUtils';

// VehicleRequest fields: type, model, rentalPrice (no availabilityStatus)
const EMPTY_FORM = { type: '', model: '', rentalPrice: '' };
const STATUS_OPTIONS = ['AVAILABLE', 'RESERVED', 'RENTED'];

export default function ManageVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [actErr, setActErr]     = useState('');
  const [search, setSearch]     = useState('');

  const [modal, setModal]     = useState({ open: false, mode: 'create', vehicle: null });
  const [form, setForm]       = useState(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const [formErr, setFormErr] = useState('');

  const [delConfirm, setDelConfirm] = useState({ open: false, vehicle: null });

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      setVehicles(await getAllVehicles()); // GET /ms2/vehicles
    } catch { setError('Cannot reach Vehicle Service.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = vehicles.filter(v =>
    !search.trim() ||
    v.model?.toLowerCase().includes(search.toLowerCase()) ||
    v.type?.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Modal ── */
  const openCreate = () => { setForm(EMPTY_FORM); setFormErr(''); setModal({ open: true, mode: 'create', vehicle: null }); };
  const openEdit   = (v) => {
    setForm({ type: v.type, model: v.model, rentalPrice: String(v.rentalPrice) });
    setFormErr('');
    setModal({ open: true, mode: 'edit', vehicle: v });
  };
  const closeModal = () => setModal({ open: false, mode: 'create', vehicle: null });

  const handleSave = async (e) => {
    e.preventDefault(); setFormErr('');
    if (!form.type.trim())  { setFormErr('Vehicle type is required.'); return; }
    if (!form.model.trim()) { setFormErr('Vehicle model is required.'); return; }
    const price = parseFloat(form.rentalPrice);
    if (isNaN(price) || price <= 0) { setFormErr('Rental price must be greater than 0.'); return; }

    setSaving(true);
    try {
      const payload = { type: form.type.trim(), model: form.model.trim(), rentalPrice: price };
      if (modal.mode === 'create') {
        await createVehicle(payload);    // POST /ms2/vehicles
      } else {
        await updateVehicle(modal.vehicle.vehicleId, payload); // PUT /ms2/vehicles/{id}
      }
      closeModal();
      await load();
    } catch (err) { setFormErr(extractError(err)); }
    finally { setSaving(false); }
  };

  /* ── Status update ── */
  const handleStatusChange = async (vehicle, newStatus) => {
    setActErr('');
    try {
      // PUT /ms2/vehicles/{id}/status?status=AVAILABLE|RESERVED|RENTED
      await updateVehicleStatus(vehicle.vehicleId, newStatus);
      await load();
    } catch (err) { setActErr(extractError(err)); }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    const v = delConfirm.vehicle;
    setDelConfirm({ open: false, vehicle: null }); setActErr('');
    try {
      await deleteVehicle(v.vehicleId); // DELETE /ms2/vehicles/{id}
      await load();
    } catch (err) { setActErr(extractError(err)); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Vehicles</h1>
          <p className="page-subtitle">Add, edit, delete fleet vehicles and update availability.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <Plus size={15} /> Add Vehicle
          </button>
        </div>
      </div>

      <div className="search-box" style={{ maxWidth: '28rem', marginBottom: '1.25rem' }}>
        <Search size={16} className="search-icon" />
        <input type="text" className="search-input" placeholder="Search by type or model…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {actErr  && <ErrorMessage message={actErr} />}
      {loading && <Loading message="Loading vehicles…" />}
      {!loading && error && <ErrorMessage message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>Type</th><th>Model</th>
                <th>Rental Price</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={6} className="table-empty">No vehicles found.</td></tr>
                : filtered.map((v) => (
                  <tr key={v.vehicleId}>
                    <td className="td-id">{v.vehicleId}</td>
                    <td>{v.type}</td>
                    <td className="td-title">{v.model}</td>
                    <td>${Number(v.rentalPrice).toFixed(2)}</td>
                    <td>
                      <select
                        className="form-input"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                        value={v.availabilityStatus}
                        onChange={(e) => handleStatusChange(v, e.target.value)}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="td-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(v)}>Edit</button>
                      <button className="btn btn-danger btn-sm"
                        onClick={() => setDelConfirm({ open: true, vehicle: v })}>Delete</button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit modal */}
      {modal.open && (
        <div className="modal-overlay">
          <div className="modal-box modal-lg">
            <h3 className="modal-title">
              {modal.mode === 'create' ? 'Add New Vehicle' : `Edit Vehicle #${modal.vehicle?.vehicleId}`}
            </h3>
            {formErr && <div className="form-error-banner">{formErr}</div>}
            <form onSubmit={handleSave} noValidate>
              <div className="form-group">
                <label className="form-label">Type *</label>
                <input name="type" type="text" className="form-input"
                  placeholder="e.g. CAR, TRUCK, VAN"
                  value={form.type}
                  onChange={(e) => { setFormErr(''); setForm(p => ({ ...p, type: e.target.value })); }}
                  disabled={saving} />
              </div>
              <div className="form-group">
                <label className="form-label">Model *</label>
                <input name="model" type="text" className="form-input"
                  placeholder="e.g. Toyota Camry"
                  value={form.model}
                  onChange={(e) => { setFormErr(''); setForm(p => ({ ...p, model: e.target.value })); }}
                  disabled={saving} />
              </div>
              <div className="form-group">
                <label className="form-label">Rental Price (per day) *</label>
                <input name="rentalPrice" type="number" step="0.01" min="0.01"
                  className="form-input" placeholder="e.g. 49.99"
                  value={form.rentalPrice}
                  onChange={(e) => { setFormErr(''); setForm(p => ({ ...p, rentalPrice: e.target.value })); }}
                  disabled={saving} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={closeModal} disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving
                    ? <span className="btn-loading"><span className="spinner-sm" />Saving…</span>
                    : modal.mode === 'create' ? 'Create Vehicle' : 'Update Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={delConfirm.open}
        title="Delete Vehicle"
        message={`Delete "${delConfirm.vehicle?.model}"? This cannot be undone.`}
        danger onConfirm={handleDelete}
        onCancel={() => setDelConfirm({ open: false, vehicle: null })} />
    </div>
  );
}
