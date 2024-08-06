import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore"; // Import necessary Firestore methods
import { getAuth, onAuthStateChanged } from "firebase/auth";



const firebaseConfig = {
    apiKey: "AIzaSyCoU_TscLT3zbbbCMay-Kk5dzi7HvPfrh4",
    authDomain: "inventory-5b6b3.firebaseapp.com",
    projectId: "inventory-5b6b3",
    storageBucket: "inventory-5b6b3.appspot.com",
    messagingSenderId: "180778236403",
    appId: "1:180778236403:web:290515f08a58a51e073a86",
    measurementId: "G-F2DZ8HCR7R"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

const createUserDocument = async (user) => {
    const userRef = doc(firestore, 'users', user.uid);
    await setDoc(userRef, {
      email: user.email,
    });
    
    
   
};

onAuthStateChanged(auth, (user) => {
    if (user) {
      createUserDocument(user); 
    }
});

export { auth, firestore, createUserDocument };
