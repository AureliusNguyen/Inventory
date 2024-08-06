'use client';

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { firestore } from "@/firebase";
import { Box, Modal, Stack, TextField, Typography, Button } from "@mui/material";
import { collection, deleteDoc, getDoc, getDocs, doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const router = useRouter();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/auth');
      } else {
        console.log('User authenticated:', user.uid);
        updateInventory(user.uid);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const updateInventory = async (userId) => {
    try {
      if (!userId) {
        console.error("User ID is missing. Cannot update inventory.");
        return;
      }

      const userInventoryRef = collection(firestore, 'users', userId, 'inventory');
      const snapshot = await getDocs(userInventoryRef);
      const inventoryList = [];

      if (snapshot.empty) {
        console.log("Inventory is empty or not created yet for user:", userId);
      } else {
        snapshot.forEach((doc) => {
          inventoryList.push({
            name: doc.id,
            ...doc.data(),
          });
        });
      }

      setInventory(inventoryList);
    } catch (error) {
      console.error("Error fetching inventory:", error.message);
      if (error.code === 'permission-denied') {
        console.error("Firestore permission denied. Check your security rules.");
      }
    }
  };


  const removeItems = async (item) => {
    const docRef = doc(firestore, 'users', userId, 'inventory', item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }

    await updateInventory(userId);
  };

  const addItems = async (item) => {
    try {
      const docRef = doc(firestore, 'users', userId, 'inventory', item);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + 1 });
      } else {
        await setDoc(docRef, { quantity: 1 });
      }
  
      await updateInventory(userId);
    } catch (error) {
      console.error("Error adding item:", error.message);
      if (error.code === 'permission-denied') {
        console.error("Firestore permission denied. Check your security rules.");
      }
    }
  };
  

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
      >
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)"
          }}
        >
          <Typography variant="h6">
            Add Item
          </Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
              }}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItems(itemName);
                setItemName("");
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="contained" onClick={handleOpen}>
        Add New Item
      </Button>
      <Box border="1px solid #333">
        <Box
          width="800px"
          height="100px"
          bgcolor="#ADD8E6"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="h2" color="#333">
            Inventory Items
          </Typography>
        </Box>
        <Stack
          width="800px"
          height="300px"
          spacing={2}
          overflow="auto"
        >
          {inventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bgcolor="#f0f0f0"
              p={5}
            >
              <Typography
                variant="h3"
                color="#333"
                textAlign="center"
              >
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>

              <Typography
                variant="h3"
                color="#333"
                textAlign="center"
              >
                {quantity}
              </Typography>
              <Stack
                direction="row"
                spacing={2}
              >
                <Button variant="contained" onClick={() => addItems(name)}>
                  Add
                </Button>
                <Button variant="contained" onClick={() => removeItems(name)}>
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
