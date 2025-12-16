// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyABsKPq5nJEfmBOZsXDUxojSDCRv_IxLBI",
  authDomain: "planning-poker-de9bd.firebaseapp.com",
  databaseURL: "https://planning-poker-de9bd-default-rtdb.firebaseio.com",
  projectId: "planning-poker-de9bd",
  storageBucket: "planning-poker-de9bd.firebasestorage.app",
  messagingSenderId: "668964102108",
  appId: "1:668964102108:web:05724f2445a8a3bd693919",
  measurementId: "G-01P3EN9C4T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
// サーバー側で実行されるとエラーになるため、typeof window !== 'undefined' でガードする
let analytics: Analytics | undefined;

if (typeof window !== 'undefined') {
  // isSupported() は環境がAnalyticsに対応しているかチェックする関数
  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}
export { db, auth, analytics }
