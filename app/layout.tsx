import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast'
import AuthProvider from '@/components/providers/SessionProvider'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Consultorio Odontológico Laura Bertoni",
  description: "Sistema de gestión de turnos y pacientes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}