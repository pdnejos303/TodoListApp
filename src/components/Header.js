/*
  Header.js

  — TH (ภาษาไทย):
    คอมโพเนนต์ Header เป็นแถบ AppBar ด้านบนของแอป
    มีฟีเจอร์:
      - ปุ่มเมนู (MenuIcon) เปิด/ปิด Drawer ด้านซ้าย (Navigation Drawer)
      - แสดงชื่อแอป "My ToDo App"
      - ปุ่มสลับธีม (DarkMode / LightMode)
      - Profile Section สำหรับผู้ใช้ (Avatar, Profile menu, Logout)

  — EN (English):
    The Header component is the top AppBar of the application.
    Features:
      - Menu button (MenuIcon) to open/close left Drawer (Navigation Drawer)
      - Shows the app name "My ToDo App"
      - Toggle theme button (DarkMode / LightMode)
      - Profile section for the user (Avatar, Profile menu, Logout)
*/

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  useTheme,
  useMediaQuery,
} from '@mui/material';

// import icons
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import LogoutIcon from '@mui/icons-material/Logout';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CategoryIcon from '@mui/icons-material/Category';
import BarChartIcon from '@mui/icons-material/BarChart';

// React Router: Link
import { Link } from 'react-router-dom';

// useThemeContext => custom context for toggling dark mode
import { useThemeContext } from '../ThemeContext';

const Header = ({ user, handleSignOut }) => {
  /*
    drawerOpen: สถานะเปิด/ปิด Drawer (boolean)
    anchorEl: Element ที่กำหนด anchor สำหรับเมนูโปรไฟล์
  */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // จาก useThemeContext => darkMode, toggleTheme
  const { darkMode, toggleTheme } = useThemeContext();

  // ใช้ธีมปัจจุบัน และตรวจสอบว่าหน้าจอเล็กหรือไม่
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // ฟังก์ชันเปิด/ปิด Drawer
  const toggleDrawer = (open) => (event) => {
    // ถ้า keyDown เป็น Tab หรือ Shift => ไม่ทำอะไร
    if (
      event &&
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  // ฟังก์ชันเปิดเมนูโปรไฟล์ (เมื่อคลิก Avatar)
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // ฟังก์ชันปิดเมนูโปรไฟล์
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {/* Header Bar using AppBar */}
      <AppBar
        position="fixed"
        sx={{ backgroundColor: '#212121', color: '#FFF' }}
      >
        <Toolbar>
          {/* ปุ่มแฮมเบอร์เกอร์ (MenuIcon) สำหรับเปิด Drawer */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          {/* Title (Typography) */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My ToDo App
          </Typography>

          {/* Theme Toggle Button (darkMode ? LightIcon : DarkIcon) */}
          <IconButton color="inherit" onClick={toggleTheme}>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {/* Profile Section: user info + Avatar */}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              {/* ถ้าหน้าจอไม่เล็ก => แสดงชื่อ/อีเมลด้วย */}
              {!isSmallScreen && (
                <Typography variant="body1" sx={{ mr: 1 }}>
                  {user.displayName || user.email}
                </Typography>
              )}
              {/* Avatar => รูปโปรไฟล์ Google หรือรูปจาก user.photoURL */}
              <IconButton onClick={handleProfileMenuOpen} color="inherit">
                <Avatar src={user.photoURL} alt={user.displayName || user.email} />
              </IconButton>
              {/* Menu โปรไฟล์ => แสดงปุ่ม Profile และ Logout */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
              >
                <MenuItem onClick={handleProfileMenuClose}>Profile</MenuItem>
                <MenuItem onClick={handleSignOut}>
                  <LogoutIcon sx={{ mr: 1 }} /> Logout
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer ด้านซ้าย */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{
            width: 250,
            backgroundColor: '#333',
            height: '100%',
            color: '#FFF',
          }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          {/* Drawer Title */}
          <Typography
            variant="h6"
            sx={{
              p: 2,
              color: '#FFF',
              backgroundColor: '#212121',
              fontWeight: 'bold',
            }}
          >
            Menu
          </Typography>
          <Divider sx={{ backgroundColor: '#444' }} />

          {/* Navigation Links => List of ListItem */}
          <List>
            <ListItem
              button
              component={Link}
              to="/"
              sx={{ '&:hover': { backgroundColor: '#444' } }}
            >
              <ListItemIcon>
                <HomeIcon sx={{ color: '#BBB' }} />
              </ListItemIcon>
              <ListItemText
                primary="Home"
                primaryTypographyProps={{ fontSize: '1rem', color: '#FFF' }}
              />
            </ListItem>

            {/* Calendar */}
            <ListItem
              button
              component={Link}
              to="/calendar"
              sx={{ '&:hover': { backgroundColor: '#444' } }}
            >
              <ListItemIcon>
                <CalendarTodayIcon sx={{ color: '#BBB' }} />
              </ListItemIcon>
              <ListItemText
                primary="Calendar"
                primaryTypographyProps={{ fontSize: '1rem', color: '#FFF' }}
              />
            </ListItem>

            {/* Categories */}
            <ListItem
              button
              component={Link}
              to="/categories"
              sx={{ '&:hover': { backgroundColor: '#444' } }}
            >
              <ListItemIcon>
                <CategoryIcon sx={{ color: '#BBB' }} />
              </ListItemIcon>
              <ListItemText
                primary="Categories"
                primaryTypographyProps={{ fontSize: '1rem', color: '#FFF' }}
              />
            </ListItem>

            {/* Progress */}
            <ListItem
              button
              component={Link}
              to="/progress"
              sx={{ '&:hover': { backgroundColor: '#444' } }}
            >
              <ListItemIcon>
                <BarChartIcon sx={{ color: '#BBB' }} />
              </ListItemIcon>
              <ListItemText
                primary="Progress"
                primaryTypographyProps={{ fontSize: '1rem', color: '#FFF' }}
              />
            </ListItem>

            {/* About Page */}
            <ListItem
              button
              component={Link}
              to="/about"
              sx={{ '&:hover': { backgroundColor: '#444' } }}
            >
              <ListItemIcon>
                <InfoIcon sx={{ color: '#BBB' }} />
              </ListItemIcon>
              <ListItemText
                primary="About"
                primaryTypographyProps={{ fontSize: '1rem', color: '#FFF' }}
              />
            </ListItem>

            {/* Contact Page */}
            <ListItem
              button
              component={Link}
              to="/contact"
              sx={{ '&:hover': { backgroundColor: '#444' } }}
            >
              <ListItemIcon>
                <ContactMailIcon sx={{ color: '#BBB' }} />
              </ListItemIcon>
              <ListItemText
                primary="Contact"
                primaryTypographyProps={{ fontSize: '1rem', color: '#FFF' }}
              />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;
