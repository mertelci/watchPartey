import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from "react-router-dom";
import SignupPage from "./pages/SignupPage";
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import { useAuthStore } from './store/authStore';
import { Toaster } from 'react-hot-toast';
import RoomPage from './pages/RoomPage';
import Footer from './components/Footer';

function App() {
  const { authUser, checkAuth, isLoading } = useAuthStore()

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div className="flex-1">
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/register" element={!authUser ? <SignupPage /> : <Navigate to="/" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/room/:roomId" element={authUser ? <RoomPage /> : <Navigate to="/login" />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App
