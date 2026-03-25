/* 
  AddTask.js

  — TH (ภาษาไทย):
    ไฟล์นี้เป็นคอมโพเนนต์ (Component) แสดงหน้าต่าง (Dialog) สำหรับเพิ่มงานใหม่ (Task)
    ในแอปพลิเคชัน My ToDo โดยทำงานบนฝั่ง Frontend (React) และเชื่อมต่อกับ Backend
    ผ่าน Firebase Firestore (Database แบบเรียลไทม์ของ Google)

  — EN (English):
    This file is a component showing a Dialog box for adding new tasks to the My ToDo application.
    It runs on the frontend (React) and connects to the backend via Firebase Firestore (Google’s real-time database).
*/

import React, { useState, useEffect } from 'react';
// db, auth are from our Firebase config (Backend API to connect with Firestore/Authentication)
import { db, auth } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Typography,
  ButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const AddTask = ({ open, onClose }) => {
  // สถานะของฟิลด์ต่าง ๆ ในฟอร์ม:
  // TH: state ต่าง ๆ ที่ใช้เก็บข้อมูลที่ผู้ใช้กรอก
  // EN: These states hold user input data from the form
  const [taskName, setTaskName] = useState('');       // เก็บชื่อของงาน
  const [description, setDescription] = useState(''); // เก็บรายละเอียดของงาน
  const [dueDate, setDueDate] = useState('');         // เก็บวันที่กำหนดส่ง (string format)
  const [priority, setPriority] = useState('Medium'); // เก็บระดับความสำคัญ (High, Medium, Low)
  const [urgency, setUrgency] = useState(1);          // เก็บระดับความเร่งด่วน (1 = ต่ำ, 2 = ปานกลาง, 3 = สูง)

  const [categories, setCategories] = useState([]);   // เก็บรายการหมวดหมู่จาก Firestore
  const [selectedCategory, setSelectedCategory] = useState(''); // หมวดหมู่ที่ถูกเลือกในฟอร์ม

  // ดึงข้อมูลหมวดหมู่จาก Firestore (Backend Database)
  // TH: เมื่อคอมโพเนนต์ถูก mount หรือผู้ใช้เปลี่ยนการล็อกอิน
  // EN: Runs when the component mounts or the user changes login state
  useEffect(() => {
    // ตรวจสอบการล็อกอินของผู้ใช้ผ่าน auth
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // สร้าง query เพื่อดึงเฉพาะ categories ของ user คนนั้น
        const q = query(
          collection(db, 'categories'),
          where('userID', '==', user.uid)
        );

        // onSnapshot จะสมัครสมาชิก (subscribe) การเปลี่ยนแปลงของ Firestore แบบเรียลไทม์
        const unsubscribe = onSnapshot(q, (snapshot) => {
          // แปลง snapshot เป็นอาร์เรย์ categoriesData
          const categoriesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          // อัปเดต state categories
          setCategories(categoriesData);
        });

        // คืนค่า unsubscribe เพื่อหยุดฟังอีเวนต์จาก Firestore เมื่อ unmount
        return () => unsubscribe();
      }
    });

    // คืนค่า unsubscribeAuth เพื่อหยุดฟังอีเวนต์การล็อกอิน
    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, []);

  // ฟังก์ชันสำหรับ "เพิ่มงานใหม่" ลงใน Firestore
  const handleAddTask = async () => {
    // ถ้า taskName ว่างเปล่า ไม่ทำอะไร
    if (taskName.trim() === '') return;

    // ตรวจสอบ user ปัจจุบันจาก Firebase auth
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert('ผู้ใช้งานยังไม่ได้ล็อกอิน โปรดล็อกอินก่อนเพิ่มงาน');
      return;
    }

    /* 
      สร้างเอกสารใหม่ในคอลเลกชัน 'tasks' โดยเพิ่ม fields:
      - taskName, description, dueDate (แปลงเป็น Date ถ้าไม่ใช่ค่าว่าง)
      - priority, urgency, categoryID, completed = false
      - createdAt = serverTimestamp() (เพื่อให้เวลาตรงกับเวลาของเซิร์ฟเวอร์)
      - userID = UID ของผู้ใช้ปัจจุบัน
    */
    await addDoc(collection(db, 'tasks'), {
      taskName,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority,
      urgency,
      categoryID: selectedCategory,
      completed: false,
      createdAt: serverTimestamp(),
      userID: currentUser.uid,
    });

    // ปิด Dialog
    onClose();
    // รีเซ็ตฟอร์มเป็นค่าว่าง
    resetForm();
  };

  // ฟังก์ชัน resetForm() เพื่อเคลียร์ค่าในฟอร์ม
  const resetForm = () => {
    setTaskName('');
    setDescription('');
    setDueDate('');
    setPriority('Medium');
    setUrgency(1);
    setSelectedCategory('');
  };

  return (
    // Dialog ของ Material-UI เพื่อแสดงฟอร์มเพิ่มงาน
    <Dialog open={open} onClose={onClose}>
      {/* ชื่อ Dialog */}
      <DialogTitle>เพิ่มงานใหม่</DialogTitle>
      <DialogContent>
        
        {/* ฟิลด์กรอกชื่อของงาน */}
        <TextField
          label="ชื่อของงาน"
          fullWidth
          margin="normal"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          required
        />
        
        {/* ฟิลด์กรอกรายละเอียดของงาน */}
        <TextField
          label="รายละเอียด"
          fullWidth
          multiline
          rows={4}
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        
        {/* ฟิลด์เลือกวันที่กำหนดส่ง (รูปแบบ date) */}
        <TextField
          label="กำหนดส่ง"
          type="date"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        
        {/* เลือกหมวดหมู่ (Categories) */}
        <FormControl fullWidth margin="normal">
          <InputLabel>หมวดหมู่</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {/* สร้าง MenuItem สำหรับแต่ละหมวดหมู่ที่ได้จาก Firestore */}
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* ปุ่มเลือกระดับความเร่งด่วน (urgency) */}
        <Typography variant="body1" sx={{ marginTop: 2 }}>
          ระดับความเร่งด่วน
        </Typography>
        <ButtonGroup fullWidth variant="outlined" sx={{ marginTop: 1 }}>
          <Button
            color="success"
            variant={urgency === 1 ? 'contained' : 'outlined'}
            onClick={() => setUrgency(1)}
          >
            ต่ำ
          </Button>
          <Button
            color="warning"
            variant={urgency === 2 ? 'contained' : 'outlined'}
            onClick={() => setUrgency(2)}
          >
            ปานกลาง
          </Button>
          <Button
            color="error"
            variant={urgency === 3 ? 'contained' : 'outlined'}
            onClick={() => setUrgency(3)}
          >
            สูง
          </Button>
        </ButtonGroup>
      </DialogContent>
      {/* Button ด้านล่างของ Dialog */}
      <DialogActions>
        {/* ปุ่มยกเลิก */}
        <Button onClick={onClose} color="primary">
          ยกเลิก
        </Button>
        {/* ปุ่มเพิ่มงานใหม่ */}
        <Button onClick={handleAddTask} color="primary">
          เพิ่มงาน
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTask;
