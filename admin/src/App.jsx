import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes } from 'react-router-dom'
import AddCar from './components/AddCar'
import ManageCar from './components/ManageCar'
import Booking from './components/Booking'
import ManageVendors from './components/ManageVendors'

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<AddCar />} />
        <Route path='/manage-cars' element={<ManageCar />} />
        <Route path='/manage-vendors' element={<ManageVendors />} />
        <Route path='/bookings' element={<Booking />} />
      </Routes>
    </>
  )
}

export default App