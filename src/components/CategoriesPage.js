/*
  CategoriesPage.js

  — TH (ภาษาไทย):
    หน้านี้ใช้สำหรับจัดการหมวดหมู่ (Categories) ของงานในแอป:
    - แสดงรายการหมวดหมู่ทั้งหมดที่มี
    - ค้นหา (searchQuery)
    - เพิ่ม/แก้ไข/ลบหมวดหมู่
    - ใช้ Drag & Drop (react-beautiful-dnd) เพื่อเรียงลำดับหมวดหมู่
    - ข้อมูลหมวดหมู่เก็บใน Firestore (Backend Database)
    - ใช้ state editMode เพื่อแยกระหว่างโหมด “เพิ่มใหม่” หรือ “แก้ไข” ภายใน Dialog ตัวเดียว

  — EN (English):
    This page is for managing task categories in the app:
    - Displays all categories
    - Allows search (searchQuery)
    - Add/Edit/Delete categories
    - Uses Drag & Drop (react-beautiful-dnd) for reordering
    - Category data is stored in Firestore as the backend database
    - Uses editMode state to differentiate between “Add” and “Edit” modes within a single Dialog.
*/

import React, { useState, useEffect } from 'react';
// React Hooks: useState (manage state), useEffect (side-effects / data fetching)

import { db, auth } from '../firebase'; 
// db => Firestore database reference, auth => Firebase authentication reference

import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';

import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Avatar,
  DialogContentText,
  ListItemIcon,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from '@mui/material';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SearchIcon from '@mui/icons-material/Search';

// Color picker and icon picker
import { SketchPicker } from 'react-color'; 
import { iconsList } from './iconsList'; 
import IconPicker from './IconPicker'; 

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const CategoriesPage = () => {
  /*
    useState Hooks (Local State):
    1) categories: เก็บรายการหมวดหมู่ทั้งหมด (Array of category objects)
    2) openDialog: เปิด/ปิด Dialog สำหรับ เพิ่ม/แก้ไข หมวดหมู่
    3) categoryData: ข้อมูลหมวดหมู่ที่กำลังแก้ไขหรือเพิ่ม (name, color, icon)
    4) editMode: true = อยู่ในโหมดแก้ไข, false = อยู่ในโหมดเพิ่มใหม่
    5) currentCategoryId: ID ของหมวดหมู่ที่กำลังแก้ไข
    6) colorPickerVisible: เปิด/ปิดตัวเลือกสี (SketchPicker)
    7) iconPickerVisible: เปิด/ปิดตัวเลือกไอคอน (IconPicker)
    8) searchQuery: ข้อความค้นหาหมวดหมู่
    9) confirmDeleteDialogOpen: เปิด/ปิด Dialog ยืนยันการลบ
    10) categoryToDelete: เก็บหมวดหมู่ที่ต้องการลบ
  */
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [categoryData, setCategoryData] = useState({
    name: '',
    color: '#000000',
    icon: '',
  });
  const [editMode, setEditMode] = useState(false); // *คำตอบ: ใช้สลับโหมด "Add" / "Edit"
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [iconPickerVisible, setIconPickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // ใช้ธีม (useTheme) และตรวจสอบขนาดหน้าจอ (useMediaQuery) สำหรับการทำ Responsive
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // useEffect: ดึงข้อมูลหมวดหมู่จาก Firestore (Backend Database) เมื่อ component mount
  useEffect(() => {
    // ฟังการเปลี่ยนแปลงสถานะการล็อกอินของผู้ใช้
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // query สำหรับดึง categories ของ user คนนี้
        const q = query(
          collection(db, 'categories'),
          where('userID', '==', user.uid)
        );

        // subscribe เพื่อรับการอัปเดตแบบเรียลไทม์ของคอลเลกชัน categories
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const categoriesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCategories(categoriesData);
        });

        return () => unsubscribe(); // ยกเลิกการ sub เมื่อ component unmount
      }
    });

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, []);

  // ฟังก์ชันเปิด Dialog แบบ "เพิ่มหมวดหมู่ใหม่" => ตั้ง editMode = false
  const handleOpenDialog = () => {
    setEditMode(false); // กำลังอยู่ในโหมด "Add"
    setCategoryData({ name: '', color: '#000000', icon: '' }); // รีเซ็ตข้อมูลฟอร์ม
    setOpenDialog(true); // เปิด Dialog
  };

  // ฟังก์ชันปิด Dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // ฟังก์ชันบันทึกหมวดหมู่ (ทั้งกรณี Add / Edit)
  const handleSaveCategory = async () => {
    const user = auth.currentUser;
    if (!user) return; // ถ้ายังไม่ล็อกอิน ให้ return

    if (editMode) {
      // ถ้าอยู่ในโหมดแก้ไข => อัปเดตเอกสารใน Firestore
      const categoryRef = doc(db, 'categories', currentCategoryId);
      await updateDoc(categoryRef, {
        ...categoryData,
      });
    } else {
      // ถ้าอยู่ในโหมดเพิ่มใหม่ => เพิ่มเอกสารใหม่ใน Firestore
      await addDoc(collection(db, 'categories'), {
        ...categoryData,
        userID: user.uid,
      });
    }

    setOpenDialog(false); // ปิด Dialog หลังบันทึก
  };

  // ฟังก์ชันแก้ไขหมวดหมู่ => ตั้ง editMode = true และโหลดข้อมูล category เข้า categoryData
  const handleEditCategory = (category) => {
    setEditMode(true); // โหมดแก้ไข
    setCurrentCategoryId(category.id); // เก็บ ID หมวดหมู่เพื่อ update
    setCategoryData({
      name: category.name,
      color: category.color || '#000000',
      icon: category.icon || '',
    });
    setOpenDialog(true);
  };

  // ฟังก์ชันลบหมวดหมู่ => เปิด Dialog ยืนยันการลบ
  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setConfirmDeleteDialogOpen(true);
  };

  // ยืนยันการลบหมวดหมู่ => ลบ doc ใน Firestore
  const confirmDeleteCategory = async () => {
    await deleteDoc(doc(db, 'categories', categoryToDelete.id));
    setConfirmDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  // ยกเลิกการลบหมวดหมู่
  const cancelDeleteCategory = () => {
    setConfirmDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  // ฟังก์ชันสำหรับการลากและวาง (Drag & Drop)
  const onDragEnd = (result) => {
    if (!result.destination) return; 
    // result.source => index เริ่ม
    // result.destination => index ปลายทาง

    const reorderedCategories = Array.from(categories);
    const [movedCategory] = reorderedCategories.splice(result.source.index, 1);
    reorderedCategories.splice(result.destination.index, 0, movedCategory);

    // ถ้าต้องการเซฟลำดับใหม่ลงใน Firestore ก็ทำได้ที่นี่
    setCategories(reorderedCategories);
  };

  // กรองหมวดหมู่ตาม searchQuery (ชื่อหมวดหมู่)
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="sm" sx={{ marginTop: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        หมวดหมู่ของฉัน
      </Typography>

      {/* ช่องค้นหา (Search Bar) */}
      <TextField
        placeholder="ค้นหาหมวดหมู่"
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

      {/* ปุ่มเพิ่มหมวดหมู่ใหม่ => handleOpenDialog (editMode = false) */}
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleOpenDialog}
        sx={{ marginBottom: 2 }}
      >
        เพิ่มหมวดหมู่ใหม่
      </Button>

      {/*
        DragDropContext: จัดการเลย์เอาต์การลากและวาง
        onDragEnd: จะถูกเรียกเมื่อผู้ใช้ปล่อย item
      */}
      <DragDropContext onDragEnd={onDragEnd}>
        {/* บริเวณ Droppable => categories */}
        <Droppable droppableId="categories">
          {(provided) => (
            <List {...provided.droppableProps} ref={provided.innerRef}>
              {filteredCategories.map((category, index) => (
                // Draggable => แสดงว่า item ไหนสามารถลากได้
                <Draggable
                  key={category.id}
                  draggableId={category.id}
                  index={index}
                >
                  {(provided) => (
                    <ListItem
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      secondaryAction={
                        <>
                          <IconButton
                            edge="end"
                            onClick={() => handleEditCategory(category)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteCategory(category)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      }
                    >
                      {/* ListItemIcon => ไอคอนลาก (dragHandleProps) */}
                      <ListItemIcon {...provided.dragHandleProps}>
                        <Avatar sx={{ backgroundColor: category.color }}>
                          {React.createElement(
                            iconsList.find(
                              (icon) => icon.name === category.icon
                            )?.icon || EditIcon
                          )}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText primary={category.name} />
                    </ListItem>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>

      {/* Dialog สำหรับยืนยันการลบหมวดหมู่ */}
      <Dialog open={confirmDeleteDialogOpen} onClose={cancelDeleteCategory}>
        <DialogTitle>ยืนยันการลบหมวดหมู่</DialogTitle>
        <DialogContent>
          <DialogContentText>
            คุณแน่ใจหรือว่าต้องการลบหมวดหมู่ "{categoryToDelete?.name}"?
            การกระทำนี้ไม่สามารถย้อนกลับได้
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteCategory}>ยกเลิก</Button>
          <Button
            onClick={confirmDeleteCategory}
            color="error"
            startIcon={<DeleteForeverIcon />}
          >
            ลบ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog สำหรับ เพิ่ม/แก้ไข หมวดหมู่ (ตัวเดียวกัน) */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editMode ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
        </DialogTitle>
        <DialogContent>
          {/* ชื่อหมวดหมู่ */}
          <TextField
            label="ชื่อหมวดหมู่"
            fullWidth
            margin="normal"
            value={categoryData.name}
            onChange={(e) =>
              setCategoryData({ ...categoryData, name: e.target.value })
            }
          />

          {/* เลือกสีผ่าน colorPickerVisible */}
          <Button
            variant="outlined"
            onClick={() => setColorPickerVisible(!colorPickerVisible)}
            sx={{ marginBottom: 2 }}
          >
            เลือกสี
          </Button>
          {colorPickerVisible && (
            <SketchPicker
              color={categoryData.color}
              onChangeComplete={(color) =>
                setCategoryData({ ...categoryData, color: color.hex })
              }
            />
          )}

          {/* เลือกไอคอนผ่าน iconPickerVisible */}
          <Button
            variant="outlined"
            onClick={() => setIconPickerVisible(true)}
            sx={{ marginBottom: 2 }}
          >
            เลือกไอคอน
          </Button>
          {categoryData.icon && (
            <Typography>ไอคอนที่เลือก: {categoryData.icon}</Typography>
          )}

          <IconPicker
            open={iconPickerVisible}
            onClose={() => setIconPickerVisible(false)}
            onSelect={(iconName) => {
              setCategoryData({ ...categoryData, icon: iconName });
              setIconPickerVisible(false);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>ยกเลิก</Button>
          <Button onClick={handleSaveCategory} color="primary">
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CategoriesPage;
