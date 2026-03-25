/*
  Dashboard.js
  
  — TH (ภาษาไทย):
    ไฟล์นี้เป็นคอมโพเนนต์ (Component) ที่แสดงส่วนหลัก (Dashboard) ของแอปพลิเคชัน
    โดยจะแสดงแท็บ (Tabs) 4 ส่วนคือ:
      1. Tasks (TaskList)
      2. Categories (CategoriesPage)
      3. Calendar (CalendarPage)
      4. Progress (ProgressPage)
    พร้อมทั้งมีปุ่ม "AddTaskTrigger" เพื่อเปิด Dialog สำหรับเพิ่มงาน (Task) ใหม่
    และรองรับการทำ Responsive (หน้าจอเล็ก, ใหญ่) ผ่านการใช้ useTheme + useMediaQuery

  — EN (English):
    This file is a component that displays the main dashboard of the application,
    containing 4 tabs:
      1. Tasks (TaskList)
      2. Categories (CategoriesPage)
      3. Calendar (CalendarPage)
      4. Progress (ProgressPage)
    It also shows an "AddTaskTrigger" button to open a dialog for adding new tasks,
    and supports responsiveness (small vs large screens) via useTheme and useMediaQuery.
*/

import React, { useState } from 'react';
// React Hook: useState => For managing local state (activeTab)
import { Box, Container, Typography, Tabs, Tab } from '@mui/material';

// import other components to be displayed within tabs
import TaskList from './TaskList';
import AddTaskTrigger from './AddTaskTrigger';
import CalendarPage from './CalendarPage';
import CategoriesPage from './CategoriesPage';
import ProgressPage from './ProgressPage';

// useTheme, useMediaQuery => Material-UI Hooks for responsive design and theming
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const Dashboard = () => {
  /*
    activeTab: integer state representing the currently selected tab
    setActiveTab: function to update activeTab
    Default = 0 => เปิดแท็บแรก (Tasks)
  */
  const [activeTab, setActiveTab] = useState(0);

  // handleTabChange => when user clicks a tab, update activeTab with newValue
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // retrieve current theme
  const theme = useTheme();
  // check if the screen is small
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container maxWidth="lg" sx={{ marginTop: 4 }}>
      {/* Heading or title of the dashboard */}
      <Typography variant="h4" align="center" gutterBottom>
        
      </Typography>

      {/* Section for the AddTaskTrigger button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 4,
        }}
      >
        {/* AddTaskTrigger => a card that opens a dialog to add new tasks */}
        <AddTaskTrigger />
      </Box>

      {/* Tabs for switching between different sections (Tasks, Categories, Calendar, Progress) */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered={!isSmallScreen}   // if it's not a small screen, center the tabs
          variant={isSmallScreen ? 'scrollable' : 'standard'}
          scrollButtons="auto"
        >
          <Tab label="Tasks" />
          <Tab label="Categories" />
          <Tab label="Calendar" />
          <Tab label="Progress" />
        </Tabs>
      </Box>

      {/* Content Sections => depending on activeTab */}
      <Box>
        {activeTab === 0 && (
          <Box>
         
            <TaskList />
          </Box>
        )}
        {activeTab === 1 && (
          <Box>
           
            <CategoriesPage />
          </Box>
        )}
        {activeTab === 2 && (
          <Box>
          
            <CalendarPage />
          </Box>
        )}
        {activeTab === 3 && (
          <Box>
          
            <ProgressPage />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard;
