"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import {
  AlertCircle,
  ShieldCheck,
  Truck,
  Users,
  Package,
  BarChart2,
  ShoppingCart,
  Clipboard,
} from "lucide-react";
import React from "react";

export default function Inicio() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          } else {
            setError("El documento del usuario no existe en Firestore.");
          }
        } catch (err) {
          setError("Error: no tienes permisos para acceder a esta información.");
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={64} />
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  const roleConfigs: Record<string, any> = {
    ADMIN: {
      color: "green",
      icon: ShieldCheck,
      title: "Administración",
      buttons: [
        { label: "Sección de Administración", path: "/admin", icon: BarChart2 },
        { label: "Ir al Dashboard", path: "/dashboard", icon: Clipboard },
      ],
    },
    Logistica: {
      color: "purple",
      icon: Truck,
      title: "Logística",
      buttons: [
        { label: "Clientes", path: "/clientes", icon: Users },
        { label: "Repartos", path: "/repartos", icon: Package },
        { label: "Pedidos", path: "/pedidos", icon: ShoppingCart },
      ],
    },
    EncargadoClientes: {
      color: "yellow",
      icon: Users,
      title: "Encargado de Clientes",
      buttons: [
        { label: "Clientes", path: "/clientes", icon: Users },
        { label: "Productos", path: "/productos", icon: Package },
        { label: "Ventas", path: "/ventas", icon: ShoppingCart },
        { label: "Inventario", path: "/inventario", icon: Clipboard },
      ],
    },
  };

  const roleConfig = roleConfigs[userRole || ""] || null;

  const colorClasses: Record<string, string> = {
    green: "text-green-600 bg-green-600 hover:bg-green-700",
    purple: "text-purple-600 bg-purple-600 hover:bg-purple-700",
    yellow: "text-yellow-600 bg-yellow-600 hover:bg-yellow-700",
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-gray-100 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <h1 className="text-3xl font-bold text-center">
            Bienvenido, <span>{userRole || "Cargando..."}</span>
          </h1>
          <p className="text-center opacity-80 mt-2">
            Selecciona una de las siguientes opciones según tu rol
          </p>
        </div>

        {roleConfig ? (
          <div className="p-8">
            <div className="flex items-center mb-6">
              {React.createElement(roleConfig.icon, {
                className: `${colorClasses[roleConfig.color].split(" ")[0]} mr-4`,
                size: 40,
              })}
              <h2 className={`text-2xl font-semibold ${colorClasses[roleConfig.color].split(" ")[0]}`}>
                {roleConfig.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {roleConfig.buttons.map((btn: any, index: number) => (
                <Button
                  key={index}
                  onClick={() => router.push(btn.path)}
                  className={`w-full flex items-center justify-center space-x-2 ${colorClasses[roleConfig.color]} text-white`}
                >
                  <btn.icon size={20} />
                  <span>{btn.label}</span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">Rol no reconocido o en proceso de carga.</p>
          </div>
        )}
      </div>
    </div>
  );
}
