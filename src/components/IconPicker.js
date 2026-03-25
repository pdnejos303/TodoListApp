/*
  IconPicker.js

  — TH (ภาษาไทย):
    คอมโพเนนต์ Dialog ที่ให้ผู้ใช้สามารถเลือกไอคอน (icon) จากรายการ iconsList ได้
    มีฟีเจอร์ Search (searchQuery) สำหรับค้นหาชื่อไอคอน
    และเมื่อเลือกแล้วจะส่ง callback onSelect(iconName) กลับไปยังผู้เรียกใช้งาน

  — EN (English):
    A Dialog component that allows the user to pick an icon from an iconsList.
    It includes a search (searchQuery) for filtering icon names, and upon selection, 
    it calls onSelect(iconName) to return the chosen icon to the parent.
*/

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  IconButton,
  Typography,
  TextField,
  InputAdornment,
} from '@mui/material';
import { iconsList } from './iconsList';
import SearchIcon from '@mui/icons-material/Search';

const IconPicker = ({ open, onClose, onSelect }) => {
  /* 
    searchQuery: สถานะข้อความสำหรับค้นหาไอคอน 
    setSearchQuery: ฟังก์ชันอัปเดต searchQuery
  */
  const [searchQuery, setSearchQuery] = React.useState('');

  // filter icons by searchQuery (toLowerCase)
  const filteredIcons = iconsList.filter((iconItem) =>
    iconItem.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    // Material-UI Dialog
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>เลือกไอคอน</DialogTitle>
      {/* DialogContent => มีช่องค้นหา และรายการไอคอน */}
      <DialogContent dividers style={{ maxHeight: '500px' }}>
        {/* ช่องค้นหาไอคอน */}
        <TextField
          placeholder="ค้นหาไอคอน"
          fullWidth
          margin="normal"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        {/* แสดง icons ใน Grid */}
        <Grid container spacing={2}>
          {filteredIcons.map((iconItem) => (
            <Grid
              item
              xs={3}
              sm={2}
              md={2}
              key={iconItem.name}
              style={{ textAlign: 'center' }}
            >
              {/* เมื่อคลิก IconButton => เรียก onSelect(iconName) */}
              <IconButton onClick={() => onSelect(iconItem.name)}>
                {React.createElement(iconItem.icon, { fontSize: 'large' })}
              </IconButton>
              {/* แสดงชื่อไอคอนใต้ Icon */}
              <Typography variant="caption">{iconItem.name}</Typography>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default IconPicker;
