// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { Auth, getAuth, initializeAuth } from "firebase/auth";
import { getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from "@react-native-async-storage/async-storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDyLuSny2xLexT8dQr57ZoUK0QTUSI2hyc",
  authDomain: "budgetingapp-abcee.firebaseapp.com",
  projectId: "budgetingapp-abcee",
  storageBucket: "budgetingapp-abcee.appspot.com",
  messagingSenderId: "848931069508",
  appId: "1:848931069508:web:c2d0cc344788829928e611",
  measurementId: "G-KMSJ1SE2NG"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const auth = (): Auth => {
  try {
    return initializeAuth(app, {persistence: getReactNativePersistence(AsyncStorage)});
  } catch (err) {
    return getAuth();
  }
}