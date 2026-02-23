import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaPhone, FaEnvelope, FaMapPin, FaCheckCircle, FaCar, FaStar, FaWhatsapp } from "react-icons/fa";

const api = axios.create({ baseURL: "http://localhost:5000" });

// Helper function to format phone number for WhatsApp
const formatWhatsAppNumber = (phone) => {
  if (!phone) return "";
  // Remove all non-numeric characters except +
  let cleaned = phone.replace(/[^\d+]/g, "");
  // Remove + if present and add it back
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
};

// Helper function to create WhatsApp URL
const createWhatsAppUrl = (phone, message = "") => {
  const formattedPhone = formatWhatsAppNumber(phone);
  if (!formattedPhone) return null;
  const baseUrl = `https://wa.me/${formattedPhone}`;
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
};

const VendorCard = ({ vendor, onViewCars }) => {
  const whatsappUrl = createWhatsAppUrl(vendor.phone, "Hi, I'm interested in renting a car from your service!");
  
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-gray-700 hover:border-orange-500 overflow-hidden shadow-lg hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300 group">
      {/* Card Header with gradient */}
      <div className="h-24 bg-gradient-to-r from-orange-500 to-amber-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-40 h-40 bg-white rounded-full -top-20 -right-20"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative px-6 pb-6">
        {/* Profile section */}
        <div className="flex items-start justify-between -mt-10 mb-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">
              {vendor.name}
            </h3>
            {vendor.verified && (
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 rounded-full text-green-400 text-xs font-semibold">
                <FaCheckCircle className="w-3 h-3" /> Verified Partner
              </div>
            )}
          </div>
          <div className="text-4xl text-orange-400 opacity-20">
            <FaCar />
          </div>
        </div>

        {/* Rating placeholder */}
        <div className="flex items-center gap-2 mb-4">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} className="w-4 h-4 text-amber-400" />
          ))}
          <span className="text-xs text-gray-400">(5.0)</span>
        </div>

        {/* Contact Info */}
        <div className="space-y-3 mb-6 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <FaEnvelope className="w-4 h-4 text-orange-400 flex-shrink-0" />
            <a href={`mailto:${vendor.email}`} className="text-sm text-gray-300 hover:text-orange-400 transition-colors break-all">
              {vendor.email}
            </a>
          </div>
          {vendor.phone && (
            <div className="flex items-center gap-3">
              <FaPhone className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <a href={`tel:${vendor.phone}`} className="text-sm text-gray-300 hover:text-orange-400 transition-colors">
                {vendor.phone}
              </a>
            </div>
          )}
          {vendor.address && (
            <div className="flex items-start gap-3">
              <FaMapPin className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-300">{vendor.address}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-700">
          <button
            onClick={() => onViewCars(vendor._id)}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
          >
            <FaCar className="w-4 h-4" />
            View Cars
          </button>
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <FaWhatsapp className="w-4 h-4" />
              Contact
            </a>
          ) : (
            <a
              href={`mailto:${vendor.email}`}
              className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <FaEnvelope className="w-4 h-4" />
              Contact
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get("/api/vendors")
      .then((res) => {
        if (!mounted) return;
        const vendorList = res.data?.data || res.data || [];
        setVendors(Array.isArray(vendorList) ? vendorList : []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.response?.data?.message || "Failed to load vendors");
      })
      .finally(() => mounted && setLoading(false));

    return () => (mounted = false);
  }, []);

  const openVendorCars = (id) => {
    navigate(`/cars?vendor=${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-gray-900 via-gray-950 to-gray-950 pt-20 pb-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full opacity-5 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500 rounded-full opacity-5 blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-orange-500/10 rounded-full border border-orange-500/20">
            <span className="text-orange-400 text-sm font-semibold">Our Partners</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
            Meet Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-400">Trusted Vendors</span>
          </h1>
          
          <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8">
            Connect with our network of professional car rental vendors offering premium vehicles and exceptional service across multiple locations.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
              <p className="text-2xl sm:text-3xl font-bold text-orange-400">{vendors.length}</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">Active Vendors</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
              <p className="text-2xl sm:text-3xl font-bold text-orange-400">500+</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">Vehicles</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
              <p className="text-2xl sm:text-3xl font-bold text-orange-400">24/7</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin mb-4">
              <FaCar className="w-12 h-12 text-orange-500" />
            </div>
            <p className="text-gray-400">Loading vendors...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-center">
            {error}
          </div>
        )}

        {!loading && !error && vendors.length === 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-12 text-center">
            <FaCar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Vendors Found</h3>
            <p className="text-gray-400">Check back soon for our vendor partners.</p>
          </div>
        )}

        {!loading && !error && vendors.length > 0 && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">All Vendors</h2>
              <p className="text-gray-400">Discover our network of professional car rental partners</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((vendor) => (
                <VendorCard
                  key={vendor._id}
                  vendor={vendor}
                  onViewCars={openVendorCars}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Vendors;
