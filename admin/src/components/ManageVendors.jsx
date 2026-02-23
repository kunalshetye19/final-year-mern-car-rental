import React, { useCallback, useState, useEffect } from 'react';
import {
  FaUser, FaEnvelope, FaPhone, FaEdit, FaTrash, FaTimes, FaPlus, FaStore
} from "react-icons/fa";
import { styles } from '../assets/dummyStyles';
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const BASE = "http://localhost:5000";
const api = axios.create({
  baseURL: BASE,
  headers: { Accept: "application/json" },
});

// ─── Vendor Modal (Add / Edit) ────────────────────────────────────────────────

const VendorModal = ({ vendor, onClose, onSubmit }) => {
  const isEdit = Boolean(vendor?._id);
  const [form, setForm] = useState({
    name: vendor?.name || "",
    email: vendor?.email || "",
    phone: vendor?.phone || "",
    address: vendor?.address || "",
    description: vendor?.description || "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return toast.error("Name and Email are required");
    onSubmit(form);
  };

  const field = (label, name, type = "text", placeholder = "") => (
    <div>
      <label className={`block ${styles.textGray} text-sm mb-1`}>{label}</label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={styles.inputField}
        required={["name", "email"].includes(name)}
      />
    </div>
  );

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.gradientGrayToGray} ${styles.rounded2xl} ${styles.modalContainer} ${styles.borderOrange}`}>
        <div className="p-6">
          <div className="flex justify-between items-center border-b border-orange-800/30 pb-4">
            <h2 className="text-2xl font-bold text-white">
              {isEdit ? `Edit: ${vendor.name}` : "Add New Vendor"}
            </h2>
            <button onClick={onClose} className={styles.textGray}>
              <FaTimes className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {field("Vendor Name", "name", "text", "e.g. Speed Rentals")}
              {field("Email", "email", "email", "vendor@email.com")}
              {field("Phone", "phone", "text", "+91 98765 43210")}
              {field("Address", "address", "text", "City, State")}
            </div>
            <div>
              <label className={`block ${styles.textGray} text-sm mb-1`}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief description of the vendor..."
                className={`${styles.inputField} resize-none`}
              />
            </div>
            <div className="flex justify-end space-x-4 pt-2">
              <button type="button" onClick={onClose} className={styles.buttonSecondary}>Cancel</button>
              <button type="submit" className={styles.buttonPrimary}>
                {isEdit ? "Save Changes" : "Add Vendor"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── Vendor Card ──────────────────────────────────────────────────────────────

const VendorCard = ({ vendor, onEdit, onDelete }) => {
  const initials = vendor.name
    ? vendor.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "V";

  return (
    <div className={`${styles.gradientGray} ${styles.rounded2xl} ${styles.borderGray} ${styles.borderHoverOrange} border transition-all duration-200`}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-white truncate">{vendor.name}</h3>
            {vendor.description && (
              <p className="text-xs text-gray-400 truncate">{vendor.description}</p>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-5">
          {vendor.email && (
            <div className="flex items-center gap-2 text-sm">
              <FaEnvelope className={`${styles.textOrange} flex-shrink-0`} />
              <span className="text-gray-300 truncate">{vendor.email}</span>
            </div>
          )}
          {vendor.phone && (
            <div className="flex items-center gap-2 text-sm">
              <FaPhone className={`${styles.textOrange} flex-shrink-0`} />
              <span className="text-gray-300">{vendor.phone}</span>
            </div>
          )}
          {vendor.address && (
            <div className="flex items-center gap-2 text-sm">
              <FaUser className={`${styles.textOrange} flex-shrink-0`} />
              <span className="text-gray-300 truncate">{vendor.address}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between border-t border-gray-800 pt-4">
          <button
            onClick={() => onEdit(vendor)}
            className={`flex items-center gap-1 ${styles.textOrange} hover:text-orange-300 transition-colors text-sm`}
          >
            <FaEdit /> Edit
          </button>
          <button
            onClick={() => onDelete(vendor._id)}
            className={`flex items-center gap-1 ${styles.textRed} hover:text-red-300 transition-colors text-sm`}
          >
            <FaTrash /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ManageVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [search, setSearch] = useState("");

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/vendors");
      const list =
        res.data?.data ||
        res.data?.vendors ||
        (Array.isArray(res.data) ? res.data : []);
      setVendors(list);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  const handleSubmit = async (form) => {
    try {
      if (editingVendor?._id) {
        await api.put(`/api/vendors/${editingVendor._id}`, form);
        toast.success("Vendor updated");
      } else {
        await api.post("/api/vendors", form);
        toast.success("Vendor added");
      }
      setShowModal(false);
      setEditingVendor(null);
      fetchVendors();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save vendor");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vendor? This cannot be undone.")) return;
    try {
      await api.delete(`/api/vendors/${id}`);
      toast.success("Vendor deleted");
      fetchVendors();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete vendor");
    }
  };

  const openAdd = () => { setEditingVendor(null); setShowModal(true); };
  const openEdit = (vendor) => { setEditingVendor(vendor); setShowModal(true); };

  const filtered = vendors.filter(v =>
    !search ||
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6">

      {/* Header */}
      <div className="relative mb-8 pt-16 text-center">
        <div className="absolute inset-x-0 top-0 flex justify-center">
          <div className="h-1 w-20 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
        </div>
        <h1 className="text-4xl font-extrabold py-4 text-white sm:text-5xl mb-3 tracking-wide">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
            Manage Vendors
          </span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Add, edit and remove vendors from your platform
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-gray-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Stats */}
          <div className={`${styles.gradientOrange} ${styles.rounded2xl} ${styles.borderGray} border px-6 py-4 flex items-center gap-4`}>
            <div className="p-3 rounded-lg bg-gray-800/30">
              <FaStore className={`${styles.textOrange} text-xl`} />
            </div>
            <div>
              <p className={`${styles.textGray} text-sm font-medium`}>Total Vendors</p>
              <p className="text-2xl font-bold text-white">{vendors.length}</p>
            </div>
          </div>

          {/* Search + Add */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search vendors..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`${styles.inputField} flex-1 sm:w-64`}
            />
            <button
              onClick={openAdd}
              className={`${styles.buttonPrimary} flex items-center gap-2 whitespace-nowrap`}
            >
              <FaPlus /> Add Vendor
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`${styles.gradientGray} ${styles.rounded2xl} border ${styles.borderGray} p-5 animate-pulse`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-700 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-700 rounded" />
                <div className="h-3 bg-gray-700 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={`${styles.gradientGray} ${styles.rounded2xl} border ${styles.borderGray} text-center py-16`}>
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-orange-900/30 to-amber-900/30 flex items-center justify-center mb-4">
            <FaStore className="text-orange-400 text-3xl" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">
            {search ? "No vendors found" : "No vendors yet"}
          </h3>
          <p className="text-gray-400 mb-6">
            {search ? "Try a different search term" : "Add your first vendor to get started"}
          </p>
          {!search && (
            <button onClick={openAdd} className={`${styles.buttonPrimary} inline-flex items-center gap-2`}>
              <FaPlus /> Add Vendor
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(vendor => (
            <VendorCard
              key={vendor._id}
              vendor={vendor}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <VendorModal
          vendor={editingVendor}
          onClose={() => { setShowModal(false); setEditingVendor(null); }}
          onSubmit={handleSubmit}
        />
      )}

      <ToastContainer theme="dark" />
    </div>
  );
};

export default ManageVendors;