"use client";
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import Sidebar from '../components/Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from 'react';
import { auth, db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Loader2 } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ['latin'] });

type Role = "ADMIN" | "EncargadoClientes" | "Logistica";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        } else {
          setUserRole(null);
          router.push('/login');
        }
      } else {
        setIsAuthenticated(false);
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const role = ["ADMIN", "EncargadoClientes", "Logistica"].includes(userRole || "") ? (userRole as Role) : null;

  if (isAuthenticated === null) {
    return (
      <html lang="es">
        <body className={inter.className}>
          <div className="flex items-center justify-center h-screen bg-gradient-to-br from-primary/10 to-primary/20">
            <Card className="p-8 flex flex-col items-center shadow-xl">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-xl text-muted-foreground">Cargando aplicación...</p>
            </Card>
          </div>
        </body>
      </html>
    );
  }

  if (!isAuthenticated && pathname === '/login') {
    return (
      <html lang="es">
        <body className={inter.className}>
          <main className="h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
            {children}
          </main>
        </body>
      </html>
    );
  }

  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="flex h-screen bg-background">
          <Sidebar role={role} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 space-y-6">
              <Card className="w-full p-6 min-h-full">
                {children}
              </Card>
            </main>
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}