/* 
  About.js

  — TH (ภาษาไทย):
    ไฟล์นี้เป็นหน้าจอ (Page) ใน React ที่จะแสดงข้อมูลเกี่ยวกับแอปพลิเคชัน (About Page)
    โดยเน้นโชว์รายละเอียด “เกี่ยวกับเรา”, ทีมผู้พัฒนา, คุณสมบัติเด่นของแอป และช่องทางติดต่อ
    ซึ่งประกอบด้วยองค์ประกอบ (components) จาก Material-UI และการใช้เอฟเฟกต์ Parallax 
    จากไลบรารี react-parallax เพื่อทำให้หน้าดูสวยงามมากขึ้น

  — EN (English):
    This file is a React page (component) that shows the "About" information of the application,
    focusing on “About Us,” the development team, the app’s main features, and contact information.
    It uses Material-UI components and the Parallax effect from the react-parallax library for visual enhancement.
*/

import React from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Stack,
} from "@mui/material";
// import icons from Material-UI
import { Email, Facebook, Instagram } from "@mui/icons-material";
// import Parallax from react-parallax (frontend library for parallax effect)
import { Parallax } from 'react-parallax'; 

/* 
  teamMembers:

  — TH: อาร์เรย์ teamMembers เก็บข้อมูลสมาชิกทีม (ชื่อ, บทบาท, รูป, อีเมล, Facebook, Instagram)
  — EN: The teamMembers array stores information about team members (name, role, avatar, email, Facebook, Instagram)
*/
const teamMembers = [
  {
    name: "ภัคพล แก้วเขียว",
    role: "นักพัฒนาแอปพลิเคชันฟูลสแต็ก",
    avatar: "https://ssl.gstatic.com/ui/v1/icons/mail/profile_me_2x.png",
    email: "pdnejos098@gmail.com",
    facebook: "https://www.facebook.com/phakkhaphon.kaeokhiao/",
    instagram: "https://www.instagram.com/phakkhaphonpk/",
  },
];

/* 
  ParallaxSection component:

  — TH: คอมโพเนนต์สำหรับสร้างส่วน Parallax โดยใช้ bgImage (รูปพื้นหลัง) และ strength เพื่อปรับความลึก
    height ใช้กำหนดความสูงของ block
  — EN: A component for creating a parallax section using bgImage as the background and 
    strength for the parallax intensity. The height prop determines the block’s height.
*/
const ParallaxSection = ({ children, image, strength = 500, height = 500 }) => (
  <Parallax bgImage={image} strength={strength}>
    <Box
      sx={{
        // height in px based on prop
        height: `${height}px`,
        // center contents vertically and horizontally
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // text styling
        color: "white",
        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
        // arrange children in a column
        flexDirection: 'column',
        // semi-transparent overlay effect
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}
    >
      {children}
    </Box>
  </Parallax>
);

/* 
  About component:

  — TH: About เป็นคอมโพเนนต์หลักสำหรับหน้าข้อมูล “เกี่ยวกับเรา”
    ซึ่งจะแสดง Parallax Header, คุณสมบัติเด่น, ทีมของเรา, 
    และข้อมูลติดต่อ ในรูปแบบสวยงาม
  — EN: The main component for the "About" page, displaying a Parallax header, 
    features, the development team, and contact information in a visually appealing way.
*/
const About = () => {
  return (
    <>
      {/* Parallax Header */}
      <ParallaxSection 
        image="https://source.unsplash.com/1600x900/?productivity,technology" 
        height={600}
      >
        {/* Large text for the heading */}
        <Typography 
          variant="h2" 
          sx={{ fontWeight: "bold", fontSize: { xs: '2.5rem', md: '4rem' } }}
        >
          เกี่ยวกับเรา
        </Typography>
        <Typography 
          variant="h5" 
          sx={{ fontWeight: "300", marginTop: 2 }}
        >
          ทำให้การจัดการงานเป็นเรื่องง่ายและสนุก
        </Typography>
      </ParallaxSection>

      {/* Main Container for page content */}
      <Container maxWidth="lg" sx={{ marginTop: 4, marginBottom: 4 }}>
        
        {/* Introduction Section */}
        <Box textAlign="center" sx={{ marginBottom: 6 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: "primary.main", marginBottom: 2 }}
          >
            ยินดีต้อนรับสู่แอป My ToDo!
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", maxWidth: 800, margin: "auto", fontSize: '1.2rem' }}
          >
            {/* Thai text describing the app's main idea */}
            แอปพลิเคชันที่ถูกออกแบบมาเพื่อช่วยให้คุณจัดการงานและเพิ่มผลผลิตได้อย่างมีประสิทธิภาพ ด้วยการออกแบบที่เรียบง่ายและทันสมัย คุณจะสามารถติดตามงานของคุณได้ทุกที่ทุกเวลา
          </Typography>
        </Box>

        {/* Features Section */}
        <Box sx={{ marginTop: 8, marginBottom: 8 }}>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ fontWeight: "bold", textAlign: 'center', marginBottom: 4 }}
          >
            คุณสมบัติเด่น
          </Typography>
          <Grid container spacing={4}>
            {/* Array of feature objects mapped into Grid items */}
            {[
              {
                title: "การจัดการงานพร้อมลำดับความสำคัญ",
                image: "https://source.unsplash.com/400x300/?tasks",
              },
              {
                title: "การจัดระเบียบงานตามหมวดหมู่",
                image: "https://source.unsplash.com/400x300/?organization",
              },
              {
                title: "ปฏิทินสำหรับการวางแผน",
                image: "https://source.unsplash.com/400x300/?calendar",
              },
              {
                title: "การติดตามความคืบหน้า",
                image: "https://source.unsplash.com/400x300/?progress",
              },
              {
                title: "การออกแบบที่ใช้งานง่าย",
                image: "https://source.unsplash.com/400x300/?design",
              },
              {
                title: "การแจ้งเตือนที่ปรับแต่งได้",
                image: "https://source.unsplash.com/400x300/?notification",
              },
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    boxShadow: 3,
                    borderRadius: 2,
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Image for the feature */}
                  <Box
                    component="img"
                    src={feature.image}
                    alt={feature.title}
                    sx={{ height: 180, objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" color="text.primary" sx={{ fontWeight: 'bold' }}>
                      {feature.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Parallax Divider (Team Section header) */}
        <ParallaxSection 
          image="https://source.unsplash.com/1600x900/?teamwork" 
          height={500}
        >
          <Typography 
            variant="h4" 
            sx={{ fontWeight: "bold", fontSize: { xs: '2rem', md: '3rem' } }}
          >
            ทีมของเรา
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: "300", marginTop: 1 }}>
            เราทุ่มเทเพื่อสร้างสรรค์ประสบการณ์ที่ดีที่สุดให้กับคุณ
          </Typography>
        </ParallaxSection>

        {/* Team Section */}
        <Box sx={{ marginTop: 8, marginBottom: 8 }}>
          <Grid container spacing={4} justifyContent="center">
            {teamMembers.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    boxShadow: 3,
                    padding: 3,
                    borderRadius: 2,
                    textAlign: 'center',
                    height: '100%',
                  }}
                >
                  {/* Member Avatar */}
                  <Avatar
                    src={member.avatar}
                    alt={member.name}
                    sx={{
                      width: 120,
                      height: 120,
                      margin: 'auto',
                      marginBottom: 2,
                      border: "4px solid",
                      borderColor: "primary.main",
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {member.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", marginBottom: 2 }}
                  >
                    {member.role}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ marginTop: 1, justifyContent: 'center' }}
                  >
                    {/* Email Button */}
                    <Button
                      startIcon={<Email />}
                      href={`mailto:${member.email}`}
                      size="small"
                      color="primary"
                      variant="contained"
                    >
                      อีเมล
                    </Button>
                    {/* Facebook Button */}
                    <Button
                      startIcon={<Facebook />}
                      href={member.facebook}
                      size="small"
                      color="primary"
                      variant="contained"
                    >
                      เฟสบุ๊ค
                    </Button>
                    {/* Instagram Button */}
                    <Button
                      startIcon={<Instagram />}
                      href={member.instagram}
                      size="small"
                      color="primary"
                      variant="contained"
                    >
                      อินสตาแกรม
                    </Button>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Parallax Divider (Contact Section header) */}
        <ParallaxSection 
          image="https://source.unsplash.com/1600x900/?contact" 
          height={400}
        >
          <Typography 
            variant="h4" 
            sx={{ fontWeight: "bold", fontSize: { xs: '2rem', md: '3rem' } }}
          >
            ติดต่อเรา
          </Typography>
        </ParallaxSection>

        {/* Contact Section */}
        <Box sx={{ marginTop: 8, marginBottom: 8 }}>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ fontWeight: "bold", textAlign: 'center', marginBottom: 4 }}
          >
            ติดต่อเรา
          </Typography>
          <Typography 
            variant="body1" 
            paragraph 
            sx={{ textAlign: 'center', maxWidth: 800, margin: 'auto', fontSize: '1.2rem' }}
          >
            {/* Brief contact info text */}
            มีคำถามหรือข้อเสนอแนะ? ติดต่อเราได้ที่:
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                backgroundColor: "background.default",
                padding: 4,
                borderRadius: 2,
                boxShadow: 3,
                maxWidth: 600,
                width: '100%',
              }}
            >
              <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: 2 }}>
                📧 อีเมล: <a href="mailto:pdnejos098@gmail.com">pdnejos098@gmail.com</a>
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: 2 }}>
                📞 โทรศัพท์: <a href="-">062-440-2347</a>
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                🏠 ที่อยู่ -----
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default About;
