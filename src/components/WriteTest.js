// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Import analytics only if you are using it
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFtNtofJXXi60abdaYsjpXChL2t6dG1DE",
  authDomain: "todolistapp-50f1c.firebaseapp.com",
  projectId: "todolistapp-50f1c",
  storageBucket: "todolistapp-50f1c.appspot.com",  // เปลี่ยนเป็น firebase.storageBucket URL ให้ถูกต้อง
  messagingSenderId: "395797543672",
  appId: "1:395797543672:web:a03dafdd6bd0e4ef46590d",
  measurementId: "G-LZ3M8N0VS8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (optional)
const analytics = getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
