# Vendor Portal Setup - Complete Implementation

## Overview
A complete vendor portal has been set up at `/vendors` folder with separate login/authentication system independent from users.

## Vendor Portal Features

### 1. **Separate Authentication**
   - Vendor Registration with secure password (bcrypted)
   - Vendor Login (different from user login)
   - Session management via localStorage
   - Auto-logout on session expiry

### 2. **Fleet Management Dashboard**
   - View all your cars
   - Add new cars to your fleet
   - Delete cars
   - Real-time status tracking

### 3. **Car Management**
   - Add cars with detailed information:
     - Make, Model, Year
     - Category, Seats, Transmission
     - Fuel Type, Mileage, Daily Rate
   - View car status (Available, Booked, Rented, Maintenance)
   - Delete cars from fleet

### 4. **Dashboard Analytics**
   - Total cars count
   - Available cars count
   - Booked/Rented cars count

## Folder Structure

```
vendors/
├── src/
│   ├── pages/
│   │   ├── VendorLogin.jsx      # Login & Registration page
│   │   └── VendorDashboard.jsx  # Fleet management dashboard
│   ├── App.jsx                   # Main routing
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Tailwind styles
├── index.html                    # HTML template
├── package.json                  # Dependencies
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind configuration
├── postcss.config.js            # PostCSS configuration
├── eslint.config.js             # ESLint configuration
├── README.md                     # Documentation
├── .gitignore                    # Git ignore file
└── public/                       # Static assets
```

## Backend Changes

### 1. **Vendor Model Updated**
   - Added `password` field with bcrypt hashing
   - Added `comparePassword()` method for authentication
   - Automatic password hashing on save

### 2. **Vendor Controller Updated**
   - `vendorLogin()` - Authenticate vendor with email/password
   - `vendorRegister()` - Create new vendor account with validation
   - Existing: Create, Read, Update, Delete operations

### 3. **Vendor Routes Updated**
   - `POST /api/vendors/login` - Vendor login endpoint
   - `POST /api/vendors/register` - Vendor registration endpoint
   - Existing CRUD endpoints (Create, Read, Update, Delete)

## Setup Instructions

### 1. Install Backend Dependencies
The backend already has bcryptjs and jsonwebtoken installed, so no additional setup needed.

### 2. Install Vendor Portal Dependencies
```bash
cd vendors
npm install
```

### 3. Run Vendor Portal
```bash
cd vendors
npm run dev
```
Portal will start on `http://localhost:5175`

### 4. Backend Server (if not running)
```bash
cd backend
npm start
```
Backend will run on `http://localhost:5000`

## How It Works

### Vendor Registration Flow
1. Vendor clicks "Register here"
2. Fills form: name, email, password, phone, address
3. POST to `/api/vendors/register`
4. Backend hashes password, saves vendor
5. Auto-login and redirects to dashboard

### Vendor Login Flow
1. Vendor enters email and password
2. POST to `/api/vendors/login`
3. Backend compares password hash
4. Returns vendor data (without password)
5. Frontend stores vendorId in localStorage
6. Redirects to dashboard

### Adding Car Flow
1. Vendor clicks "Add New Car" button
2. Fills car form (make, model, year, category, seats, transmission, fuel type, mileage, daily rate)
3. POST to `/api/cars` with owner field set to vendorId
4. Car is created and associated with vendor
5. Dashboard refreshes showing new car

### View Vendor Cars
1. Dashboard fetches cars with query: `/api/cars?vendor=<vendorId>&limit=100`
2. Car cards display with status badges
3. Vendor can delete cars or edit (future enhancement)

## Login Difference

### User Login (Frontend)
- `http://localhost:5173/components/Login`
- For customers to book cars
- Uses: `/api/users/login` (in future)

### Vendor Login (Vendor Portal)
- `http://localhost:5175/login`
- For vendors to manage fleet
- Uses: `/api/vendors/login`
- Separate authentication system

## Database Schema

### Updated Vendor Schema
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (hashed with bcryptjs),
  phone: String (optional),
  address: String (optional),
  verified: Boolean (default: false, set by admin),
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

1. **Password Hashing**: bcryptjs (10 salt rounds)
2. **Separate Authentication**: Vendor login separate from user login
3. **Session Management**: localStorage for vendor session
4. **Password Comparison**: Secure comparison using bcryptjs
5. **No Password Return**: API never returns password field
6. **Validation**: Email, password, and required fields validated

## Future Enhancements

- [ ] Edit existing car details
- [ ] View bookings and reservations
- [ ] Earnings/Revenue dashboard
- [ ] Monthly reports and statistics
- [ ] Support/Help ticket system
- [ ] Profile management and settings
- [ ] Document/License verification
- [ ] Token-based JWT authentication
- [ ] Refresh tokens
- [ ] Password reset functionality

## Testing the Setup

### 1. Register as Vendor
- Go to `http://localhost:5175/login`
- Click "Register here"
- Fill form with test data
- Submit

### 2. Login as Vendor
- Enter registered email and password
- Click "Login"

### 3. Add Cars
- Click "Add New Car" button
- Fill car details
- Click "Add Car"

### 4. View Fleet
- See cars displayed on dashboard
- Check status badges
- Delete cars if needed

## Troubleshooting

### Port 5174 already in use
Edit `vite.config.js` and change port number:
```javascript
server: {
  port: 5175,  // Change this
  open: true
}
```

### Backend not connecting
- Make sure backend is running on port 5000
- Check CORS is enabled in backend
- Verify no firewall blocking

### Login not working
- Verify email and password are correct
- Check backend console for errors
- Ensure bcryptjs password is being hashed

## Files Modified

1. `/backend/models/vendorModel.js` - Added password field and methods
2. `/backend/controllers/vendorController.js` - Added login/register functions
3. `/backend/routes/vendorRoutes.js` - Added auth routes

## Files Created

### Vendor Portal
1. `vendors/src/pages/VendorLogin.jsx`
2. `vendors/src/pages/VendorDashboard.jsx`
3. `vendors/src/App.jsx`
4. `vendors/src/main.jsx`
5. `vendors/src/index.css`
6. `vendors/index.html`
7. `vendors/package.json`
8. `vendors/vite.config.js`
9. `vendors/tailwind.config.js`
10. `vendors/postcss.config.js`
11. `vendors/eslint.config.js`
12. `vendors/.gitignore`
13. `vendors/README.md`

## Summary

The vendor portal is now fully functional with:
- Complete registration and login system
- Fleet management dashboard
- Car management (add/delete)
- Status tracking
- Beautiful dark UI with Tailwind CSS
- Responsive design
- Toast notifications
- Error handling

Vendors can now independently manage their cars and offerings on the KARZONE platform!
