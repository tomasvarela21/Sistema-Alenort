"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebaseConfig"; // Importar la configuración de Firebase
import { collection, getDocs, getDoc, doc, setDoc, updateDoc, increment } from "firebase/firestore";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Package, User, Hash, Truck, ShoppingCart } from "lucide-react";

export default function NewOrderForm() {
  const [cliente, setCliente] = useState("");
  const [producto, setProducto] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [fechaEntrega, setFechaEntrega] = useState(new Date().toISOString().split('T')[0]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [direccionCliente, setDireccionCliente] = useState(""); // Estado para la dirección del cliente

  // Obtener clientes desde la base de datos
  useEffect(() => {
    const obtenerClientes = async () => {
      const querySnapshot = await getDocs(collection(db, "Clientes"));
      const clientesObtenidos: any[] = [];
      querySnapshot.forEach((doc) => {
        clientesObtenidos.push({ id: doc.id, ...doc.data() });
      });
      setClientes(clientesObtenidos);
    };

    obtenerClientes();
  }, []);

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        // Obtiene los documentos de la colección "Productos"
        const querySnapshot = await getDocs(collection(db, "Productos"));
        
        // Extrae los datos de los documentos y agrega el ID para cada producto
        const productosObtenidos = querySnapshot.docs.map((doc) => ({
          id: doc.id,  // Incluye el ID del documento
          ...doc.data()  // Obtiene los datos del documento
        }));
  
        // Actualiza el estado con los productos obtenidos
        setProductos(productosObtenidos);
      } catch (error) {
        console.error("Error al obtener productos:", error);
      }
    };
  
    obtenerProductos();
  }, []);

  // Función para obtener y actualizar el LastId en la colección pedidosCounters
  const obtenerNuevoId = async () => {
    const docRef = doc(db, "counters", "pedidosCounters");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const lastId = docSnap.data().LastId;

      // Actualizar el LastId para el siguiente uso
      await updateDoc(docRef, {
        LastId: increment(1),
      });

      return lastId + 1; // Devuelve el nuevo ID incrementado
    } else {
      throw new Error("El documento PedidosCounters no existe.");
    }
  };

  // Función para manejar el cambio de cliente y obtener la dirección
  const handleClienteChange = async (value: string) => {
    setCliente(value);
    const clienteSeleccionado = clientes.find((cliente) => cliente.nombreCliente === value);
    if (clienteSeleccionado) {
      setDireccionCliente(clienteSeleccionado.direccionCliente); // Asigna la dirección del cliente seleccionado
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const nuevoId = await obtenerNuevoId(); // Obtener el ID autoincremental

      const nuevoPedido = {
        id: nuevoId,
        cliente: cliente,
        producto: producto,
        cantidad: cantidad,
        fechaEntrega: fechaEntrega,
        direccionCliente: direccionCliente, // Incluye la dirección en el pedido
      };

      // Guardar el pedido en la colección Pedidos
      await setDoc(doc(db, "Pedidos", nuevoId.toString()), nuevoPedido);

      console.log("Pedido registrado:", nuevoPedido);
      
      // Resetear los campos del formulario
      setCliente("");
      setProducto("");
      setCantidad(1);
      setFechaEntrega("");
      setDireccionCliente(""); // Resetear la dirección
    } catch (error) {
      console.error("Error al registrar el pedido:", error);
    }
  };
  // Función para validar la fecha
  const isValidDate = (date: string): boolean => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  };

  // Handler para cambio de fecha con validación
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    if (!isValidDate(newDate)) {
      // Establecer la fecha actual como valor por defecto
      setFechaEntrega(new Date().toISOString().split('T')[0]);
    } else {
      setFechaEntrega(newDate);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-primary/10 rounded-xl">
            <ShoppingCart className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Registrar Pedido</h1>
            <p className="text-gray-500">Crea y gestiona nuevos pedidos de clientes</p>
          </div>
        </div>
      </div>

      <Card className="border-2 border-gray-100">
        <CardHeader className="border-b bg-gray-50/50 space-y-1">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-semibold">Nuevo Pedido</h2>
          </div>
          <p className="text-sm text-gray-500">Complete los detalles del pedido</p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label 
                  htmlFor="cliente" 
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-gray-500" />
                  Cliente
                </Label>
                <Select
                  onValueChange={handleClienteChange}
                  value={cliente}
                  required
                >
                  <SelectTrigger id="cliente" className="h-11">
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <h4 className="mb-2 text-sm font-medium text-gray-500">Clientes Disponibles</h4>
                      {clientes.map((cliente, index) => (
                        <SelectItem 
                          key={index} 
                          value={cliente.nombreCliente}
                          className="cursor-pointer hover:bg-gray-50 rounded-md transition-colors"
                        >
                          {cliente.nombreCliente}
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label 
                  htmlFor="producto" 
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Package className="w-4 h-4 text-gray-500" />
                  Producto
                </Label>
                <Select
                  onValueChange={(value) => setProducto(value)}
                  value={producto}
                  required
                >
                  <SelectTrigger id="producto" className="h-11">
                    <SelectValue placeholder="Seleccionar producto" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <h4 className="mb-2 text-sm font-medium text-gray-500">Productos Disponibles</h4>
                      {productos.map((producto, index) => (
                        <SelectItem 
                          key={index} 
                          value={producto.nombre}
                          className="cursor-pointer hover:bg-gray-50 rounded-md transition-colors"
                        >
                          {producto.nombre}
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label 
                  htmlFor="cantidad" 
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Hash className="w-4 h-4 text-gray-500" />
                  Cantidad
                </Label>
                <div className="relative">
                  <Input
                    id="cantidad"
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(Number(e.target.value))}
                    min="1"
                    required
                    className="h-11 pl-10"
                    placeholder="Ingrese la cantidad"
                  />
                  <Hash className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label 
                  htmlFor="fechaEntrega" 
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-gray-500" />
                  Fecha de Entrega
                </Label>
                <div className="relative">
                <Input
                  id="fechaEntrega"
                  type="date"
                  value={fechaEntrega}
                  onChange={handleDateChange} // Solo un manejador de eventos
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="h-11 pl-10"
                />
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              </div>

              </div>
            </div>

            <div className="pt-4 border-t">
              <Button 
                type="submit" 
                className="w-full h-11 text-base gap-2"
              >
                <Truck className="w-5 h-5" />
                Registrar Pedido
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-500">
        <p>Todos los pedidos serán procesados en el horario laboral</p>
      </div>
    </div>
  );
};
