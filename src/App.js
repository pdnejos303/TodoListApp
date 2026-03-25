/*
  App.js

  — TH (ภาษาไทย):
    ไฟล์หลักของแอปพลิเคชันที่กำหนดเส้นทาง (Routing) และการจัดการผู้ใช้ที่เข้าสู่ระบบ
    ใช้ React Router เพื่อจัดการเส้นทางต่างๆ และ Firebase Authentication สำหรับการยืนยันตัวตนของผู้ใช้
    รวมถึงใช้ Context API สำหรับการจัดการธีมของแอป (Light/Dark Mode)

  — EN (English):
    The main file of the application that defines routing and handles user authentication.
    Utilizes React Router for managing different routes and Firebase Authentication for user verification.
    Also incorporates Context API for managing the app's theme (Light/Dark Mode).
*/

import React, { useState, useEffect } from 'react';
// React Hooks: useState สำหรับการจัดการ state ภายใน component, useEffect สำหรับ side-effects เช่น การดึงข้อมูล

import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
// React Router Components:
// - Route: สำหรับกำหนดเส้นทาง
// - Routes: Container สำหรับ Route ทั้งหมด
// - Navigate: สำหรับการเปลี่ยนเส้นทางแบบโปรแกรม
// - useLocation: Hook สำหรับดึงข้อมูลเกี่ยวกับเส้นทางปัจจุบัน

import { auth, provider } from './firebase';
// Import Firebase Authentication และ Provider สำหรับการล็อกอินด้วย Google

import { signInWithPopup, signOut } from 'firebase/auth';
// Firebase Auth Functions:
// - signInWithPopup: สำหรับการล็อกอินด้วย Provider (เช่น Google)
// - signOut: สำหรับการออกจากระบบ

import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import CalendarPage from './components/CalendarPage';
import CategoriesPage from './components/CategoriesPage';
import ProgressPage from './components/ProgressPage';
import About from './components/About';
// Import Components ต่างๆ ที่จะใช้ในแอป

import { Toolbar } from '@mui/material';
// Material-UI Component สำหรับการจัดการพื้นที่ว่างด้านบนของหน้า

import { ThemeContextProvider } from './ThemeContext';
// Import ThemeContextProvider สำหรับการจัดการธีมของแอป (Light/Dark Mode)

function App() {
  /*
    State Variables:
    - user: เก็บข้อมูลผู้ใช้ที่ล็อกอินอยู่ (null ถ้ายังไม่ล็อกอิน)
  */
  const [user, setUser] = useState(null);

  // useEffect สำหรับตรวจสอบสถานะการล็อกอินของผู้ใช้เมื่อ component mount
  useEffect(() => {
    // Subscribe การตรวจสอบสถานะการล็อกอินจาก Firebase Auth
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser); // ตั้งค่าผู้ใช้ใน state
    });
    return () => unsubscribe(); // ทำความสะอาดเมื่อ component unmount
  }, []);

  // ฟังก์ชันสำหรับการเข้าสู่ระบบด้วย Google
  const signInWithGoogle = async () => {
    try {
      // signInWithPopup เปิดหน้าต่างล็อกอินด้วย Provider ที่กำหนด (Google)
      const result = await signInWithPopup(auth, provider);
      setUser(result.user); // ตั้งค่าผู้ใช้หลังจากล็อกอินสำเร็จ
    } catch (error) {
      console.error('Error signing in with Google:', error);
      // สามารถเพิ่มการแจ้งเตือนข้อผิดพลาดให้ผู้ใช้ทราบได้ที่นี่
    }
  };

  // ฟังก์ชันสำหรับการออกจากระบบ
  const handleSignOut = async () => {
    try {
      await signOut(auth); // เรียกใช้ signOut จาก Firebase Auth
      setUser(null); // ตั้งค่าผู้ใช้เป็น null หลังจากออกจากระบบ
    } catch (error) {
      console.error('Error signing out:', error);
      // สามารถเพิ่มการแจ้งเตือนข้อผิดพลาดให้ผู้ใช้ทราบได้ที่นี่
    }
  };

  return (
    <ThemeContextProvider>
      {/* Wrap with ThemeContextProvider สำหรับการจัดการธีมของแอป */}
      <AppContent
        user={user}
        handleSignOut={handleSignOut}
        signInWithGoogle={signInWithGoogle}
      />
    </ThemeContextProvider>
  );
}

function AppContent({ user, handleSignOut, signInWithGoogle }) {
  /*
    Props:
    - user: ข้อมูลผู้ใช้ที่ล็อกอินอยู่
    - handleSignOut: ฟังก์ชันสำหรับการออกจากระบบ
    - signInWithGoogle: ฟังก์ชันสำหรับการเข้าสู่ระบบด้วย Google
  */

  const location = useLocation();
  // useLocation Hook ใช้ดึงข้อมูลเกี่ยวกับเส้นทางปัจจุบัน

  // กำหนดหน้าไหนที่ไม่ต้องแสดง Header และ Footer
  const hideHeaderFooter =
    location.pathname === '/login' || location.pathname === '/signup';
  // ถ้าอยู่บนหน้า Login หรือ Signup จะไม่แสดง Header และ Footer

  return (
    <>
      {/* แสดง Header ถ้าไม่ใช่หน้า Login หรือ Signup */}
      {!hideHeaderFooter && <Header user={user} handleSignOut={handleSignOut} />}
      {!hideHeaderFooter && <Toolbar />}
      {/* Toolbar ใช้สร้างพื้นที่ว่างเพื่อไม่ให้เนื้อหาซ้อนทับกับ Header */}

      {/* Main Content */}
      <div
        style={{
          minHeight: hideHeaderFooter ? '100vh' : 'calc(100vh - 128px)',
          paddingTop: hideHeaderFooter ? '0' : '20px',
        }}
      >
        {/* Routes ใช้กำหนดเส้นทางต่างๆ ของแอป */}
        <Routes>
          {/* เส้นทางหลักที่กำหนดให้ผู้ใช้ที่ล็อกอินแล้วไปที่ Dashboard และผู้ที่ยังไม่ล็อกอินไปที่ Login */}
          <Route
            path="/"
            element={
              user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            }
          />
          {/* เส้นทางสำหรับหน้า Login */}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/dashboard" />
              ) : (
                <Login signInWithGoogle={signInWithGoogle} />
              )
            }
          />
          {/* เส้นทางสำหรับหน้า Signup */}
          <Route
            path="/signup"
            element={user ? <Navigate to="/dashboard" /> : <Signup />}
          />
          {/* เส้นทางสำหรับหน้า Dashboard */}
          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard user={user} handleSignOut={handleSignOut} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          {/* เส้นทางสำหรับหน้าต่างๆ ของแอป */}
          <Route
            path="/tasks"
            element={user ? <TaskList /> : <Navigate to="/login" />}
          />
          <Route
            path="/calendar"
            element={user ? <CalendarPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/categories"
            element={user ? <CategoriesPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/progress"
            element={user ? <ProgressPage /> : <Navigate to="/login" />}
          />
          {/* Route สำหรับ About Page ที่ไม่ต้องการการล็อกอิน */}
          <Route path="/about" element={<About />} />
        </Routes>
      </div>

      {/* แสดง Footer ถ้าไม่ใช่หน้า Login หรือ Signup */}
      {!hideHeaderFooter && <Footer />}
    </>
  );
}

export default App;
