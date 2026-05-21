
"use client";

import type { Metadata } from 'next';
import './globals.css';
import { initializeFirebase, FirebaseClientProvider } from '@/firebase';

const { firebaseApp, firestore, auth } = initializeFirebase();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider 
          firebaseApp={firebaseApp} 
          firestore={firestore} 
          auth={auth}
        >
          {children}
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
