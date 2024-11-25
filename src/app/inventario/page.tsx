"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebaseConfig"; // Asegúrate de que la configuración de Firebase esté exportada desde este archivo
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, PackageOpen, Warehouse } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function InventarioPage() {
  const [inventario, setInventario] = useState<{ id: string; producto: string; cantidad: string; }[]>([]);
  const [producto, setProducto] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [ID, setID] = useState('');

  // Función para obtener los datos de la base de datos
  useEffect(() => {
    const obtenerInventario = async () => {
      const querySnapshot = await getDocs(collection(db, "Inventario"));
      const inventarioObtenido = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as { id: string; producto: string; cantidad: string; }[];
      setInventario(inventarioObtenido);
    };

    obtenerInventario();
  }, []);

  // Función para agregar un nuevo producto a la base de datos con un ID manual
  const agregarInventario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!ID) {
        alert("Por favor, ingrese un ID válido.");
        return;
      }
      const nuevoItem = { producto, cantidad };
      await setDoc(doc(db, "Inventario", ID), nuevoItem);
      setInventario([...inventario, { id: ID, ...nuevoItem }]); // Actualiza el estado local
      setID('');
      setProducto('');
      setCantidad('');
    } catch (error) {
      console.error("Error al agregar al inventario: ", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center space-x-4 border-b pb-4">
          <Plus className="w-6 h-6 text-primary" />
          <CardTitle className="text-xl">Agregar al Inventario</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={agregarInventario} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ID" className="font-medium">ID para reconocerlo</Label>
              <Input
                id="ID"
                type="text"
                value={ID}
                onChange={(e) => setID(e.target.value)}
                required
                placeholder="Ingrese el ID del producto"
                className="focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="producto" className="font-medium">Producto</Label>
              <Input
                id="producto"
                type="text"
                value={producto}
                onChange={(e) => setProducto(e.target.value)}
                required
                placeholder="Nombre del producto"
                className="focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cantidad" className="font-medium">Cantidad en stock</Label>
              <Input
                id="cantidad"
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                required
                placeholder="Cantidad de unidades"
                min="1"
                className="focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full mt-4 bg-primary hover:bg-primary/90 transition-colors"
            >
              <Plus className="mr-2 h-4 w-4" /> Agregar al Inventario
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center space-x-4 border-b pb-4">
          <Warehouse className="w-6 h-6 text-primary" />
          <CardTitle className="text-xl">Lista de Inventario</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {inventario.length === 0 ? (
            <Alert variant="default" className="bg-gray-50">
              <PackageOpen className="h-4 w-4" />
              <AlertDescription className="ml-2">
                No hay productos en el inventario
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              {inventario.map((item, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center p-3 bg-white border rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <PackageOpen className="w-5 h-5 text-primary/70" />
                    <div>
                      <p className="font-medium text-sm text-gray-800">ID: {item.id}</p>
                      <p className="text-gray-600 text-sm">{item.producto}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-primary/80">
                    {item.cantidad} unidades
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

