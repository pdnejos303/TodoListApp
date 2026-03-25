/*
  CalendarPage.js

  — TH (ภาษาไทย):
    คอมโพเนนต์นี้เป็นหน้า (Page) ที่จะแสดงปฏิทิน (Calendar) โดยใช้ไลบรารี
    'react-big-calendar' ผู้ใช้สามารถดูงานตามวันได้ทันที และสามารถคลิกเพื่อ
    เพิ่มหรือแก้ไขงานได้ เมื่อเพิ่มงานใหม่ ระบบจะบันทึกข้อมูลลงใน Firestore

  — EN (English):
    This component is a page that displays a calendar using the 'react-big-calendar' library. 
    Users can view tasks per day and click to add or edit tasks. When adding new tasks, 
    the data is stored in Firestore.
*/

import React, { useState, useEffect } from 'react';
// db, auth: สำหรับเชื่อมต่อ Firebase Firestore และ Authentication (Backend, API)
import { db, auth } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import dayjs from 'dayjs';
import {
  Container,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css'; // CSS สำหรับ react-big-calendar

// localizer ของ big-calendar ที่อิงกับ moment.js
const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  /* 
    useState Hooks:
    - tasks: เก็บรายการงานทั้งหมด
    - openDialog: สถานะเปิด/ปิด Dialog
    - selectedEvent: เก็บงาน (task) ที่ถูกเลือกจาก Calendar เพื่อแก้ไขหรือลบ
    - newTaskDate: วันที่สำหรับงานใหม่ (เมื่อคลิกใน Calendar)
    - newTaskName: ชื่อของงานใหม่
    - newTaskDescription: รายละเอียดของงานใหม่
    - categories: เก็บหมวดหมู่ทั้งหมด
    - snackbarOpen: สถานะเปิด/ปิด Snackbar แจ้งเตือน
  */
  const [tasks, setTasks] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newTaskDate, setNewTaskDate] = useState(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // ใช้ธีมปัจจุบัน + ตรวจสอบว่าหน้าจอเล็ก (isSmallScreen) หรือไม่
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  /* 
    useEffect Hook:
    - ทำงานเมื่อคอมโพเนนต์ Mount/Update 
    - ในที่นี้ ใช้เพื่อตรวจสอบ user (auth) และ subscribe (onSnapshot) 
      ข้อมูล tasks/categoriess จาก Firestore 
  */
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // Query สำหรับ tasks ที่ userID == user.uid
        const qTasks = query(
          collection(db, 'tasks'),
          where('userID', '==', user.uid)
        );

        // subscribe เพื่อรับอัปเดต tasks แบบเรียลไทม์
        const unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
          const tasksData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTasks(tasksData);
        });

        // Query สำหรับ categories ที่ userID == user.uid
        const qCategories = query(
          collection(db, 'categories'),
          where('userID', '==', user.uid)
        );

        // subscribe เพื่อรับอัปเดต categories แบบเรียลไทม์
        const unsubscribeCategories = onSnapshot(qCategories, (snapshot) => {
          const categoriesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCategories(categoriesData);
        });

        return () => {
          if (unsubscribeTasks) unsubscribeTasks();
          if (unsubscribeCategories) unsubscribeCategories();
        };
      } else {
        // ถ้าไม่พบ user ล็อกอิน
      }
    });

    // ยกเลิกฟัง auth เมื่อคอมโพเนนต์ unmount
    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, []);

  /* 
    events: แปลง tasks เป็นรูปแบบที่ react-big-calendar ต้องการ
    โดยเฉพาะ start, end ซึ่งต้องเป็น Date 
    color: ใช้สีจากหมวดหมู่ถ้ามี
  */
  const events = tasks
    .filter((task) => task.dueDate instanceof Timestamp)
    .map((task) => {
      const category = categories.find((cat) => cat.id === task.categoryID);
      return {
        id: task.id,
        title: task.taskName,
        start: task.dueDate.toDate(),
        end: task.dueDate.toDate(),
        allDay: true,
        color: category ? category.color : '#3174ad',
      };
    });

  // ฟังก์ชันกำหนดรูปแบบ (style) ของแต่ละ event ในปฏิทิน
  const eventPropGetter = (event) => ({
    style: {
      backgroundColor: event.color,
    },
  });

  // เมื่อคลิกที่เหตุการณ์ (event) ในปฏิทิน
  const handleSelectEvent = (event) => {
    // หางานที่ตรงกับ event.id
    const task = tasks.find((t) => t.id === event.id);
    setSelectedEvent(task);
    setOpenDialog(true);
  };

  // เมื่อคลิกบนช่องว่าง (slot) ในปฏิทิน (เพื่อเพิ่มงานใหม่)
  const handleSelectSlot = (slotInfo) => {
    setNewTaskDate(slotInfo.start); // กำหนดวันที่เป็นวันที่ที่เลือก
    setNewTaskName('');             // รีเซ็ตชื่อ
    setNewTaskDescription('');      // รีเซ็ตรายละเอียด
    setSelectedEvent(null);         // ไม่มีงานที่เลือก (กำลังจะเพิ่มงานใหม่)
    setOpenDialog(true);
  };

  // ฟังก์ชันเพิ่มงานใหม่ลง Firestore
  const handleAddTask = async () => {
    const user = auth.currentUser;
    if (!user) return;

    await addDoc(collection(db, 'tasks'), {
      taskName: newTaskName,
      description: newTaskDescription,
      dueDate: Timestamp.fromDate(newTaskDate),
      createdAt: Timestamp.now(),
      userID: user.uid,
      completed: false,
    });

    setOpenDialog(false);
    setSnackbarOpen(true);
  };

  // ฟังก์ชันอัปเดตงาน (เมื่อต้องแก้ไขงาน)
  const handleUpdateTask = async () => {
    if (selectedEvent) {
      const taskRef = doc(db, 'tasks', selectedEvent.id);
      await updateDoc(taskRef, {
        taskName: selectedEvent.taskName,
        description: selectedEvent.description,
        completed: selectedEvent.completed,
      });
      setOpenDialog(false);
      setSnackbarOpen(true);
    }
  };

  // ฟังก์ชันลบงาน
  const handleDeleteTask = async () => {
    if (selectedEvent) {
      const taskRef = doc(db, 'tasks', selectedEvent.id);
      await deleteDoc(taskRef);
      setOpenDialog(false);
      setSnackbarOpen(true);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ marginTop: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        ปฏิทินงาน
      </Typography>
      {/* BigCalendar สำหรับแสดงปฏิทิน */}
      <BigCalendar
        localizer={localizer}            // ตัวจัดการวันที่ของ react-big-calendar
        events={events}                  // ส่งข้อมูลงานเข้าไป
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600, width: '100%' }}
        selectable                       // อนุญาตให้คลิกช่องว่างเพื่อเพิ่มงาน
        onSelectEvent={handleSelectEvent} 
        onSelectSlot={handleSelectSlot}
        eventPropGetter={eventPropGetter}
        // views และ defaultView = กำหนดรูปแบบการมองปฏิทิน (month, week, day)
        views={['month', 'week', 'day']}
        defaultView="month"
      />

      {/* Dialog สำหรับเพิ่มหรือแก้ไขงาน */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {/* ถ้ามี selectedEvent => แสดงฟอร์มแก้ไข */}
        {selectedEvent ? (
          <>
            <DialogTitle>แก้ไขงาน</DialogTitle>
            <DialogContent>
              <TextField
                label="ชื่อของงาน"
                fullWidth
                margin="normal"
                value={selectedEvent.taskName}
                onChange={(e) =>
                  setSelectedEvent({
                    ...selectedEvent,
                    taskName: e.target.value,
                  })
                }
              />
              <TextField
                label="รายละเอียด"
                fullWidth
                multiline
                rows={4}
                margin="normal"
                value={selectedEvent.description || ''}
                onChange={(e) =>
                  setSelectedEvent({
                    ...selectedEvent,
                    description: e.target.value,
                  })
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedEvent.completed}
                    onChange={(e) =>
                      setSelectedEvent({
                        ...selectedEvent,
                        completed: e.target.checked,
                      })
                    }
                  />
                }
                label="เสร็จสิ้น"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteTask} color="error">
                ลบงาน
              </Button>
              <Button onClick={() => setOpenDialog(false)}>ยกเลิก</Button>
              <Button onClick={handleUpdateTask} color="primary">
                บันทึก
              </Button>
            </DialogActions>
          </>
        ) : (
          // ถ้าไม่มี selectedEvent => แสดงฟอร์มเพิ่มงานใหม่
          <>
            <DialogTitle>
              เพิ่มงานใหม่ในวันที่ {dayjs(newTaskDate).format('DD/MM/YYYY')}
            </DialogTitle>
            <DialogContent>
              <TextField
                label="ชื่อของงาน"
                fullWidth
                margin="normal"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
              />
              <TextField
                label="รายละเอียด"
                fullWidth
                multiline
                rows={4}
                margin="normal"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
              />
              {/* ถ้าต้องการเพิ่มฟิลด์อื่น เช่น หมวดหมู่ ก็สามารถเพิ่มได้ที่นี่ */}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>ยกเลิก</Button>
              <Button onClick={handleAddTask} color="primary">
                เพิ่มงาน
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar สำหรับแสดงข้อความเมื่อทำงานเสร็จ (เพิ่ม, แก้ไข, ลบ) */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          การดำเนินการเสร็จสิ้น
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CalendarPage;
