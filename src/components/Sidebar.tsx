"use client";
import { Users, Calendar, BarChart2, DollarSign, Gift, BookOpen, LayoutDashboard, Clipboard, LogOut, ShoppingBag, Truck, Package, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Role = "ADMIN" | "EncargadoClientes" | "Logistica";

const sidebarItems: Record<Role, { href: string; icon: React.ElementType; label: string }[]> = {
  ADMIN: [
    { href: "/dashboard", icon: BarChart2, label: "Dashboard" },
    { href: "/pedidos", icon: ShoppingBag, label: "Pedidos" },
    { href: "/clientes", icon: Users, label: "Clientes" },
    { href: "/repartos", icon: Truck, label: "Repartos" },
    { href: "/productos", icon: Package, label: "Productos" },
    { href: "/ventas", icon: ClipboardList, label: "Ventas" },
    { href: "/inventario", icon: Package, label: "Inventario" },
  ],
  EncargadoClientes: [
    { href: "/clientes", icon: Users, label: "Clientes" },
    { href: "/productos", icon: Package, label: "Productos" },
    { href: "/ventas", icon: ClipboardList, label: "Ventas" },
    { href: "/inventario", icon: Package, label: "Inventario" },
  ],
  Logistica: [
    { href: "/clientes", icon: Users, label: "Clientes" },
    { href: "/repartos", icon: Truck, label: "Repartos" },
    { href: "/pedidos", icon: ShoppingBag, label: "Pedidos" },
    
  ],
};

export default function Sidebar({ role }: { role: Role | null }) {
  const pathname = usePathname();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // Verificamos que el role sea válido antes de renderizar
  if (!role || !(role in sidebarItems)) return null;

  const handleLogout = async () => {
    await signOut(auth); // Cierra sesión en Firebase
  };

  return (
    <>
      {/* Mobile Sidebar Toggle */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="md:hidden fixed top-4 left-4 z-50">
            ☰
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <Card className="h-full rounded-none">
            <CardContent className="pt-6 px-4 flex flex-col h-full">
              <div className="text-center mb-6">
                <Link href="/">
                  <img
                    src="/alenort logo.png"
                    alt="Alenort Logo"
                    className="h-32 mx-auto object-contain"
                  />
                </Link>
              </div>
              
              <nav className="flex-grow space-y-2">
                {sidebarItems[role].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center p-2 rounded-md transition duration-200 ${
                        pathname === item.href 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <Icon className="mr-3" size={18} />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              
              <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="w-full mt-4 flex items-center justify-center"
                    onClick={() => setIsAlertOpen(true)}
                  >
                    <LogOut className="mr-2" size={18} />
                    Salir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción cerrará tu sesión. ¿Quieres continuar?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>
                      Continuar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-background border-r">
        <Card className="h-full rounded-none border-none">
          <CardContent className="pt-6 px-4 flex flex-col h-full">
            <div className="text-center mb-6">
              <Link href="/">
                <img
                  src="/alenort logo.png"
                  alt="Alenort Logo"
                  className="h-48 mx-auto object-contain"
                />
              </Link>
            </div>
            
            <nav className="flex-grow space-y-2">
              {sidebarItems[role].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center p-2 rounded-md transition duration-200 ${
                      pathname === item.href 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Icon className="mr-3" size={18} />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full mt-4 flex items-center justify-center"
                  onClick={() => setIsAlertOpen(true)}
                >
                  <LogOut className="mr-2" size={18} />
                  Salir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción cerrará tu sesión. ¿Quieres continuar?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>
                    Continuar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </aside>
    </>
  );
}