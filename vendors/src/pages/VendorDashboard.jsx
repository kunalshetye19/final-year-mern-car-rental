import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { FaCar, FaPlus, FaEdit, FaTrash, FaSignOutAlt, FaUser, FaTimes, FaMoneyBillWave, FaCheckCircle, FaClock, FaSpinner } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: { Accept: 'application/json' }
});

// ─── Add Car Modal ────────────────────────────────────────────────────────────
const AddCarModal = ({ vendorId, onClose, onSuccess }) => {
  const initialForm = {
    make: '', model: '', year: new Date().getFullYear(),
    category: 'Sedan', seats: 4, transmission: 'Automatic',
    fuelType: 'Gasoline', mileage: '', dailyRate: '',
    description: '', image: null, imagePreview: null,
  };

  const [data, setData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((p) => ({ ...p, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => setData((p) => ({ ...p, image: file, imagePreview: evt.target.result }));
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setData(initialForm);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.make || !data.model || !data.dailyRate) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const payload = new FormData();
      const fieldMap = {
        make: data.make, model: data.model, year: data.year,
        category: data.category, seats: data.seats, transmission: data.transmission,
        fuelType: data.fuelType, mileage: data.mileage, dailyRate: data.dailyRate,
        description: data.description || '',
      };
      Object.entries(fieldMap).forEach(([k, v]) => payload.append(k, v));
      if (vendorId) payload.append('owner', vendorId);
      if (data.image) payload.append('image', data.image);

      await api.post('/api/cars', payload);
      toast.success('Car added successfully!');
      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add car');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Add New Car</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <FaTimes className="w-6 h-6" />
          </button>
        </div>
        <CarForm data={data} onChange={handleChange} onImageChange={handleImageChange} fileRef={fileRef} />
        <div className="flex gap-3 pt-4 border-t border-gray-700 mt-4">
          <button type="button" onClick={() => { resetForm(); onClose(); }} className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50">
            {submitting ? 'Adding...' : 'Add Car'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Edit Car Modal ───────────────────────────────────────────────────────────
const EditCarModal = ({ car, onClose, onSuccess }) => {
  const [data, setData] = useState({
    make: car.make || '',
    model: car.model || '',
    year: car.year || new Date().getFullYear(),
    category: car.category || 'Sedan',
    seats: car.seats || 4,
    transmission: car.transmission || 'Automatic',
    fuelType: car.fuelType || 'Gasoline',
    mileage: car.mileage || '',
    dailyRate: car.dailyRate || '',
    description: car.description || '',
    status: car.status || 'available',
    image: null,
    imagePreview: car.image || null,
  });
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((p) => ({ ...p, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => setData((p) => ({ ...p, image: file, imagePreview: evt.target.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!data.make || !data.model || !data.dailyRate) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const payload = new FormData();
      const fieldMap = {
        make: data.make, model: data.model, year: data.year,
        category: data.category, seats: data.seats, transmission: data.transmission,
        fuelType: data.fuelType, mileage: data.mileage, dailyRate: data.dailyRate,
        description: data.description || '', status: data.status,
      };
      Object.entries(fieldMap).forEach(([k, v]) => payload.append(k, v));
      if (data.image) payload.append('image', data.image);

      await api.put(`/api/cars/${car._id}`, payload);
      toast.success('Car updated successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update car');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Car</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <CarForm data={data} onChange={handleChange} onImageChange={handleImageChange} fileRef={fileRef} showStatus />

        <div className="flex gap-3 pt-4 border-t border-gray-700 mt-4">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50">
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Shared Form Fields ───────────────────────────────────────────────────────
const CarForm = ({ data, onChange, onImageChange, fileRef, showStatus = false }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Make *</label>
        <input name="make" value={data.make} onChange={onChange} required className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Model *</label>
        <input name="model" value={data.model} onChange={onChange} required className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Year *</label>
        <input type="number" name="year" value={data.year} onChange={onChange} min="1980" required className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
        <select name="category" value={data.category} onChange={onChange} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
          <option>Sedan</option><option>SUV</option><option>Hatchback</option>
          <option>Coupe</option><option>Convertible</option><option>Sports</option><option>Luxury</option>
        </select>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Seats</label>
        <input type="number" name="seats" value={data.seats} onChange={onChange} min="1" max="8" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Transmission</label>
        <select name="transmission" value={data.transmission} onChange={onChange} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
          <option>Automatic</option><option>Manual</option>
        </select>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Fuel Type</label>
        <select name="fuelType" value={data.fuelType} onChange={onChange} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
          <option>Gasoline</option><option>Diesel</option><option>Hybrid</option><option>Electric</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Mileage (kmpl)</label>
        <input type="number" name="mileage" value={data.mileage} onChange={onChange} min="0" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Daily Rate (₹) *</label>
        <input type="number" name="dailyRate" value={data.dailyRate} onChange={onChange} min="1" step="0.01" required className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
      </div>
      {showStatus && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
          <select name="status" value={data.status} onChange={onChange} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
            <option value="available">Available</option>
            <option value="booked">Booked</option>
            <option value="maintenance">Maintenance</option>
            <option value="rented">Rented</option>
          </select>
        </div>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
      <textarea name="description" value={data.description} onChange={onChange} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" rows={3} />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">Image (optional)</label>
      <input ref={fileRef} type="file" accept="image/*" onChange={onImageChange} className="text-sm text-gray-400" />
      {data.imagePreview && (
        <div className="mt-3">
          <img src={data.imagePreview} alt="preview" className="w-full h-48 object-cover rounded-md border border-gray-700" />
        </div>
      )}
    </div>
  </div>
);

// ─── Car Card ─────────────────────────────────────────────────────────────────
const CarCard = ({ car, onEdit, onDelete }) => {
  const getStatusBadge = (status) => {
    const colors = {
      available: 'bg-green-900/30 text-green-400',
      booked: 'bg-red-900/30 text-red-400',
      maintenance: 'bg-yellow-900/30 text-yellow-400',
      rented: 'bg-blue-900/30 text-blue-400'
    };
    return colors[status] || 'bg-gray-700 text-gray-300';
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-orange-500 transition">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">{car.year} {car.make} {car.model}</h3>
            <div className="flex gap-2 mt-2">
              <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">{car.category}</span>
              <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(car.status)}`}>{car.status || 'available'}</span>
            </div>
          </div>
          <FaCar className="w-8 h-8 text-orange-400 opacity-20" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-gray-400 border-t border-gray-800 pt-4">
          <div><span className="block text-xs text-gray-500 mb-1">Seats</span><span className="text-white font-semibold">{car.seats}</span></div>
          <div><span className="block text-xs text-gray-500 mb-1">Transmission</span><span className="text-white font-semibold">{car.transmission}</span></div>
          <div><span className="block text-xs text-gray-500 mb-1">Fuel Type</span><span className="text-white font-semibold">{car.fuelType}</span></div>
          <div><span className="block text-xs text-gray-500 mb-1">Mileage</span><span className="text-white font-semibold">{car.mileage} km/l</span></div>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/20 rounded p-3 mb-4">
          <span className="text-xs text-gray-400">Daily Rate</span>
          <p className="text-2xl font-bold text-orange-400">₹{car.dailyRate.toLocaleString()}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(car)}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-800 hover:bg-orange-500/20 hover:text-orange-400 text-white font-medium rounded transition"
          >
            <FaEdit className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={() => onDelete(car._id)}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 font-medium rounded transition"
          >
            <FaTrash className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Vendor Dashboard ─────────────────────────────────────────────────────────
const VendorDashboard = ({ vendorId, vendorName, onLogout }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [income, setIncome] = useState(null);
  const [incomeLoading, setIncomeLoading] = useState(true);

  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/cars?vendor=${vendorId}&limit=100`);
      const carsData = response.data?.cars || response.data || [];
      setCars(Array.isArray(carsData) ? carsData : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load cars');
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  const fetchIncome = useCallback(async () => {
    try {
      setIncomeLoading(true);
      const response = await api.get(`/api/vendors/${vendorId}/income`);
      if (response.data.success) {
        setIncome(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load income:', err);
    } finally {
      setIncomeLoading(false);
    }
  }, [vendorId]);

  useEffect(() => { 
    fetchCars(); 
    fetchIncome();
  }, [fetchCars, fetchIncome]);

  const handleDelete = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;
    try {
      await api.delete(`/api/cars/${carId}`);
      toast.success('Car deleted successfully!');
      fetchCars();
    } catch (err) {
      toast.error('Failed to delete car');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vendorId');
    localStorage.removeItem('vendorName');
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaCar className="w-8 h-8 text-orange-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">KARZONE</h1>
              <p className="text-xs text-gray-400">Vendor Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2">
              <FaUser className="w-5 h-5 text-orange-400" />
              <span className="text-white font-medium">{vendorName}</span>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold rounded-lg transition">
              <FaSignOutAlt className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-extrabold text-white mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Your Fleet Management</span>
          </h2>
          <p className="text-gray-400">Manage your vehicles and bookings</p>
        </div>

        {/* Income Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 border border-green-700/50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaMoneyBillWave className="w-6 h-6 text-green-400" />
              <p className="text-gray-300 text-sm font-medium">Total Income</p>
            </div>
            {incomeLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-green-800/50 rounded w-24"></div>
              </div>
            ) : (
              <p className="text-3xl font-bold text-green-400">₹{(income?.totalIncome || 0).toLocaleString()}</p>
            )}
          </div>
          <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-700/50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaCheckCircle className="w-6 h-6 text-blue-400" />
              <p className="text-gray-300 text-sm font-medium">Completed</p>
            </div>
            {incomeLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-blue-800/50 rounded w-24"></div>
              </div>
            ) : (
              <p className="text-3xl font-bold text-blue-400">₹{(income?.completedIncome || 0).toLocaleString()}</p>
            )}
          </div>
          <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border border-yellow-700/50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaClock className="w-6 h-6 text-yellow-400" />
              <p className="text-gray-300 text-sm font-medium">Pending</p>
            </div>
            {incomeLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-yellow-800/50 rounded w-24"></div>
              </div>
            ) : (
              <p className="text-3xl font-bold text-yellow-400">₹{(income?.pendingIncome || 0).toLocaleString()}</p>
            )}
          </div>
          <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-700/50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaSpinner className="w-6 h-6 text-purple-400" />
              <p className="text-gray-300 text-sm font-medium">Active</p>
            </div>
            {incomeLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-purple-800/50 rounded w-24"></div>
              </div>
            ) : (
              <p className="text-3xl font-bold text-purple-400">₹{(income?.activeIncome || 0).toLocaleString()}</p>
            )}
          </div>
        </div>

        {/* Fleet Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm">Total Cars</p>
            <p className="text-3xl font-bold text-orange-400 mt-2">{cars.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm">Available</p>
            <p className="text-3xl font-bold text-green-400 mt-2">{cars.filter(c => c.status === 'available').length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm">Booked</p>
            <p className="text-3xl font-bold text-red-400 mt-2">{cars.filter(c => c.status === 'booked' || c.status === 'rented').length}</p>
          </div>
        </div>

        {/* Add Car Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-amber-700 transition mb-8"
        >
          <FaPlus className="w-5 h-5" />
          Add New Car
        </button>

        {/* Cars List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin mb-4">
              <FaCar className="w-12 h-12 text-orange-500" />
            </div>
            <p className="text-gray-400">Loading your cars...</p>
          </div>
        ) : cars.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
            <FaCar className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Cars Yet</h3>
            <p className="text-gray-400 mb-6">Start by adding your first vehicle to your fleet</p>
            <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition">
              <FaPlus className="w-4 h-4" /> Add Car
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map(car => (
              <CarCard
                key={car._id}
                car={car}
                onEdit={(car) => setEditingCar(car)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Car Modal */}
      {showAddModal && (
        <AddCarModal
          vendorId={vendorId}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchCars}
        />
      )}

      {/* Edit Car Modal */}
      {editingCar && (
        <EditCarModal
          car={editingCar}
          onClose={() => setEditingCar(null)}
          onSuccess={fetchCars}
        />
      )}

      <ToastContainer theme="dark" />
    </div>
  );
};

export default VendorDashboard;
