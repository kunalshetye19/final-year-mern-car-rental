import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaCar,
  FaGasPump,
  FaArrowRight,
  FaTachometerAlt,
  FaUserFriends,
  FaShieldAlt,
} from "react-icons/fa";
import axios from "axios";
import { carPageStyles } from "../assets/dummyStyles";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const daysBetween = (from, to) =>
  Math.ceil((startOfDay(to) - startOfDay(from)) / MS_PER_DAY);

const Cars = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [vendors, setVendors] = useState([]);
  const [vendorFilter, setVendorFilter] = useState("");

  const abortControllerRef = useRef(null);
  const base = "http://localhost:5000";
  const limit = 12;
  const fallbackImage = `${base}/uploads/default-car.svg`;

  useEffect(() => {
    const vendorParam = searchParams.get("vendor");
    if (vendorParam) {
      setVendorFilter(vendorParam);
      fetchCars(vendorParam);
    } else {
      fetchCars();
    }
    fetchVendors();
    return () => {
      if (abortControllerRef.current) {
        try {
          abortControllerRef.current.abort();
        } catch (e) {}
      }
    };
  }, [searchParams]);

  const fetchCars = async (vendorArg) => {
    setLoading(true);
    setError("");
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (e) {}
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const params = { limit };
      const vendorToUse = vendorArg !== undefined ? vendorArg : vendorFilter;
      if (vendorToUse) params.vendor = vendorToUse;

      const res = await axios.get(`${base}/api/cars`, {
        params,
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });

      const data = res.data;
      console.log("API RESPONSE:", data);
      setCars(Array.isArray(data.cars) ? data.cars : []);
    } catch (err) {
      const isCanceled =
        err?.code === "ERR_CANCELED" ||
        (axios.isCancel && axios.isCancel(err)) ||
        err?.name === "CanceledError";
      if (isCanceled) return;

      console.error("Failed to fetch cars:", err);
      setError(
        err?.response?.data?.message || err.message || "Failed to load cars"
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fixed: handle all API response shapes { data: [] }, { vendors: [] }, or plain []
  const fetchVendors = async () => {
    try {
      const res = await axios.get(`${base}/api/vendors`);
      const vendorList =
        res.data?.data ||
        res.data?.vendors ||
        (Array.isArray(res.data) ? res.data : []);
      setVendors(vendorList);
    } catch (err) {
      console.error("Failed to fetch vendors:", err);
    }
  };

  const handleVendorChange = (e) => {
    const v = e.target.value;
    setVendorFilter(v);
    fetchCars(v);
  };

  const buildImageSrc = (image) => {
    if (!image) return "";
    if (Array.isArray(image)) image = image[0];
    if (typeof image !== "string") return "";

    const trimmed = image.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    if (trimmed.startsWith("/")) {
      return `${base}${trimmed}`;
    }
    return `${base}/uploads/${trimmed}`;
  };

  const handleImageError = (e) => {
    const img = e?.target;
    if (!img) return;
    img.onerror = null;
    img.src = fallbackImage;
    img.alt = img.alt || "Image not available";
    img.style.objectFit = img.style.objectFit || "cover";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const opts =
        d.getFullYear() === now.getFullYear()
          ? { day: "numeric", month: "short" }
          : { day: "numeric", month: "short", year: "numeric" };
      return new Intl.DateTimeFormat("en-IN", opts).format(d);
    } catch {
      return dateStr;
    }
  };

  const plural = (n, singular, pluralForm) => {
    if (n === 1) return `1 ${singular}`;
    return `${n} ${pluralForm ?? singular + "s"}`;
  };

  const computeEffectiveAvailability = (car) => {
    const today = new Date();

    if (Array.isArray(car.bookings) && car.bookings.length) {
      const overlapping = car.bookings
        .map((b) => {
          const pickup = b.pickupDate ?? b.startDate ?? b.start ?? b.from;
          const ret = b.returnDate ?? b.endDate ?? b.end ?? b.to;
          if (!pickup || !ret) return null;
          return { pickup: new Date(pickup), return: new Date(ret), raw: b };
        })
        .filter(Boolean)
        .filter(
          (b) =>
            startOfDay(b.pickup) <= startOfDay(today) &&
            startOfDay(today) <= startOfDay(b.return)
        );

      if (overlapping.length > 0) {
        overlapping.sort((a, b) => b.return - a.return);
        return {
          state: "booked",
          until: overlapping[0].return.toISOString(),
          source: "bookings",
        };
      }
    }

    if (car.availability) {
      if (car.availability.state === "booked" && car.availability.until) {
        return {
          state: "booked",
          until: car.availability.until,
          source: "availability",
        };
      }

      if (
        car.availability.state === "available_until_reservation" &&
        Number(car.availability.daysAvailable ?? -1) === 0
      ) {
        return {
          state: "booked",
          until: car.availability.until ?? null,
          source: "availability-res-starts-today",
          nextBookingStarts: car.availability.nextBookingStarts,
        };
      }

      return { ...car.availability, source: "availability" };
    }

    return { state: "fully_available", source: "none" };
  };

  const computeAvailableMeta = (untilIso) => {
    if (!untilIso) return null;
    try {
      const until = new Date(untilIso);
      const available = new Date(until);
      available.setDate(available.getDate() + 1);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysUntilAvailable = daysBetween(today, available);
      return { availableIso: available.toISOString(), daysUntilAvailable };
    } catch {
      return null;
    }
  };

  const renderAvailabilityBadge = (rawAvailability, car) => {
    if (car?.status && car.status !== "available") {
      const statusLabel =
        car.status === "rented"
          ? "Rented"
          : car.status === "maintenance"
          ? "Maintenance"
          : "Unavailable";
      const badgeColor =
        car.status === "maintenance"
          ? "bg-yellow-50 text-yellow-700"
          : "bg-red-50 text-red-700";

      return (
        <span className={`px-2 py-1 text-xs rounded-md font-semibold ${badgeColor}`}>
          {statusLabel}
        </span>
      );
    }

    const effective = computeEffectiveAvailability(car);

    if (!effective) {
      return (
        <span className="px-2 py-1 text-xs rounded-md bg-green-50 text-green-700">
          Available
        </span>
      );
    }

    if (effective.state === "booked") {
      if (effective.until) {
        const meta = computeAvailableMeta(effective.until);
        if (meta && meta.availableIso) {
          return (
            <div className="flex flex-col items-end">
              <span className="px-2 py-1 text-xs rounded-md bg-red-50 text-red-700 font-semibold">
                Booked — available on {formatDate(meta.availableIso)}
              </span>
              <small className="text-xs text-gray-400 mt-1">
                until {formatDate(effective.until)}
              </small>
            </div>
          );
        }
        return (
          <div className="flex flex-col items-end">
            <span className="px-2 py-1 text-xs rounded-md bg-red-50 text-red-700 font-semibold">
              Booked
            </span>
            <small className="text-xs text-gray-400 mt-1">
              until {formatDate(effective.until)}
            </small>
          </div>
        );
      }
      return (
        <div className="flex flex-col items-end">
          <span className="px-2 py-1 text-xs rounded-md bg-red-50 text-red-700 font-semibold">
            Booked
          </span>
        </div>
      );
    }

    if (effective.state === "available_until_reservation") {
      const days = Number(effective.daysAvailable ?? -1);
      if (!Number.isFinite(days) || days < 0) {
        return (
          <div className="flex flex-col items-end">
            <span className="px-2 py-1 text-xs rounded-md bg-amber-50 text-amber-800 font-semibold">
              Available
            </span>
            {effective.nextBookingStarts && (
              <small className="text-xs text-gray-400 mt-1">
                from {formatDate(effective.nextBookingStarts)}
              </small>
            )}
          </div>
        );
      }
      if (days === 0) {
        return (
          <div className="flex flex-col items-end">
            <span className="px-2 py-1 text-xs rounded-md bg-red-50 text-red-700 font-semibold">
              Booked — starts today
            </span>
            {effective.nextBookingStarts && (
              <small className="text-xs text-gray-400 mt-1">
                from {formatDate(effective.nextBookingStarts)}
              </small>
            )}
          </div>
        );
      }
      return (
        <div className="flex flex-col items-end">
          <span className="px-2 py-1 text-xs rounded-md bg-amber-50 text-amber-800 font-semibold">
            Available — reserved in {plural(days, "day")}
          </span>
          {effective.nextBookingStarts && (
            <small className="text-xs text-gray-400 mt-1">
              from {formatDate(effective.nextBookingStarts)}
            </small>
          )}
        </div>
      );
    }

    return (
      <span className="px-2 py-1 text-xs rounded-md bg-green-50 text-green-700">
        Available
      </span>
    );
  };

  const isBookDisabled = (car) => {
    const effective = computeEffectiveAvailability(car);
    if (car?.status && car.status !== "available") return true;
    if (!effective) return false;
    return effective.state === "booked";
  };

  const handleBook = (car, id) => {
    const disabled = isBookDisabled(car);
    if (disabled) return;
    navigate(`/cars/${id}`, { state: { car } });
  };

  return (
    <div className={carPageStyles.pageContainer}>
      <div className={carPageStyles.contentContainer}>
        <div className={carPageStyles.headerContainer}>
          <div className={carPageStyles.headerDecoration}></div>
          <h1 className={carPageStyles.title}>Premium Car Collection</h1>
          <p className={carPageStyles.subtitle}>
            Discover our exclusive fleet of luxury vehicles. Each car is
            meticulously maintained and ready for your journey.
          </p>

          {/* Vendor Filter Section */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-gray-300">Filter by Vendor:</label>
            <div className="flex items-center gap-2">
              <select
                value={vendorFilter}
                onChange={handleVendorChange}
                className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm font-medium text-white hover:border-orange-500 transition-colors focus:outline-none focus:border-orange-500"
              >
                <option value="">All Vendors</option>
                {vendors.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name}
                  </option>
                ))}
              </select>
              {vendorFilter && (
                <button
                  onClick={() => {
                    setVendorFilter("");
                    fetchCars("");
                  }}
                  className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors"
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>

          {/* Active Filter Indicator */}
          {vendorFilter && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-sm text-orange-300">
                Showing cars from{" "}
                <span className="font-semibold">
                  {vendors.find((v) => v._id === vendorFilter)?.name}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Grid */}
        <div className={carPageStyles.gridContainer}>
          {loading &&
            Array.from({ length: limit }).map((_, i) => (
              <div key={`skeleton-${i}`} className={carPageStyles.carCard}>
                <div className={carPageStyles.glowEffect}></div>
                <div className={carPageStyles.imageContainer}>
                  <div className="w-full h-full bg-gray-200 animate-pulse" />
                </div>
                <div className={carPageStyles.cardContent}>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4 animate-pulse" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-6 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-10 bg-gray-200 rounded mt-4 animate-pulse" />
                </div>
              </div>
            ))}

          {!loading && error && (
            <div className="col-span-full text-center text-red-600">{error}</div>
          )}

          {!loading && !error && cars.length === 0 && (
            <div className="col-span-full text-center">No cars available.</div>
          )}

          {!loading &&
            cars.map((car, idx) => {
              const id = car._id ?? car.id ?? idx;
              const carName =
                `${car.make || car.name || ""} ${car.model || ""}`.trim() ||
                car.name ||
                "Unnamed";
              const imageSrc = buildImageSrc(car.image) || fallbackImage;
              const disabled = isBookDisabled(car);

              return (
                <div key={id} className={carPageStyles.carCard}>
                  <div className={carPageStyles.glowEffect}></div>

                  <div className={carPageStyles.imageContainer}>
                    <div className="absolute inset-0 z-10" />
                    <img
                      src={imageSrc}
                      alt={carName}
                      onError={handleImageError}
                      className={carPageStyles.carImage}
                    />

                    <div className="absolute right-4 top-4 z-20">
                      {renderAvailabilityBadge(car.availability, car)}
                    </div>

                    <div className={carPageStyles.priceBadge}>
                      ₹{car.dailyRate ?? car.price ?? car.pricePerDay ?? "—"}
                      /day
                    </div>
                  </div>

                  <div className={carPageStyles.cardContent}>
                    <div className={carPageStyles.headerRow}>
                      <div>
                        <h3 className={carPageStyles.carName}>{carName}</h3>
                        <p className={carPageStyles.carType}>
                          {car.category ?? car.type ?? "Sedan"}
                        </p>
                      </div>
                    </div>

                    <div className={carPageStyles.specsGrid}>
                      <div className={carPageStyles.specItem}>
                        <div className={carPageStyles.specIconContainer}>
                          <FaUserFriends className="text-sky-400" />
                        </div>
                        <span>{car.seats ?? "4"} Seats</span>
                      </div>

                      <div className={carPageStyles.specItem}>
                        <div className={carPageStyles.specIconContainer}>
                          <FaGasPump className="text-amber-400" />
                        </div>
                        <span>{car.fuelType ?? car.fuel ?? "Gasoline"}</span>
                      </div>

                      <div className={carPageStyles.specItem}>
                        <div className={carPageStyles.specIconContainer}>
                          <FaTachometerAlt className="text-emerald-400" />
                        </div>
                        <span>{car.mileage ? `${car.mileage} kmpl` : "—"}</span>
                      </div>

                      <div className={carPageStyles.specItem}>
                        <div className={carPageStyles.specIconContainer}>
                          <FaShieldAlt className="text-purple-400" />
                        </div>
                        <span>Premium</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBook(car, id)}
                      disabled={disabled}
                      className={`w-full mt-4 py-3 rounded-xl font-semibold 
                      flex items-center justify-center gap-2
                      bg-orange-500 text-white
                      hover:bg-orange-600 transition-all duration-300
                      ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      {disabled ? "Unavailable" : "Book Now"}
                      <FaArrowRight />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

        <div className={carPageStyles.decor1}></div>
        <div className={carPageStyles.decor2}></div>
      </div>
    </div>
  );
};

export default Cars;