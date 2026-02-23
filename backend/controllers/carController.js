import Car from "../models/carModel.js";
import path from "path";
import fs from "fs";

// CREATE CAR
export const createCar = async (req, res) => {
    try {
        const { make, model, dailyRate, category, description, year, color, seats, transmission, fuelType, mileage, status } = req.body;

        if (!make || !model || !dailyRate) {
            return res.status(400).json({ message: "Make, model and dailyRate are required." });
        }

        let imageFilename = req.body.image || "";
        if (req.file) imageFilename = req.file.filename;

        const car = new Car({
            owner: req.body.owner || req.body.vendor || undefined,
            make, model,
            year: year ? Number(year) : undefined,
            color: color || "",
            category: category || "Sedan",
            seats: seats ? Number(seats) : 4,
            transmission: transmission || "Automatic",
            fuelType: fuelType || "Gasoline",
            mileage: mileage ? Number(mileage) : 0,
            dailyRate: Number(dailyRate),
            status: status || "available",
            image: imageFilename || "",
            description: description || ""
        });

        const savedCar = await car.save();
        res.status(201).json(savedCar);
    } catch (err) {
        try {
            if (req.file?.filename) {
                const filePath = path.join(process.cwd(), 'uploads', req.file.filename);
                fs.unlink(filePath, () => {});
            }
        } catch {}
        return res.status(500).json({ success: false, message: err.message || 'Failed to create car' });
    }
};

// GET ALL CARS
export const getCars = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 12;
        const search = req.query.search || "";
        const category = req.query.category || "";
        const status = req.query.status || "";

        const query = {};
        const vendor = req.query.vendor || req.query.owner;
        if (vendor) query.owner = vendor;
        if (search) {
            query.$or = [
                { make: { $regex: search, $options: "i" } },
                { model: { $regex: search, $options: "i" } },
                { color: { $regex: search, $options: "i" } }
            ];
        }
        if (category) query.category = category;
        if (status) query.status = status;

        const cars = await Car.find(query)
            .populate("owner")
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit);

        const total = await Car.countDocuments(query);

        const carsPlain = cars.map(c => c.toObject());
        const carsWithAvailability = Car.computeAvailabilityForCars(carsPlain);

        // ✅ Collect bulk status updates to sync DB
        const bulkOps = [];

        const enriched = carsWithAvailability.map(car => {
            const dbStatus = car.status || "available";

            // maintenance/rented are manually set — never override them
            if (["maintenance", "rented"].includes(dbStatus)) {
                return { ...car, isAvailable: false };
            }

            // Compute what status SHOULD be based on availability
            const availState = car.availability?.state || "fully_available";
            const isBookedNow = availState === "booked" ||
                (availState === "available_until_reservation" &&
                 Number(car.availability?.daysAvailable ?? -1) === 0);

            const correctStatus = isBookedNow ? "booked" : "available";
            const isAvailable = correctStatus === "available";

            // ✅ If DB status doesn't match computed status, queue a DB update
            if (car._id && dbStatus !== correctStatus) {
                bulkOps.push({
                    updateOne: {
                        filter: { _id: car._id },
                        update: { $set: { status: correctStatus } }
                    }
                });
            }

            return { ...car, status: correctStatus, isAvailable };
        });

        // ✅ Fire-and-forget bulk update to keep DB in sync
        if (bulkOps.length > 0) {
            Car.bulkWrite(bulkOps).catch(err =>
                console.warn("[getCars] Failed to sync car statuses:", err.message)
            );
        }

        res.json({ page, pages: Math.ceil(total / limit), total, cars: enriched });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'Failed to fetch cars' });
    }
};

// GET CAR BY ID
export const getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id).populate('owner');
        if (!car) return res.status(404).json({ message: "Car not found" });

        const plainCar = car.toObject();
        plainCar.availability = car.getAvailabilitySummary();

        if (["maintenance", "rented"].includes(plainCar.status)) {
            plainCar.isAvailable = false;
        } else {
            const availState = plainCar.availability?.state || "fully_available";
            const isBookedNow = availState === "booked" ||
                (availState === "available_until_reservation" &&
                 Number(plainCar.availability?.daysAvailable ?? -1) === 0);
            plainCar.status = isBookedNow ? "booked" : "available";
            plainCar.isAvailable = !isBookedNow;
        }

        res.json(plainCar);
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'Failed to fetch car' });
    }
};

// UPDATE CAR
export const updateCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) return res.status(404).json({ message: "Car not found" });

        if (req.file) {
            if (car.image) {
                const oldPath = path.join(process.cwd(), "uploads", car.image);
                fs.unlink(oldPath, () => {});
            }
            car.image = req.file.filename;
        } else if (req.body.image !== undefined) {
            if (!req.body.image && car.image) {
                const oldPath = path.join(process.cwd(), "backend", "uploads", car.image);
                fs.unlink(oldPath, () => {});
                car.image = "";
            }
        }

        const fields = ["make", "model", "owner", "year", "color", "category", "seats", "transmission", "fuelType", "mileage", "dailyRate", "status", "description"];
        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                car[field] = ["year", "seats", "mileage", "dailyRate"].includes(field)
                    ? Number(req.body[field])
                    : req.body[field];
            }
        });

        const updated = await car.save();
        res.json(updated);
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'Failed to update car' });
    }
};

// DELETE CAR
export const deleteCar = async (req, res) => {
    try {
        const car = await Car.findByIdAndDelete(req.params.id);
        if (!car) return res.status(404).json({ message: "Car not found" });

        if (car.image) {
            const filePath = path.join(process.cwd(), "uploads", car.image);
            fs.unlink(filePath, () => {});
        }

        res.json({ message: "Car deleted successfully" });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'Failed to delete car' });
    }
};