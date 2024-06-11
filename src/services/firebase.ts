// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyCBAsLagjs6SyhQpZ3SK7DOrmx-3n3GhLQ",
	authDomain: "categories-tree-6eba6.firebaseapp.com",
	projectId: "categories-tree-6eba6",
	storageBucket: "categories-tree-6eba6.appspot.com",
	messagingSenderId: "826758356762",
	appId: "1:826758356762:web:8a59c1a869906b09c056a3",
	measurementId: "G-66ZP7BLWPR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
