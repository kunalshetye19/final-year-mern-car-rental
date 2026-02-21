import mongoose from "mongoose";
import Car from "./carModel.js";

const { Schema } = mongoose;

/* ---------------- ADDRESS SCHEMA ---------------- */

const addressSchema = new Schema(
  {
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  { _id: false, default: {} }
);

/* ---------------- CAR SUMMARY ---------------- */

const carSummarySchema = new Schema(
  {
    id: { type: Schema.Types.ObjectId, ref: "Car", required: true },
    make: { type: String, default: "" },
    model: { type: String, default: "" },
    year: Number,
    dailyRate: { type: Number, default: 0 },
    category: { type: String, default: "Sedan" },
    seats: { type: Number, default: 4 },
    transmission: { type: String, default: "" },
    fuelType: { type: String, default: "" },
    mileage: { type: Number, default: 0 },
    image: { type: String, default: "" },
  },
  { _id: false }
);

/* ---------------- MAIN BOOKING SCHEMA ---------------- */

const bookingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customer: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },

    car: { type: carSummarySchema, required: true },
    carImage: { type: String, default: "" },

    pickupDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },

    bookingDate: { type: Date, default: Date.now },

    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled", "upcoming"],
      default: "pending",
    },

    amount: { type: Number, default: 0 },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["Credit Card", "Paypal"],
      default: "Credit Card",
    },

    sessionId: String,
    paymentIntentId: String,

    address: { type: addressSchema, default: () => ({}) },

    stripeSession: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

/* =====================================================
   AUTO-FILL CAR DATA BEFORE VALIDATION
===================================================== */

bookingSchema.pre("validate", async function () {
  try {
    if (!this.car || (!this.car.id && !this.car._id)) return;

    // If already has data, skip
    if (this.car.make || this.car.model || this.car.dailyRate) {
      return;
    }

    const carDoc = await Car.findById(this.car.id).lean();
    if (!carDoc) return;

    Object.assign(this.car, {
      make: carDoc.make ?? "",
      model: carDoc.model ?? "",
      year: carDoc.year ?? null,
      dailyRate: carDoc.dailyRate ?? 0,
      seats: carDoc.seats ?? 4,
      transmission: carDoc.transmission ?? "",
      fuelType: carDoc.fuelType ?? "",
      mileage: carDoc.mileage ?? 0,
      image: carDoc.image ?? "",
    });

    if (!this.carImage) {
      this.carImage = carDoc.image || "";
    }
  } catch (err) {
    throw err;
  }
});

/* =====================================================
   SYNC BOOKING WITH CAR DOCUMENT
===================================================== */

const blockingStatuses = ["pending", "active", "upcoming"];

bookingSchema.post("save", async function (doc) {
  try {
    if (!doc.car?.id) return;

    const carId = doc.car.id;

    const bookingEntry = {
      bookingId: doc._id,
      pickupDate: doc.pickupDate,
      returnDate: doc.returnDate,
      status: doc.status,
    };

    // Always remove existing reference first (prevents duplicates)
    await Car.findByIdAndUpdate(carId, {
      $pull: { bookings: { bookingId: doc._id } },
    }).exec();

    // Only push if booking blocks availability
    if (blockingStatuses.includes(doc.status)) {
      await Car.findByIdAndUpdate(carId, {
        $push: { bookings: bookingEntry },
      }).exec();
    }
  } catch (err) {
    console.error("Error in booking post-save hook:", err);
    throw err;
  }
});

/* =====================================================
   REMOVE BOOKING REFERENCE IF DELETED
===================================================== */

bookingSchema.post("remove", async function (doc) {
  try {
    if (!doc.car?.id) return;

    await Car.findByIdAndUpdate(doc.car.id, {
      $pull: { bookings: { bookingId: doc._id } },
    }).exec();
  } catch (err) {
    console.error("Error in booking post-remove hook:", err);
    throw err;
  }
});

export default mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema);
