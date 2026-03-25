/*
  TaskList.js

  — TH (ภาษาไทย):
    คอมโพเนนต์ TaskList นี้ใช้สำหรับแสดงรายการงาน (Tasks) ของผู้ใช้
    มีฟีเจอร์หลักดังนี้:
      - แสดงงานทั้งหมดที่ผู้ใช้สร้าง
      - แก้ไขและลบงาน
      - ติ๊กเพื่อทำเครื่องหมายว่างานเสร็จแล้ว
      - กรองงานตามสถานะ (ทั้งหมด, เสร็จแล้ว, ยังไม่เสร็จ), ความเร่งด่วน, และหมวดหมู่
      - แสดงงานที่กำลังใกล้ถึงกำหนด (Due Soon)
      - ใช้ Recharts สำหรับแสดงสถิติ
      - รองรับการทำ Responsive Design

  — EN (English):
    The TaskList component is used to display the user's list of tasks.
    Main features include:
      - Displaying all tasks created by the user
      - Editing and deleting tasks
      - Toggling task completion status
      - Filtering tasks by status (All, Completed, Incomplete), urgency, and category
      - Displaying tasks that are nearing their due dates (Due Soon)
      - Using Recharts to display statistics
      - Supporting responsive design
*/

import React, { useState, useEffect } from 'react';
// React Hooks: useState for state management, useEffect for side effects

// Firebase imports: db for Firestore, auth for authentication
import { db, auth } from '../firebase';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';

// Material-UI components for UI elements
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  useTheme,
  ButtonGroup,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Stack,
  CircularProgress,
  Autocomplete,
} from '@mui/material';

// Icons from Material-UI
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const TaskList = () => {
  // State variables
  const [tasks, setTasks] = useState([]); // เก็บรายการงานทั้งหมด
  const [editTask, setEditTask] = useState(null); // เก็บข้อมูลงานที่กำลังแก้ไข
  const [loading, setLoading] = useState(true); // สถานะการโหลดข้อมูล
  const [error, setError] = useState(null); // เก็บข้อความข้อผิดพลาด
  const theme = useTheme(); // ดึงธีมปัจจุบันจาก Material-UI
  const [dueSoonTasks, setDueSoonTasks] = useState([]); // งานที่ใกล้ถึงกำหนด
  const [statusFilter, setStatusFilter] = useState('all'); // ฟิลเตอร์สถานะงาน
  const [urgencyFilter, setUrgencyFilter] = useState('all'); // ฟิลเตอร์ความเร่งด่วน
  const [categories, setCategories] = useState([]); // เก็บหมวดหมู่ทั้งหมด
  const [categoryFilter, setCategoryFilter] = useState(null); // ฟิลเตอร์ตามหมวดหมู่

  useEffect(() => {
    // Subscribe การตรวจสอบสถานะผู้ใช้
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // สร้าง Query เพื่อดึงงานของผู้ใช้
        const q = query(
          collection(db, 'tasks'),
          where('userID', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        // Subscribe เพื่อดึงข้อมูลงานแบบเรียลไทม์
        const unsubscribeTasks = onSnapshot(
          q,
          (snapshot) => {
            // Map ข้อมูลจาก snapshot ไปเป็น array ของงาน
            const tasksData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setTasks(tasksData); // ตั้งค่าข้อมูลงานใน state

            const now = dayjs(); // เวลาปัจจุบัน
            // กรองงานที่ใกล้ถึงกำหนดภายใน 3 วัน
            const dueSoon = tasksData.filter((task) => {
              if (task.dueDate instanceof Timestamp) {
                const dueDate = dayjs(task.dueDate.toDate());
                return dueDate.isBefore(now.add(3, 'day')) && dueDate.isAfter(now);
              }
              return false;
            });
            setDueSoonTasks(dueSoon); // ตั้งค่างานที่ใกล้ถึงกำหนด
            setLoading(false); // เปลี่ยนสถานะการโหลดข้อมูล
          },
          (err) => {
            console.error("Error fetching tasks:", err);
            setError(`Failed to fetch tasks: ${err.message}`); // ตั้งค่าข้อความข้อผิดพลาด
            setLoading(false); // เปลี่ยนสถานะการโหลดข้อมูล
          }
        );

        // สร้าง Query เพื่อดึงหมวดหมู่ของผู้ใช้
        const qCategories = query(
          collection(db, 'categories'),
          where('userID', '==', user.uid)
        );

        // Subscribe เพื่อดึงข้อมูลหมวดหมู่แบบเรียลไทม์
        const unsubscribeCategories = onSnapshot(qCategories, (snapshot) => {
          const categoriesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCategories(categoriesData); // ตั้งค่าข้อมูลหมวดหมู่ใน state
        });

        // ล้างการ Subscribe เมื่อคอมโพเนนต์ถูก unmount
        return () => {
          if (unsubscribeTasks) unsubscribeTasks();
          if (unsubscribeCategories) unsubscribeCategories();
        };
      } else {
        // หากไม่มีผู้ใช้ล็อกอินอยู่
        setError("User not logged in");
        setLoading(false);
      }
    });

    // ล้างการ Subscribe เมื่อคอมโพเนนต์ถูก unmount
    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, []);

  // ฟังก์ชันค้นหาหมวดหมู่ตาม ID
  const getCategory = (categoryID) => {
    return categories.find((category) => category.id === categoryID);
  };

  // กรองงานตามฟิลเตอร์ที่ผู้ใช้เลือก
  const filteredTasks = tasks
    .filter((task) => {
      if (statusFilter === 'completed' && !task.completed) return false;
      if (statusFilter === 'incomplete' && task.completed) return false;
      if (urgencyFilter !== 'all' && task.urgency !== parseInt(urgencyFilter)) return false;
      if (categoryFilter && task.categoryID !== categoryFilter) return false;

      return true;
    })
    .sort((a, b) => b.urgency - a.urgency); // เรียงงานตามความเร่งด่วน

  // ฟังก์ชันสำหรับอัปเดตงาน
  const updateTask = async (taskId, updatedData) => {
    try {
      const taskDoc = doc(db, 'tasks', taskId);
      await updateDoc(taskDoc, updatedData);
    } catch (error) {
      console.error('Error updating document: ', error);
      alert('Failed to update task. The task may not exist.');
    }
  };

  // ฟังก์ชันสำหรับลบงาน
  const deleteTask = async (taskId) => {
    try {
      const taskDoc = doc(db, 'tasks', taskId);
      await deleteDoc(taskDoc);
    } catch (error) {
      console.error('Error deleting document: ', error);
      alert('Failed to delete task. The task may not exist.');
    }
  };

  // ฟังก์ชันสำหรับติ๊กสถานะการเสร็จสิ้นของงาน
  const handleCompleteToggle = (task) => {
    updateTask(task.id, { completed: !task.completed });
  };

  // ฟังก์ชันสำหรับเปิด Dialog แก้ไขงาน
  const handleEditTask = (task) => {
    setEditTask(task);
  };

  // ฟังก์ชันสำหรับบันทึกการแก้ไขงาน
  const handleSaveEdit = () => {
    if (editTask) {
      const updatedData = {
        taskName: editTask.taskName,
        description: editTask.description,
        urgency: editTask.urgency,
        categoryID: editTask.categoryID,
      };

      // ตรวจสอบและแปลงวันที่ครบกำหนด
      if (editTask.dueDate) {
        try {
          const parsedDate = dayjs(editTask.dueDate);
          if (parsedDate.isValid()) {
            updatedData.dueDate = Timestamp.fromDate(parsedDate.toDate());
          } else {
            updatedData.dueDate = null;
          }
        } catch (error) {
          updatedData.dueDate = null;
        }
      } else {
        updatedData.dueDate = null;
      }

      updateTask(editTask.id, updatedData);
      setEditTask(null); // ปิด Dialog แก้ไข
    }
  };

  // ฟังก์ชันกำหนดสีของความเร่งด่วน
  const getUrgencyColor = (urgencyLevel, index) => {
    if (index < urgencyLevel) {
      switch (urgencyLevel) {
        case 1:
          return '#4CAF50'; // Green สำหรับความเร่งด่วนต่ำ
        case 2:
          return '#FF9800'; // Orange สำหรับความเร่งด่วนปานกลาง
        case 3:
          return '#F44336'; // Red สำหรับความเร่งด่วนสูง
        default:
          return '#E0E0E0'; // Gray สำหรับค่าอื่น ๆ
      }
    } else {
      return '#E0E0E0'; // Gray สำหรับช่องที่ไม่มีความเร่งด่วน
    }
  };

  // ถ้ายังโหลดข้อมูลอยู่ จะแสดง Loading Spinner
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ marginTop: 4 }}>
        <CircularProgress />
        <Typography align="center" sx={{ marginTop: 2 }}>
          Loading tasks...
        </Typography>
      </Container>
    );
  }

  // ถ้ามีข้อผิดพลาด จะแสดงข้อความข้อผิดพลาด
  if (error) {
    return (
      <Container maxWidth="md" sx={{ marginTop: 4 }}>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ marginTop: 4, marginBottom: 8 }}>
      {/* หัวเรื่องของหน้ารายการงาน */}
      <Typography variant="h4" align="center" gutterBottom sx={{ color: theme.palette.text.primary }}>
        Task List
      </Typography>

      {/* แสดงงานที่ใกล้ถึงกำหนด */}
      {dueSoonTasks.length > 0 && (
        <Box sx={{ marginBottom: 4 }}>
          <Typography variant="h6" sx={{ color: theme.palette.warning.main }}>
            Upcoming Deadlines
          </Typography>
          <Stack spacing={2}>
            {dueSoonTasks.map((task) => {
              const daysLeft =
                task.dueDate instanceof Timestamp
                  ? dayjs(task.dueDate.toDate()).diff(dayjs(), 'day')
                  : 'N/A';
              return (
                <Alert
                  key={task.id}
                  severity="warning"
                  icon={<AccessTimeIcon />}
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                    Task: "<strong>{task.taskName}</strong>" is due in{' '}
                    <strong>
                      {daysLeft} day{daysLeft > 1 ? 's' : ''}
                    </strong>{' '}
                    on{' '}
                    {task.dueDate instanceof Timestamp
                      ? task.dueDate.toDate().toLocaleDateString()
                      : 'No Due Date'}
                    .
                  </Typography>
                </Alert>
              );
            })}
          </Stack>
        </Box>
      )}

      {/* ฟิลเตอร์สำหรับงาน */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 2 }}>
        {/* ฟิลเตอร์สถานะงาน */}
        <ButtonGroup variant="outlined">
          <Button
            onClick={() => setStatusFilter('all')}
            variant={statusFilter === 'all' ? 'contained' : 'outlined'}
          >
            All
          </Button>
          <Button
            onClick={() => setStatusFilter('completed')}
            variant={statusFilter === 'completed' ? 'contained' : 'outlined'}
          >
            Completed
          </Button>
          <Button
            onClick={() => setStatusFilter('incomplete')}
            variant={statusFilter === 'incomplete' ? 'contained' : 'outlined'}
          >
            Incomplete
          </Button>
        </ButtonGroup>

        {/* ฟิลเตอร์ความเร่งด่วน */}
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel>Urgency</InputLabel>
          <Select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            label="Urgency"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="3">High</MenuItem>
            <MenuItem value="2">Medium</MenuItem>
            <MenuItem value="1">Low</MenuItem>
          </Select>
        </FormControl>

        {/* ฟิลเตอร์หมวดหมู่ */}
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <Autocomplete
            options={categories}
            getOptionLabel={(option) => option.name}
            value={categoryFilter ? getCategory(categoryFilter) : null}
            onChange={(event, newValue) => {
              setCategoryFilter(newValue ? newValue.id : null);
            }}
            renderInput={(params) => <TextField {...params} label="Category" variant="outlined" />}
            sx={{ width: 200 }}
          />
        </FormControl>
      </Box>

      {/* แสดงรายการงาน */}
      <Grid container spacing={2}>
        {filteredTasks.length === 0 ? (
          <Typography align="center" color="textSecondary" sx={{ width: '100%' }}>
            No tasks available.
          </Typography>
        ) : (
          filteredTasks.map((task) => {
            const category = getCategory(task.categoryID);
            return (
              <Grid item xs={12} sm={6} md={4} key={task.id}>
                {/* Card สำหรับแต่ละงาน */}
                <Card
                  sx={{
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    boxShadow:
                      theme.palette.mode === 'dark'
                        ? '0px 4px 10px rgba(0, 0, 0, 0.5)'
                        : '0px 4px 10px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <CardContent>
                    {/* ชื่อของงานและ Checkbox ติ๊กเสร็จ */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography
                        variant="h6"
                        sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}
                      >
                        {task.taskName || 'Untitled Task'}
                      </Typography>
                      <Checkbox
                        checked={task.completed || false}
                        onChange={() => handleCompleteToggle(task)}
                        color="primary"
                      />
                    </Box>
                    {/* รายละเอียดงาน */}
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      {task.description || 'No description'}
                    </Typography>
                    {/* วันที่ครบกำหนดและหมวดหมู่ */}
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Due Date:{' '}
                      {task.dueDate instanceof Timestamp
                        ? task.dueDate.toDate().toLocaleDateString()
                        : 'No Due Date'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      หมวดหมู่: {category ? category.name : 'ไม่มีหมวดหมู่'}
                    </Typography>

                    {/* ความเร่งด่วนแสดงเป็นบาร์ */}
                    <Box sx={{ display: 'flex', gap: 1, marginTop: 2 }}>
                      {[0, 1, 2].map((index) => (
                        <Box
                          key={index}
                          sx={{
                            width: '30%',
                            height: 6,
                            backgroundColor: getUrgencyColor(task.urgency || 1, index),
                            borderRadius: 1,
                          }}
                        />
                      ))}
                    </Box>

                    {/* ปุ่มแก้ไขและลบงาน */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 1 }}>
                      <IconButton onClick={() => handleEditTask(task)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => deleteTask(task.id)} color="secondary">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>

      {/* Dialog สำหรับแก้ไขงาน */}
      <Dialog open={!!editTask} onClose={() => setEditTask(null)}>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          {/* ฟิลด์สำหรับแก้ไขชื่องาน */}
          <TextField
            label="Task Name"
            fullWidth
            margin="normal"
            value={editTask ? editTask.taskName : ''}
            onChange={(e) => setEditTask({ ...editTask, taskName: e.target.value })}
          />
          {/* ฟิลด์สำหรับแก้ไขรายละเอียดงาน */}
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            margin="normal"
            value={editTask ? editTask.description : ''}
            onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
          />
          {/* ฟิลด์สำหรับแก้ไขวันที่ครบกำหนด */}
          <TextField
            label="Due Date"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={
              editTask && editTask.dueDate
                ? dayjs(
                    editTask.dueDate instanceof Timestamp
                      ? editTask.dueDate.toDate()
                      : editTask.dueDate
                  ).format('YYYY-MM-DD')
                : ''
            }
            onChange={(e) => setEditTask({ ...editTask, dueDate: e.target.value })}
          />

          {/* ฟิลด์สำหรับเลือกหมวดหมู่ */}
          <FormControl fullWidth margin="normal">
            <InputLabel>หมวดหมู่</InputLabel>
            <Select
              value={editTask ? editTask.categoryID || '' : ''}
              onChange={(e) => setEditTask({ ...editTask, categoryID: e.target.value })}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* ฟิลด์สำหรับเลือกความเร่งด่วน */}
          <Typography variant="body1" sx={{ marginTop: 2 }}>
            Urgency
          </Typography>
          <ButtonGroup fullWidth variant="outlined" sx={{ marginTop: 1 }}>
            <Button
              color="success"
              variant={editTask && editTask.urgency === 1 ? 'contained' : 'outlined'}
              onClick={() => setEditTask({ ...editTask, urgency: 1 })}
            >
              Low
            </Button>
            <Button
              color="warning"
              variant={editTask && editTask.urgency === 2 ? 'contained' : 'outlined'}
              onClick={() => setEditTask({ ...editTask, urgency: 2 })}
            >
              Medium
            </Button>
            <Button
              color="error"
              variant={editTask && editTask.urgency === 3 ? 'contained' : 'outlined'}
              onClick={() => setEditTask({ ...editTask, urgency: 3 })}
            >
              High
            </Button>
          </ButtonGroup>
        </DialogContent>
        <DialogActions>
          {/* ปุ่มยกเลิกการแก้ไข */}
          <Button onClick={() => setEditTask(null)} color="primary">
            Cancel
          </Button>
          {/* ปุ่มบันทึกการแก้ไข */}
          <Button onClick={handleSaveEdit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TaskList;
