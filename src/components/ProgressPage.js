/*
  ProgressPage.js

  — TH (ภาษาไทย):
    หน้านี้ใช้สำหรับแสดงสถิติต่าง ๆ เกี่ยวกับงาน (Tasks) ที่ผู้ใช้สร้าง เช่น:
    - จำนวนงานที่เสร็จแล้ว / ยังไม่เสร็จ
    - อัตราการเสร็จงาน (completion rate)
    - กราฟแสดงข้อมูล (BarChart, PieChart, LineChart)
    - สามารถกรองได้ตามหมวดหมู่ (categoryFilter), ช่วงเวลา (timeFrame: day/week/month) หรือกำหนดวันที่เอง (dateRange)
    ข้อมูลทั้งหมดดึงจาก Firestore (Backend Database)

  — EN (English):
    This page shows various statistics about tasks, such as:
    - Number of completed vs incomplete tasks
    - Completion rate
    - Charts (BarChart, PieChart, LineChart) for visualization
    - Filters by category (categoryFilter), time frame (day/week/month), and custom date range (dateRange)
    All data is fetched from Firestore (Backend Database).
*/

import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import {
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
  Paper,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';

// Recharts components for data visualization
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import dayjs from 'dayjs';
// DateRangePicker (from rsuite) for selecting a date range
import { DateRangePicker } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';

const ProgressPage = () => {
  /*
    State variables:
    - tasks: รายการงานทั้งหมด (หลังผ่านการกรอง)
    - timeFrame: ช่วงเวลาที่ผู้ใช้เลือก (day, week, month)
    - chartData: ข้อมูลที่จะใช้ในกราฟ Recharts
    - categories: เก็บหมวดหมู่ (สำหรับกรอง category)
    - categoryFilter: เก็บหมวดหมู่ที่กำลังกรอง
    - summaryStats: เก็บค่าทางสถิติต่าง ๆ (completed, incomplete, completionRate)
    - dateRange: เก็บช่วงวันที่ (start, end) จาก DateRangePicker
  */
  const [tasks, setTasks] = useState([]);
  const [timeFrame, setTimeFrame] = useState('week');
  const [chartData, setChartData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [summaryStats, setSummaryStats] = useState({
    totalCompleted: 0,
    totalIncomplete: 0,
    completionRate: 0,
  });
  const [dateRange, setDateRange] = useState([null, null]);

  // ใช้ธีม + ตรวจสอบว่าหน้าจอเล็กหรือไม่ (isMobile)
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  /*
    useEffect #1: ดึงข้อมูล tasks, categories จาก Firestore 
    - subscribe onSnapshot => อัปเดตเรียลไทม์
    - Filter ด้วย categoryFilter + dateRange
  */
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // ดึง tasks ของ user
        const qTasks = query(
          collection(db, 'tasks'),
          where('userID', '==', user.uid)
        );

        // subscribe tasks
        const unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
          let tasksData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Filter ตาม categoryFilter
          if (categoryFilter !== 'all') {
            tasksData = tasksData.filter(
              (task) => task.categoryID === categoryFilter
            );
          }

          // Filter ตามช่วงวันที่ (dateRange)
          if (dateRange[0] && dateRange[1]) {
            tasksData = tasksData.filter((task) => {
              if (task.createdAt instanceof Timestamp) {
                const taskDate = dayjs(task.createdAt.toDate());
                return (
                  taskDate.isAfter(dayjs(dateRange[0]).subtract(1, 'day')) &&
                  taskDate.isBefore(dayjs(dateRange[1]).add(1, 'day'))
                );
              }
              return false;
            });
          }

          setTasks(tasksData);

          // คำนวณค่าทางสถิติ
          const totalCompleted = tasksData.filter((task) => task.completed).length;
          const totalIncomplete = tasksData.filter((task) => !task.completed).length;
          const completionRate =
            tasksData.length > 0
              ? ((totalCompleted / tasksData.length) * 100).toFixed(2)
              : 0;

          setSummaryStats({
            totalCompleted,
            totalIncomplete,
            completionRate,
          });
        });

        // ดึงข้อมูล categories
        const qCategories = query(
          collection(db, 'categories'),
          where('userID', '==', user.uid)
        );

        // subscribe categories
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
      }
    });

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, [categoryFilter, dateRange]);

  /*
    useEffect #2: สร้าง chartData ตาม timeFrame (day, week, month)
    - เริ่มจากวันที่ปัจจุบัน แล้วย้อนกลับตามจำนวนที่ต้องการ
    - day => 7 วัน, week => 5 สัปดาห์ (?), month => 12 เดือน
    - สร้าง array data => push { date, Completed, Incomplete, ... }
  */
  useEffect(() => {
    const now = dayjs();
    let startDate;
    let format;

    if (timeFrame === 'day') {
      // ย้อน 6 วัน (รวมวันนี้ = 7 days)
      startDate = now.startOf('day').subtract(6, 'day');
      format = 'DD/MM';
    } else if (timeFrame === 'week') {
      // ย้อน 4 สัปดาห์ (รวมสัปดาห์นี้ = 5 weeks)
      startDate = now.startOf('week').subtract(4, 'week');
      format = 'DD/MM';
    } else if (timeFrame === 'month') {
      // ย้อน 11 เดือน (รวมเดือนนี้ = 12 months)
      startDate = now.startOf('month').subtract(11, 'month');
      format = 'MM/YYYY';
    }

    const data = [];
    // จำนวนครั้งที่ต้องสร้าง data => 7 (day), 5 (week), 12 (month)
    for (let i = 0; i < (timeFrame === 'month' ? 12 : 7); i++) {
      let date;
      if (timeFrame === 'day') {
        date = startDate.add(i, 'day');
      } else if (timeFrame === 'week') {
        date = startDate.add(i, 'week');
      } else if (timeFrame === 'month') {
        date = startDate.add(i, 'month');
      }

      const label = date.format(format);

      // filter tasksInTimeFrame
      const tasksInTimeFrame = tasks.filter((task) => {
        if (task.createdAt instanceof Timestamp) {
          const taskDate = dayjs(task.createdAt.toDate());
          if (timeFrame === 'day') {
            return taskDate.isSame(date, 'day');
          } else if (timeFrame === 'week') {
            return taskDate.isSame(date, 'week');
          } else if (timeFrame === 'month') {
            return taskDate.isSame(date, 'month');
          }
        }
        return false;
      });

      const completedTasks = tasksInTimeFrame.filter((task) => task.completed).length;
      const incompleteTasks = tasksInTimeFrame.filter((task) => !task.completed).length;

      data.push({
        date: label,
        Completed: completedTasks,
        Incomplete: incompleteTasks,
        TotalTasks: completedTasks + incompleteTasks,
        // สะสม (Cumulative)
        CumulativeCompleted:
          (data[i - 1]?.CumulativeCompleted || 0) + completedTasks,
      });
    }

    setChartData(data);
  }, [tasks, timeFrame]);

  // handleTimeFrameChange => เมื่อผู้ใช้เปลี่ยน dropdown ช่วงเวลา (day, week, month)
  const handleTimeFrameChange = (event) => {
    setTimeFrame(event.target.value);
  };

  // handleCategoryChange => เมื่อผู้ใช้เปลี่ยนหมวดหมู่
  const handleCategoryChange = (event) => {
    setCategoryFilter(event.target.value);
  };

  return (
    <Container maxWidth="lg" sx={{ marginTop: 4 }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ marginBottom: 4 }}
      >
        ความคืบหน้าการทำงาน
      </Typography>

      {/* ส่วนของตัวกรองด้านบน: เลือกช่วงเวลา, เลือกหมวดหมู่, DateRange */}
      <Grid container spacing={2} sx={{ marginBottom: 4 }}>
        {/* เลือกช่วงเวลา: 'day', 'week', 'month' */}
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>เลือกช่วงเวลา</InputLabel>
            <Select
              value={timeFrame}
              label="เลือกช่วงเวลา"
              onChange={handleTimeFrameChange}
            >
              <MenuItem value="day">รายวัน</MenuItem>
              <MenuItem value="week">รายสัปดาห์</MenuItem>
              <MenuItem value="month">รายเดือน</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* เลือกหมวดหมู่ */}
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>เลือกหมวดหมู่</InputLabel>
            <Select
              value={categoryFilter}
              label="เลือกหมวดหมู่"
              onChange={handleCategoryChange}
            >
              <MenuItem value="all">ทั้งหมด</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* DateRangePicker สำหรับกำหนดช่วงวันที่เอง */}
        <Grid item xs={12} sm={4}>
          <DateRangePicker
            appearance="default"
            placeholder="เลือกช่วงวันที่"
            value={dateRange}
            onChange={(range) => setDateRange(range)}
            style={{ width: '100%' }}
            format="dd/MM/yyyy"
          />
        </Grid>
      </Grid>

      {/* แสดงสถิติสรุป (จำนวนงานที่เสร็จแล้ว, ที่ยังไม่เสร็จ, อัตราส่วน) */}
      <Grid container spacing={2} sx={{ marginBottom: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              padding: 2,
              textAlign: 'center',
              backgroundColor: '#e0f7fa',
            }}
          >
            <Typography variant="h6">งานที่เสร็จแล้ว</Typography>
            <Typography variant="h4">{summaryStats.totalCompleted}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              padding: 2,
              textAlign: 'center',
              backgroundColor: '#fff3e0',
            }}
          >
            <Typography variant="h6">งานที่ยังไม่เสร็จ</Typography>
            <Typography variant="h4">{summaryStats.totalIncomplete}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              padding: 2,
              textAlign: 'center',
              backgroundColor: '#e8f5e9',
            }}
          >
            <Typography variant="h6">อัตราการเสร็จงาน (%)</Typography>
            <Typography variant="h4">
              {summaryStats.completionRate}%
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* BarChart: แสดงจำนวนงานที่เสร็จและยังไม่เสร็จในแต่ละช่วง */}
      <Typography variant="h6" gutterBottom>
        กราฟแสดงจำนวนงานที่เสร็จและยังไม่เสร็จ
      </Typography>
      <BarChart
        width={isMobile ? 350 : 700}
        height={400}
        data={chartData}
        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        {/* Stack Bar => Completed / Incomplete */}
        <Bar dataKey="Completed" stackId="a" fill="#82ca9d" />
        <Bar dataKey="Incomplete" stackId="a" fill="#8884d8" />
      </BarChart>

      {/* PieChart: แสดงสัดส่วนงานในแต่ละหมวดหมู่ */}
      <Typography variant="h6" gutterBottom sx={{ marginTop: 4 }}>
        สัดส่วนของงานในแต่ละหมวดหมู่
      </Typography>
      <PieChart width={isMobile ? 350 : 700} height={400}>
        <Pie
          data={categories.map((category) => {
            const tasksInCategory = tasks.filter(
              (task) => task.categoryID === category.id
            ).length;
            return {
              name: category.name,
              value: tasksInCategory,
              color: category.color || '#8884d8',
            };
          })}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={150}
          label
        >
          {categories.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>

      {/* LineChart: แสดงแนวโน้ม (Cumulative Completed) */}
      <Typography variant="h6" gutterBottom sx={{ marginTop: 4 }}>
        กราฟแสดงแนวโน้มงานที่เสร็จสมบูรณ์
      </Typography>
      <LineChart
        width={isMobile ? 350 : 700}
        height={400}
        data={chartData}
        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="CumulativeCompleted"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </Container>
  );
};

export default ProgressPage;
