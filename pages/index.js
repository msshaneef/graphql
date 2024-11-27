import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import styles from "../styles/Home.module.css";
import Cookies from 'js-cookie';

export default function Home() {
  const router = useRouter()
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const handleSubmit = async (event) => {
    event.preventDefault();

    const credentials = btoa(`${username}:${password}`);
    const response = await fetch('https://learn.reboot01.com/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify({}),
    })
    .then(response => response.json())
    .then(data => {
      const jwt = data;

      // Check if the JWT is valid
      if (jwt && jwt.length > 0) {
        // Store the JWT in cookies
        Cookies.set('jwt', jwt,);
  
        // Redirect the user to the "dashboard.html" page
          router.push('/dashboard');
      } else {
        // Display an error message if the JWT is not valid
        setErrorMessage('Invalid username or password');
      }
    });
  }

  return (
    <>
      <Head>
        <title>Login</title>
        <meta name="description" content="Login page" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.page}>
        <div className={styles.loginContainer}>
        <div className={styles.shape}></div>
        <div className={styles.shape}></div>
        </div>
          <form className={styles.loginForm} onSubmit = {handleSubmit}>
              <label htmlFor="username" className={styles.label}>Username</label>
              <input type="text" className={styles.input} id="username" name="username" value={username} onChange= {(e) => setUsername(e.target.value)} required />
              <label className={styles.label} htmlFor="password">Password</label>
              <input type="password" className={styles.input} id="password" name="password" value={password} onChange= {(e) => setPassword(e.target.value)} required />
            <button type="submit" className={styles.submitButton}>Login</button>
            {errorMessage && <p className={styles.errorMessage} id= "error-message">{errorMessage}</p>}
          </form>
        </div>
    </>
  );
}