/*
  Login.js

  — TH (ภาษาไทย):
    คอมโพเนนต์สำหรับหน้า "Login" หรือการเข้าสู่ระบบ:
    - ผู้ใช้กรอกอีเมลและพาสเวิร์ด
    - ถ้ามีการติ๊ก Remember Me => บันทึกข้อมูลลง localStorage 
    - เรียก Firebase Auth (signInWithEmailAndPassword) เพื่อตรวจสอบ
    - มีปุ่ม "Sign in with Google" เรียก signInWithGoogle (ส่งจาก Props)
    - หากล็อกอินสำเร็จ => จะเปลี่ยนเส้นทางหรืออัปเดตสถานะผู้ใช้ในแอป

  — EN (English):
    A component for the "Login" page:
    - User inputs email and password
    - If "Remember Me" is checked => store data in localStorage
    - Calls Firebase Auth (signInWithEmailAndPassword) to verify
    - Has a "Sign in with Google" button that calls signInWithGoogle from props
    - If login is successful => route or update user state in the app
*/

import React, { useState, useEffect } from 'react';
/*
  useState: Hook for managing local state
  useEffect: Hook for side effects (loading saved data from localStorage)
*/

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

// Firebase auth (Backend for user login)
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
// import ThemeContext for toggling theme (optional)
import { useThemeContext } from '../ThemeContext';

const Login = ({ signInWithGoogle }) => {
  /*
    State variables:
    - email, password => credentials for user login
    - rememberMe => boolean, indicates if user wants to store credentials
    - error => store error messages if login fails
  */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  // When component mounts, check localStorage if rememberMe was set
  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');
    const remember = localStorage.getItem('rememberMe');

    if (remember === 'true') {
      setEmail(savedEmail || '');
      setPassword(savedPassword || '');
      setRememberMe(true);
    }
  }, []);

  // handleRememberMeChange => updates rememberMe state
  const handleRememberMeChange = (event) => {
    setRememberMe(event.target.checked);
  };

  // handleLogin => called when user submits the login form
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // clear any previous errors

    try {
      // signInWithEmailAndPassword => Firebase Auth method
      await signInWithEmailAndPassword(auth, email, password);

      // if rememberMe => store in localStorage
      if (rememberMe) {
        localStorage.setItem('savedEmail', email);
        localStorage.setItem('savedPassword', password);
        localStorage.setItem('rememberMe', 'true');
      } else {
        // if not => remove from localStorage
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('savedPassword');
        localStorage.removeItem('rememberMe');
      }
    } catch (error) {
      // if login fails => set error message
      setError(error.message);
    }
  };

  // handleGoogleLogin => calls signInWithGoogle (passed from props)
  const handleGoogleLogin = () => {
    signInWithGoogle();
  };

  // useTheme() => get current MUI theme
  const theme = useTheme();
  // check if screen is small => for responsive
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
        Login
      </Typography>
      {/* form to handle login submit */}
      <Box
        component="form"
        onSubmit={handleLogin}
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
        {/* Remember Me checkbox */}
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
        {/* show error if any */}
        {error && (
          <Typography color="error" align="center">
            {error}
          </Typography>
        )}
        {/* Login button */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          fullWidth
        >
          Login
        </Button>
        {/* Google login button */}
        <Button
          variant="contained"
          color="secondary"
          onClick={handleGoogleLogin}
          sx={{ mt: 1 }}
          fullWidth
        >
          Sign in with Google
        </Button>
        {/* Link to SignUp */}
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Don't have an account?{' '}
          <a
            href="/signup"
            style={{
              color: theme.palette.primary.main,
              textDecoration: 'none',
            }}
          >
            Sign Up
          </a>
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;
