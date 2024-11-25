"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/lib/firebaseConfig";
import { Users, Truck, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Admin() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [vendedorName, setVendedorName] = useState("");
  const [repartidorName, setRepartidorName] = useState("");
  const [vendedorEmail, setVendedorEmail] = useState("");
  const [repartidorEmail, setRepartidorEmail] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const role = userDoc.data().role;
            if (role === "ADMIN") {
              setUserRole(role);
            } else {
              router.push("/"); // Redirige a página de inicio
            }
          } else {
            router.push("/login");
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "No se pudo verificar el rol del usuario.",
            variant: "destructive",
          });
          router.push("/login");
        } finally {
          setLoading(false);
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  if (!userRole) {
    return null; // Evita renderizar el contenido si no se permite el acceso
  }

 

  const handleRegisterVendedor = async () => {
    if (!vendedorName || !vendedorEmail) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    try {
      await addDoc(collection(db, "Vendedores"), {
        Nombre: vendedorName,
        Email: vendedorEmail,
        FechaRegistro: serverTimestamp(),
      });

      toast({
        title: "Éxito",
        description: "Vendedor registrado correctamente",
      });

      setVendedorName("");
      setVendedorEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar el vendedor",
        variant: "destructive",
      });
    }
  };

  const handleRegisterRepartidor = async () => {
    if (!repartidorName || !repartidorEmail) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    try {
      await addDoc(collection(db, "Repartidores"), {
        Nombre: repartidorName,
        Email: repartidorEmail,
        FechaRegistro: serverTimestamp(),
      });

      toast({
        title: "Éxito",
        description: "Repartidor registrado correctamente",
      });

      setRepartidorName("");
      setRepartidorEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar el repartidor",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Users className="mr-3" /> Sección Administrativa
      </h1>

      <Tabs defaultValue="vendedores" className="w-full">
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger
      value="vendedores"
      className="flex items-center justify-center p-2 rounded-lg transition-all duration-200 hover:bg-blue-100 hover:text-blue-700 focus:ring focus:ring-blue-300"
    >
      <Users className="mr-2 h-4 w-4" />
      Vendedores
    </TabsTrigger>
    <TabsTrigger
      value="repartidores"
      className="flex items-center justify-center p-2 rounded-lg transition-all duration-200 hover:bg-green-100 hover:text-green-700 focus:ring focus:ring-green-300"
    >
      <Truck className="mr-2 h-4 w-4" />
      Repartidores
    </TabsTrigger>
  </TabsList>


        <TabsContent value="vendedores">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center">
                <Plus className="mr-2" /> Registrar Nuevo Vendedor
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nombre del Vendedor</Label>
                <Input
                  value={vendedorName}
                  onChange={(e) => setVendedorName(e.target.value)}
                  placeholder="Nombre completo"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Correo Electrónico</Label>
                <Input
                  type="email"
                  value={vendedorEmail}
                  onChange={(e) => setVendedorEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="mt-2"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleRegisterVendedor} className="w-full">
                Registrar Vendedor
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="repartidores">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center">
                <Plus className="mr-2" /> Registrar Nuevo Repartidor
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nombre del Repartidor</Label>
                <Input
                  value={repartidorName}
                  onChange={(e) => setRepartidorName(e.target.value)}
                  placeholder="Nombre completo"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Correo Electrónico</Label>
                <Input
                  type="email"
                  value={repartidorEmail}
                  onChange={(e) => setRepartidorEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="mt-2"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleRegisterRepartidor} className="w-full">
                Registrar Repartidor
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
