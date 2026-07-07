import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import HospitalDashboard from './components/Hospital/HospitalDashboard';
import DonorDashboard from './components/Donor/DonorDashboard';
import BloodBankDashboard from './components/BloodBank/BloodBankDashboard';
import CursorFollower from './components/CursorFollower';

const App = () => {
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouch) document.body.classList.add('custom-cursor-active');
    return () => document.body.classList.remove('custom-cursor-active');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <CursorFollower />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/donor" element={<DonorDashboard />} />
        <Route path="/hospital" element={<HospitalDashboard />} />
        <Route path="/bloodbank" element={<BloodBankDashboard />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
};

export default App;
