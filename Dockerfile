# Step 1: ใช้ Node.js image สำหรับการ build
FROM node:16 AS builder

# ตั้งค่า working directory ภายใน container
WORKDIR /app

# คัดลอกไฟล์ package.json และ package-lock.json มายัง container
COPY package.json ./
COPY package-lock.json ./

# ติดตั้ง dependencies
RUN npm install

# คัดลอกโค้ดทั้งหมดของโปรเจกต์มาที่ container
COPY . .

# สร้าง production build ของแอป React
RUN npm run build

# Step 2: ใช้ Nginx เพื่อติดตั้ง build ไฟล์ที่สร้างไว้
FROM nginx:alpine

# คัดลอก build ที่สร้างไว้ไปที่ Nginx public directory
COPY --from=builder /app/build /usr/share/nginx/html

# เปิดพอร์ต 80 สำหรับเข้าถึงแอป
EXPOSE 80

# รัน Nginx
CMD ["nginx", "-g", "daemon off;"]
