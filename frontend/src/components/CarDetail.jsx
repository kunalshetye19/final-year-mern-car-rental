import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  FaUserFriends,
  FaGasPump,
  FaTachometerAlt,
  FaCheckCircle,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaArrowLeft,
  FaCreditCard,
  FaMapMarkerAlt,
  FaCity,
  FaGlobeAsia,
  FaMapPin,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import carsData from "../assets/carsData";

const API_BASE = "http://localhost:5000";
const api = axios.create({
  baseURL: API_BASE,
  headers: { Accept: "application/json" },
});

const todayISO = () => new Date().toISOString().split("T")[0];

const buildImageSrc = (image) => {
  if (!image) return `${API_BASE}/uploads/default-car.svg`;
  if (Array.isArray(image)) image = image[0];
  if (!image || typeof image !== "string")
    return `${API_BASE}/uploads/default-car.svg`;
  const t = image.trim();
  if (!t) return `https://via.placeholder.com/800x500.png?text=No+Image`;
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  if (t.startsWith("/")) return `${API_BASE}${t}`;
  return `${API_BASE}/uploads/${t}`;
};

const handleImageError = (
  e,
  fallback = `${API_BASE}/uploads/default-car.svg`
) => {
  const img = e?.target;
  if (!img) return;
  img.onerror = null;
  img.src = fallback;
  img.onerror = () => {
    img.onerror = null;
    img.src = `${API_BASE}/uploads/default-car.svg`;
  };
  img.alt = img.alt || "Image not available";
  img.style.objectFit = img.style.objectFit || "cover";
};

const calculateDays = (from, to) => {
  if (!from || !to) return 1;
  const days = Math.ceil(
    (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)
  );
  return Math.max(1, days);
};

// Inline styles to avoid any import issues
const carDetailStyles = {
  pageContainer: "relative min-h-screen overflow-hidden py-6 px-4 sm:px-6 lg:px-8 bg-black",
  contentContainer: "relative z-10 max-w-7xl mx-auto",
  backButton: "absolute top-1 cursor-pointer left-4 p-2 bg-gray-800 rounded-full shadow hover:shadow-lg z-20 border border-gray-700 hover:bg-gray-700 transition-all",
  backButtonIcon: "text-orange-400 text-lg",
  mainLayout: "pt-12 flex flex-col lg:flex-row gap-8",
  leftColumn: "lg:w-2/3 space-y-6",
  imageCarousel: "relative rounded-2xl overflow-hidden shadow-lg border border-gray-700",
  carImage: "w-full h-64 sm:h-80 md:h-96 object-cover",
  carouselIndicators: "absolute bottom-4 right-4 flex space-x-2",
  carName: "text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500",
  carPrice: "text-xl sm:text-2xl md:text-3xl font-bold text-green-400",
  pricePerDay: "text-base sm:text-lg font-normal text-gray-400",
  specsGrid: "grid grid-cols-2 sm:grid-cols-4 gap-4",
  specCard: "flex flex-col items-center bg-gray-800/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-gray-700 hover:border-orange-500 transition-all",
  specIcon: "text-xl sm:text-2xl mb-2",
  specLabel: "text-xs sm:text-sm text-gray-400",
  specValue: "font-semibold text-base sm:text-lg text-white",
  aboutSection: "bg-gray-800/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-700 space-y-3",
  aboutTitle: "text-xl sm:text-2xl font-semibold text-white",
  aboutText: "text-gray-300 text-sm sm:text-base",
  rightColumn: "lg:w-1/3",
  bookingCard: "bg-gray-800/70 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-gray-700 shadow-xl space-y-4",
  bookingTitle: "text-2xl sm:text-2xl font-bold text-white",
  bookingSubtitle: "text-gray-400 text-sm",
  form: "space-y-4",
  grid2: "grid grid-cols-2 gap-3",
  formLabel: "text-xs sm:text-sm text-gray-300 mb-1",
  inputIcon: "absolute left-3 top-2.5 text-orange-400",
  inputField: "w-full pl-10 pr-2 py-1.5 sm:py-2 bg-transparent text-gray-200 text-sm sm:text-base outline-none",
  textInputField: "w-full pl-10 pr-3 py-1.5 sm:py-2 bg-transparent text-gray-200 text-sm sm:text-base outline-none",
  priceBreakdown: "bg-gray-700/40 p-3 rounded-lg text-sm space-y-1 border border-gray-600",
  priceRow: "flex justify-between text-gray-300",
  totalRow: "border-t border-gray-600 pt-1 flex justify-between font-semibold text-white",
  submitButton: "w-full flex items-center justify-center py-2.5 rounded-lg bg-gradient-to-r from-orange-400 to-orange-500 cursor-pointer text-white font-bold hover:from-orange-500 hover:to-orange-600 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
};

const CarDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [car, setCar] = useState(() => location.state?.car || null);
  const [loadingCar, setLoadingCar] = useState(false);
  const [carError, setCarError] = useState("");
  const [currentImage, setCurrentImage] = useState(0);
  const [formData, setFormData] = useState({
    pickupDate: "",
    returnDate: "",
    pickupLocation: "",
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [activeField, setActiveField] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fetchControllerRef = useRef(null);
  const submitControllerRef = useRef(null);
  const [today, setToday] = useState(todayISO());

  useEffect(() => setToday(todayISO()), []);

  useEffect(() => {
    // Always fetch fresh data from backend when car ID changes
    const local = carsData.find((c) => String(c.id) === String(id));
    const fallbackCar = local || (location.state?.car ?? null);
    
    // Set initial fallback while fetching
    if (fallbackCar && !car) {
      setCar(fallbackCar);
      setCurrentImage(0);
    }

    const controller = new AbortController();
    fetchControllerRef.current = controller;
    
    (async () => {
      setLoadingCar(true);
      setCarError("");
      try {
        const res = await api.get(`/api/cars/${id}`, {
          signal: controller.signal,
        });
        const payload = res.data?.data ?? res.data ?? null;
        if (payload) {
          setCar(payload);
          setCurrentImage(0);
        } else {
          setCarError("Car not found.");
          if (!car) setCar(fallbackCar);
        }
      } catch (err) {
        const canceled =
          err?.code === "ERR_CANCELED" ||
          err?.name === "CanceledError" ||
          err?.message === "canceled";
        if (!canceled) {
          console.error("Failed to fetch car:", err);
          setCarError(
            err?.response?.data?.message || err.message || "Failed to load car"
          );
          // Use fallback if fetch fails
          if (!car) setCar(fallbackCar);
        }
      } finally {
        setLoadingCar(false);
      }
    })();

    return () => {
      try {
        controller.abort();
      } catch {}
      fetchControllerRef.current = null;
    };
  }, [id]);

  if (!car && loadingCar)
    return <div className="p-6 text-white">Loading car...</div>;
  if (!car && carError)
    return <div className="p-6 text-red-400">{carError}</div>;
  if (!car) return <div className="p-6 text-white">Car not found.</div>;

  const carImages = [
    ...(Array.isArray(car.images) ? car.images : []),
    ...(car.image ? (Array.isArray(car.image) ? car.image : [car.image]) : []),
  ].filter(Boolean);

  const price = Number(car.price ?? car.dailyRate ?? 0) || 0;
  const days = calculateDays(formData.pickupDate, formData.returnDate);
  const calculateTotal = () => days * price;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const getInputContainerClass = (isActive) => {
    return `relative rounded-lg border transition-all ${
      isActive ? 'border-orange-500' : 'border-gray-600'
    }`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.pickupDate || !formData.returnDate) {
      toast.error("Please select pickup and return dates.");
      return;
    }
    
    if (new Date(formData.returnDate) < new Date(formData.pickupDate)) {
      toast.error("Return date must be the same or after pickup date.");
      return;
    }

    setSubmitting(true);
    
    if (submitControllerRef.current) {
      try {
        submitControllerRef.current.abort();
      } catch {}
    }
    
    const controller = new AbortController();
    submitControllerRef.current = controller;

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user?._id || user?.id;
      const token = localStorage.getItem("token");

      console.log("User from localStorage:", user);
console.log("UserId being sent:", userId);

      
      const payload = {
        userId,
        customer: formData.name,
        email: formData.email,
        phone: formData.phone,
        car: {
          id: car._id ?? car.id ?? null,
          name: car.name ?? `${car.make ?? ""} ${car.model ?? ""}`.trim(),
        },
        pickupDate: formData.pickupDate,
        returnDate: formData.returnDate,
        amount: calculateTotal(),
        details: { pickupLocation: formData.pickupLocation },
        address: {
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        carImage: car.image
          ? buildImageSrc(Array.isArray(car.image) ? car.image[0] : car.image)
          : undefined,
      };
      
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      console.log("Sending booking request:", payload);

      const res = await api.post(
        `/api/payments/create-checkout-session`,
        payload,
        {
          headers,
          signal: controller.signal,
        }
      );

      console.log("Booking response:", res.data);

      if (res?.data?.url) {
        toast.success("Redirecting to payment...", {
          position: "top-right",
          autoClose: 1200,
        });
        setTimeout(() => {
          window.location.href = res.data.url;
        }, 1500);
        return;
      }

      toast.success(
        "Booking created. Please complete payment from bookings page.",
        { position: "top-right", autoClose: 2000 }
      );
      
      setFormData({
        pickupDate: "",
        returnDate: "",
        pickupLocation: "",
        name: "",
        email: "",
        phone: "",
        city: "",
        state: "",
        zipCode: "",
      });
      
      setTimeout(() => {
        navigate("/bookings");
      }, 2000);
      
    } catch (err) {
      const canceled =
        err?.code === "ERR_CANCELED" ||
        err?.name === "CanceledError" ||
        err?.message === "canceled";
        
      if (canceled) return;
      
      console.error("Booking error:", err);
      console.error("Error response:", err?.response?.data);
      
      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Booking failed. Please try again.";
        
      toast.error(String(serverMessage), {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const transmissionLabel = car.transmission
    ? String(car.transmission).toLowerCase()
    : "standard";

  return (
    <div className={carDetailStyles.pageContainer}>
      <div className={carDetailStyles.contentContainer}>
        <ToastContainer />
        <button
          onClick={() => navigate(-1)}
          className={carDetailStyles.backButton}
        >
          <FaArrowLeft className={carDetailStyles.backButtonIcon} />
        </button>

        <div className={carDetailStyles.mainLayout}>
          <div className={carDetailStyles.leftColumn}>
            <div className={carDetailStyles.imageCarousel}>
              <img
                src={buildImageSrc(carImages[currentImage] ?? car.image)}
                alt={car.name || "Car"}
                className={carDetailStyles.carImage}
                onError={(e) => handleImageError(e)}
              />
              {(carImages.length > 0 || (car.image && car.image !== "")) && (
                <div className={carDetailStyles.carouselIndicators}>
                  {(carImages.length > 0 ? carImages : [car.image]).map(
                    (_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImage(idx)}
                        aria-label={`Show image ${idx + 1}`}
                        className={`w-3 h-3 rounded-full transition-all ${
                          idx === currentImage ? 'bg-orange-500 scale-125' : 'bg-gray-500 hover:bg-gray-400'
                        }`}
                      />
                    )
                  )}
                </div>
              )}
            </div>

            <h1 className={carDetailStyles.carName}>{car.make}</h1>
            <div className="flex items-center justify-between mb-4">
              <p className={carDetailStyles.carPrice}>
                ${price}{" "}
                <span className={carDetailStyles.pricePerDay}>/ day</span>
              </p>
              <span className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                car?.status === "available"
                  ? "bg-green-500/20 text-green-400 border border-green-500"
                  : "bg-red-500/20 text-red-400 border border-red-500"
              }`}>
                {car?.status === "available" ? "✓ Available" : "✗ Rented"}
              </span>
            </div>

            <div className={carDetailStyles.specsGrid}>
              {[
                {
                  Icon: FaUserFriends,
                  label: "Seats",
                  value: car.seats ?? "—",
                  color: "text-orange-400",
                },
                {
                  Icon: FaGasPump,
                  label: "Fuel",
                  value: car.fuel ?? car.fuelType ?? "—",
                  color: "text-green-400",
                },
                {
                  Icon: FaTachometerAlt,
                  label: "Mileage",
                  value: car.mileage ? `${car.mileage} kmpl` : "—",
                  color: "text-yellow-400",
                },
                {
                  Icon: FaCheckCircle,
                  label: "Transmission",
                  value: transmissionLabel,
                  color: "text-purple-400",
                },
              ].map((spec, i) => (
                <div key={i} className={carDetailStyles.specCard}>
                  <spec.Icon
                    className={`${spec.color} ${carDetailStyles.specIcon}`}
                  />
                  <p className={carDetailStyles.specLabel}>
                    {spec.label}
                  </p>
                  <p className={carDetailStyles.specValue}>{spec.value}</p>
                </div>
              ))}
            </div>

            <div className={carDetailStyles.aboutSection}>
              <h2 className={carDetailStyles.aboutTitle}>About this car</h2>
              <p className={carDetailStyles.aboutText}>
                Experience luxury in the {car.name}. With its{" "}
                {transmissionLabel} transmission and seating for{" "}
                {car.seats ?? "—"}, every journey is exceptional.
              </p>
              <p className={carDetailStyles.aboutText}>
                {car.description ??
                  "This car combines performance and comfort for an unforgettable drive."}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-400 mr-2 text-sm" />
                  <span className="text-gray-300 text-sm">
                    Free cancellation
                  </span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-400 mr-2 text-sm" />
                  <span className="text-gray-300 text-sm">
                    24/7 Roadside assistance
                  </span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-400 mr-2 text-sm" />
                  <span className="text-gray-300 text-sm">
                    Unlimited mileage
                  </span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-400 mr-2 text-sm" />
                  <span className="text-gray-300 text-sm">
                    Collision damage waiver
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={carDetailStyles.rightColumn}>
            {car.owner && typeof car.owner === 'object' && (
              <div className="mb-4 p-4 rounded-xl bg-gray-800/60 border border-gray-700">
                <h3 className="text-lg font-semibold text-white">Owner</h3>
                <div className="text-gray-300">{car.owner.name}</div>
                {car.owner.email && (
                  <div className="text-sm text-gray-400">{car.owner.email}</div>
                )}
                {car.owner.phone && (
                  <div className="text-sm text-gray-400">Phone: <a className="text-orange-400" href={`tel:${car.owner.phone}`}>{car.owner.phone}</a></div>
                )}
                {car.owner.verified && (
                  <div className="text-sm text-green-400 mt-1">Verified Vendor</div>
                )}
              </div>
            )}

            <div className={carDetailStyles.bookingCard}>
              <h2 className={carDetailStyles.bookingTitle}>
                Reserve{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">
                  Your Drive
                </span>
              </h2>
              <p className={carDetailStyles.bookingSubtitle}>
                Fast · Secure · Easy
              </p>

              <form onSubmit={handleSubmit} className={carDetailStyles.form}>
                <div className={carDetailStyles.grid2}>
                  <div className="flex flex-col">
                    <label
                      htmlFor="pickupDate"
                      className={carDetailStyles.formLabel}
                    >
                      Pickup Date
                    </label>
                    <div className={getInputContainerClass(activeField === "pickupDate")}>
                      <div className={carDetailStyles.inputIcon}>
                        <FaCalendarAlt />
                      </div>
                      <input
                        id="pickupDate"
                        type="date"
                        name="pickupDate"
                        min={today}
                        value={formData.pickupDate}
                        onChange={handleInputChange}
                        onFocus={() => setActiveField("pickupDate")}
                        onBlur={() => setActiveField(null)}
                        required
                        className={carDetailStyles.inputField}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label
                      htmlFor="returnDate"
                      className={carDetailStyles.formLabel}
                    >
                      Return Date
                    </label>
                    <div className={getInputContainerClass(activeField === "returnDate")}>
                      <div className={carDetailStyles.inputIcon}>
                        <FaCalendarAlt />
                      </div>
                      <input
                        id="returnDate"
                        type="date"
                        name="returnDate"
                        min={formData.pickupDate || today}
                        value={formData.returnDate}
                        onChange={handleInputChange}
                        onFocus={() => setActiveField("returnDate")}
                        onBlur={() => setActiveField(null)}
                        required
                        className={carDetailStyles.inputField}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className={carDetailStyles.formLabel}>
                    Pickup Location
                  </label>
                  <div className={getInputContainerClass(activeField === "pickupLocation")}>
                    <div className={carDetailStyles.inputIcon}>
                      <FaMapMarkerAlt />
                    </div>
                    <input
                      type="text"
                      name="pickupLocation"
                      placeholder="Enter pickup location"
                      value={formData.pickupLocation}
                      onChange={handleInputChange}
                      onFocus={() => setActiveField("pickupLocation")}
                      onBlur={() => setActiveField(null)}
                      required
                      className={carDetailStyles.textInputField}
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className={carDetailStyles.formLabel}>Full Name</label>
                  <div className={getInputContainerClass(activeField === "name")}>
                    <div className={carDetailStyles.inputIcon}>
                      <FaUser />
                    </div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      onFocus={() => setActiveField("name")}
                      onBlur={() => setActiveField(null)}
                      required
                      className={carDetailStyles.textInputField}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className={carDetailStyles.formLabel}>
                      Email Address
                    </label>
                    <div className={getInputContainerClass(activeField === "email")}>
                      <div className={carDetailStyles.inputIcon}>
                        <FaEnvelope />
                      </div>
                      <input
                        type="email"
                        name="email"
                        placeholder="Your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        onFocus={() => setActiveField("email")}
                        onBlur={() => setActiveField(null)}
                        required
                        className={carDetailStyles.textInputField}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className={carDetailStyles.formLabel}>
                      Phone Number
                    </label>
                    <div className={getInputContainerClass(activeField === "phone")}>
                      <div className={carDetailStyles.inputIcon}>
                        <FaPhone />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Your phone number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        onFocus={() => setActiveField("phone")}
                        onBlur={() => setActiveField(null)}
                        required
                        className={carDetailStyles.textInputField}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <label className={carDetailStyles.formLabel}>City</label>
                    <div className={getInputContainerClass(activeField === "city")}>
                      <div className={carDetailStyles.inputIcon}>
                        <FaCity />
                      </div>
                      <input
                        type="text"
                        name="city"
                        placeholder="Your city"
                        value={formData.city}
                        onChange={handleInputChange}
                        onFocus={() => setActiveField("city")}
                        onBlur={() => setActiveField(null)}
                        required
                        className={carDetailStyles.textInputField}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className={carDetailStyles.formLabel}>State</label>
                    <div className={getInputContainerClass(activeField === "state")}>
                      <div className={carDetailStyles.inputIcon}>
                        <FaGlobeAsia />
                      </div>
                      <input
                        type="text"
                        name="state"
                        placeholder="Your state"
                        value={formData.state}
                        onChange={handleInputChange}
                        onFocus={() => setActiveField("state")}
                        onBlur={() => setActiveField(null)}
                        required
                        className={carDetailStyles.textInputField}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className={carDetailStyles.formLabel}>
                      ZIP Code
                    </label>
                    <div className={getInputContainerClass(activeField === "zipCode")}>
                      <div className={carDetailStyles.inputIcon}>
                        <FaMapPin />
                      </div>
                      <input
                        type="text"
                        name="zipCode"
                        placeholder="ZIP/Postal code"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        onFocus={() => setActiveField("zipCode")}
                        onBlur={() => setActiveField(null)}
                        required
                        className={carDetailStyles.textInputField}
                      />
                    </div>
                  </div>
                </div>

                <div className={carDetailStyles.priceBreakdown}>
                  <div className={carDetailStyles.priceRow}>
                    <span>Rate/day</span>
                    <span>${price}</span>
                  </div>
                  {formData.pickupDate && formData.returnDate && (
                    <div className={carDetailStyles.priceRow}>
                      <span>Days</span>
                      <span>{days}</span>
                    </div>
                  )}
                  <div className={carDetailStyles.totalRow}>
                    <span>Total</span>
                    <span>${calculateTotal()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || car?.status !== "available" || !formData.pickupDate || !formData.returnDate}
                  className={carDetailStyles.submitButton}
                >
                  <FaCreditCard className="mr-2 group-hover:scale-110 transition-transform" />
                  <span>
                    {car?.status !== "available" 
                      ? "Car Not Available" 
                      : submitting ? "Confirming..." : "Confirm Booking"}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;