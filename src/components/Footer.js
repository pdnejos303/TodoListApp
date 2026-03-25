/*
  Footer.js

  — TH (ภาษาไทย):
    คอมโพเนนต์ Footer สำหรับแอปพลิเคชัน My ToDo App
    จะแสดงอยู่ด้านล่างสุด (position="static" แต่จัดตำแหน่ง auto ที่ bottom)
    โดยมี Toolbar และ Typography บอกลิขสิทธิ์ (© ปีปัจจุบัน)

  — EN (English):
    A Footer component for the My ToDo App, positioned at the bottom.
    Includes a Toolbar with a Typography showing the current year copyright.
*/

import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

const Footer = () => {
  return (
    <AppBar
      position="static"
      sx={{ top: 'auto', bottom: 0, backgroundColor: '#333', color: '#FFF' }}
    >
      <Toolbar>
        {/* flexGrow: 1 => push content to the center */}
        <Typography variant="body1" align="center" sx={{ flexGrow: 1 }}>
          © {new Date().getFullYear()} My ToDo App. All rights reserved.
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Footer;
