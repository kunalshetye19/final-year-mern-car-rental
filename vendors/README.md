# KARZONE Vendor Portal

A dedicated portal for vendors/car owners to manage their fleet and accept bookings.

## Features

- **Vendor Authentication**
  - Separate login from user login
  - Vendor registration with detailed information
  - Secure password handling with bcrypt

- **Fleet Management**
  - Add new cars to your fleet
  - View all your cars with status
  - Delete cars
  - Track car status (available, booked, rented, maintenance)

- **Dashboard Analytics**
  - See total cars in your fleet
  - View available cars count
  - Track booked/rented cars

## Getting Started

### Prerequisites
- Node.js
- npm

### Installation

```bash
cd vendors
npm install
```

### Running the Vendor Portal

```bash
npm run dev
```

The vendor portal will start on `http://localhost:5175`

## How to Use

### 1. Vendor Registration
- Click "Register here" on the login page
- Fill in your details:
  - Vendor/Business Name
  - Email Address
  - Password
  - Phone Number (optional)
  - Business Address (optional)
- Submit to create your account

### 2. Vendor Login
- Enter your email and password
- Access your dashboard

### 3. Adding Cars
- Click "Add New Car" button on dashboard
- Fill in car details:
  - Make and Model (required)
  - Year
  - Category (Sedan, SUV, Hatchback, etc.)
  - Seats
  - Transmission (Automatic/Manual)
  - Fuel Type
  - Mileage (KMPL)
  - Daily Rate (required)
- Submit to add car to your fleet

### 4. Managing Your Fleet
- View all your cars on dashboard
- See car status (Available, Booked, Rented, Maintenance)
- Delete cars you no longer want to rent
- Track booking statistics

## Backend API Endpoints

### Authentication
- `POST /api/vendors/login` - Vendor login
- `POST /api/vendors/register` - Vendor registration

### Admin Endpoints
- `POST /api/vendors` - Create vendor (admin)
- `GET /api/vendors` - List all vendors
- `GET /api/vendors/:id` - Get vendor details
- `PUT /api/vendors/:id` - Update vendor (admin)
- `DELETE /api/vendors/:id` - Delete vendor (admin)

### Car Management
- `POST /api/cars` - Add car (auto-associates with logged-in vendor)
- `GET /api/cars?vendor=<vendorId>` - Get vendor's cars
- `PUT /api/cars/:id` - Update car
- `DELETE /api/cars/:id` - Delete car

## Database Schema

### Vendor Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (hashed),
  phone: String,
  address: String,
  verified: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Car Model
```javascript
{
  owner: ObjectId (ref: Vendor),
  make: String,
  model: String,
  year: Number,
  category: String,
  seats: Number,
  transmission: String,
  fuelType: String,
  mileage: Number,
  dailyRate: Number,
  status: String,
  ...otherFields
}
```

## Future Enhancements

- [ ] Edit existing cars
- [ ] View bookings and manage reservations
- [ ] Earnings dashboard
- [ ] Monthly reports
- [ ] Support ticket system
- [ ] Profile management
- [ ] Document verification

## Security

- Passwords are hashed using bcryptjs
- Vendor login is separate from user login
- Each vendor can only manage their own cars
- Authentication tokens can be added for enhanced security

## Troubleshooting

### Login not working
- Ensure backend server is running on port 5000
- Check email and password are correct
- Make sure vendor account is registered

### Cars not showing
- Refresh the page
- Check browser console for errors
- Verify backend API is working

### Add car button not working
- Make sure you're logged in
- Check all required fields are filled
- Check browser console for errors

## Support

For issues or questions, contact the development team.
