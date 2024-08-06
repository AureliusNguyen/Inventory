'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://github.com/AureliusNguyen/">
        Aurelius Nguyen
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const defaultTheme = createTheme();

export default function SignInOrSignUp() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = React.useState(false);
  
  const handleEmailPasswordSignIn = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');
  
    if (isSignUp) {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          createUserDocument(user)
            .then(() => {
              auth.signOut().then(() => {
                router.push('/auth'); // Redirect to sign in page after sign up
              });
            });
        })
        .catch((error) => {
          if (error.code === 'auth/email-already-in-use') {
            alert('Email is already in use. Please try another one.');
            // Reset email input field
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';
          } else {
            console.error('Error signing up', error);
          }
        });
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          router.push('/');
        })
        .catch((error) => {
          console.error('Error signing in', error);
        });
    }
  };
  
  const handleGoogleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(() => {
        router.push('/');
      })
      .catch((error) => {
        console.error('Error signing in with Google', error);
      });
  };

  const handleForgotPassword = () => {
    const email = document.getElementById('email').value;
    if (!email) {
      alert("Please enter your email address to reset your password.");
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert("Password reset email sent. Please check your inbox.");
      })
      .catch((error) => {
        console.error("Error sending password reset email:", error);
        if (error.code === 'auth/user-not-found') {
          alert("No user found with this email.");
        } else {
          alert("Failed to send password reset email. Please try again later.");
        }
      });
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Typography>
          <Box component="form" onSubmit={handleEmailPasswordSignIn} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 1, mb: 2 }}
              onClick={handleGoogleSignIn}
            >
              Sign In with Google
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2" onClick={handleForgotPassword}>
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="#" variant="body2" onClick={() => setIsSignUp(!isSignUp)}>
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>
  );
}
