// src/components/SignUp.js
import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useThemeContext } from '../ThemeContext'; // นำเข้า ThemeContext

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  // โหลดข้อมูลที่จำจาก localStorage (ถ้าผู้ใช้ติ๊ก Remember Me)
  useEffect(() => {
    const savedEmail = localStorage.getItem('savedSignUpEmail');
    const savedPassword = localStorage.getItem('savedSignUpPassword');
    const remember = localStorage.getItem('rememberSignUp');

    if (remember === 'true') {
      setEmail(savedEmail || '');
      setPassword(savedPassword || '');
      setRememberMe(true);
    }
  }, []);

  const handleRememberMeChange = (event) => {
    setRememberMe(event.target.checked);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(''); // รีเซ็ตข้อความข้อผิดพลาด

    try {
      // สมัครสมาชิกผู้ใช้ใน Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // เพิ่มข้อมูลผู้ใช้ใน Firestore
      await setDoc(doc(db, 'users', user.uid), {
        userID: user.uid,
        name: '',
        email: user.email,
        createdAt: serverTimestamp(),
        notificationsEnabled: true,
        profileImageURL: '',
        theme: 'light',
        language: 'en',
        otherPreferences: {},
      });

      // บันทึกข้อมูลถ้าติ๊ก Remember Me
      if (rememberMe) {
        localStorage.setItem('savedSignUpEmail', email);
        localStorage.setItem('savedSignUpPassword', password);
        localStorage.setItem('rememberSignUp', 'true');
      } else {
        localStorage.removeItem('savedSignUpEmail');
        localStorage.removeItem('savedSignUpPassword');
        localStorage.removeItem('rememberSignUp');
      }

      // เปลี่ยนเส้นทางหรือทำสิ่งอื่นตามที่ต้องการหลังจากสมัครสมาชิกสำเร็จ (ถ้ามี)
    } catch (err) {
      // ตั้งค่าข้อความข้อผิดพลาดตามประเภทข้อผิดพลาด
      if (err.code === 'auth/email-already-in-use') {
        setError('อีเมลนี้ถูกใช้แล้ว กรุณาลองเข้าสู่ระบบแทน');
      } else if (err.code === 'auth/weak-password') {
        setError('รหัสผ่านควรมีความยาวอย่างน้อย 6 ตัวอักษร');
      } else if (err.code === 'auth/invalid-email') {
        setError('กรุณากรอกอีเมลให้ถูกต้อง');
      } else if (err.code === 'permission-denied') {
        setError('ไม่มีสิทธิ์เพิ่มผู้ใช้ใน Firestore');
      } else {
        setError('ไม่สามารถสมัครสมาชิกได้ กรุณาลองอีกครั้ง');
      }
    }
  };

  // ใช้ธีมและตรวจสอบขนาดหน้าจอเพื่อรองรับ Responsive Design
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container
      maxWidth="xs"
      sx={{
        backgroundColor: theme.palette.background.paper,
        padding: isSmallScreen ? 2 : 4,
        borderRadius: 2,
        boxShadow: 3,
        marginTop: isSmallScreen ? 2 : 4,
      }}
    >
      <Typography variant="h4" align="center" gutterBottom color="primary">
        Sign Up
      </Typography>
      <Box
        component="form"
        onSubmit={handleSignUp}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <TextField
          label="Email"
          type="email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={handleRememberMeChange}
              color="primary"
            />
          }
          label="Remember Me"
        />
        {error && (
          <Typography color="error" align="center">
            {error}
          </Typography>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          fullWidth
        >
          Sign Up
        </Button>
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Already have an account?{' '}
          <a
            href="/login"
            style={{
              color: theme.palette.primary.main,
              textDecoration: 'none',
            }}
          >
            Log In
          </a>
        </Typography>
      </Box>
    </Container>
  );
};

export default SignUp;
