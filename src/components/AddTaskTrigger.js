/*
  AddTaskTrigger.js

  — TH (ภาษาไทย):
    คอมโพเนนต์ (Component) ชื่อ AddTaskTrigger นี้ถูกสร้างขึ้นเพื่อเป็น "ตัวเรียก" (Trigger)
    ให้ผู้ใช้สามารถเปิด Dialog สำหรับเพิ่มงาน (Task) ใหม่ในระบบได้อย่างง่ายดาย 
    โดยใช้ Card ที่มีไอคอน "AddTaskIcon" อยู่ตรงกลาง
    เมื่อคลิกแล้วจะเปิด Dialog (AddTask) เพื่อให้ผู้ใช้กรอกข้อมูลงานใหม่

  — EN (English):
    The AddTaskTrigger component is created to serve as a "trigger" for opening a Dialog
    that allows users to add a new task to the system. It uses a Card with an "AddTaskIcon" 
    in the center, and when clicked, it opens the AddTask Dialog where users can input new task details.
*/

import React, { useState } from 'react'; 
// useState เป็น React Hook สำหรับการจัดการสถานะ (State) ในฟังก์ชันคอมโพเนนต์
// useState is a React Hook for managing state inside function components

import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  IconButton,
  useMediaQuery,
} from '@mui/material';

// Icon สำหรับปุ่มเพิ่มงาน
import AddTaskIcon from '@mui/icons-material/PlaylistAddCheckCircle';
// import คอมโพเนนต์ AddTask ที่เป็น Dialog สำหรับการเพิ่มงานจริง ๆ
import AddTask from './AddTask';

const AddTaskTrigger = () => {
  /* 
    open: สถานะ boolean ที่บอกว่า Dialog ของการเพิ่มงานกำลังเปิดอยู่หรือไม่
    setOpen: ฟังก์ชันสำหรับปรับสถานะ open
    เริ่มต้น = false (ปิด Dialog)
  */
  const [open, setOpen] = useState(false);

  /* 
    useTheme(): Hook ของ Material-UI สำหรับเข้าถึงธีม (theme) ปัจจุบัน 
    ซึ่งรวมถึงค่าต่าง ๆ อย่างสีพื้นหลัง (background) และสีตัวอักษร (text)
  */
  const theme = useTheme();

  /*
    useMediaQuery(theme.breakpoints.down('sm')):
    Hook ของ Material-UI สำหรับตรวจสอบว่าหน้าจอมีขนาดเล็ก (sm) หรือไม่
    ถ้าเป็น true, แสดงว่าหน้าจอเล็ก
  */
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // ฟังก์ชันเปิด Dialog
  const handleOpen = () => setOpen(true);

  // ฟังก์ชันปิด Dialog
  const handleClose = () => setOpen(false);

  return (
    <Box sx={{ textAlign: 'center', marginBottom: 4 }}>
      {/*
        Card สำหรับให้ผู้ใช้คลิกเพื่อเปิด Dialog 'AddTask'
        - onClick={handleOpen} = เมื่อ Card นี้ถูกคลิก จะเรียกฟังก์ชัน handleOpen 
          เพื่อ setOpen(true)
      */}
      <Card
        onClick={handleOpen}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
          /* 
            ถ้าเป็นจอเล็ก (isSmallScreen === true) ให้ minWidth = '100%'
            ไม่เช่นนั้น = 600px
          */
          minWidth: isSmallScreen ? '100%' : 600,
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          cursor: 'pointer',
          transition: '0.3s',
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
            boxShadow:
              theme.palette.mode === 'dark'
                ? '0px 4px 10px rgba(255, 255, 255, 0.2)'
                : '0px 4px 10px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <CardContent>
          {/* ปุ่มไอคอน + ข้อความ "Add New Task" */}
          <IconButton color="primary" size="large">
            <AddTaskIcon sx={{ fontSize: 48 }} />
          </IconButton>
          <Typography variant="h5" sx={{ color: theme.palette.text.primary }}>
            Add New Task
          </Typography>
        </CardContent>
      </Card>
    
      {/*
        AddTask: Dialog สำหรับเพิ่มงาน 
        open={open} => เปิด/ปิด Dialog ตามสถานะ open
        onClose={handleClose} => ปิด Dialog เมื่อ Action เสร็จหรือผู้ใช้กดปุ่มปิด
      */}
      <AddTask open={open} onClose={handleClose} />
    </Box>
  );
};

export default AddTaskTrigger;
