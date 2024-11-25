"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebaseConfig"; // Importa la configuración de Firebase
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, increment } from "firebase/firestore";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Mail, Phone, MapPin, Edit2, Trash2, User, Save } from "lucide-react";

// Definir la interfaz Cliente
interface Cliente {
  id: number;
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente: string;
  direccionCliente: string;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nombreCliente, setNombreCliente] = useState("");
  const [emailCliente, setEmailCliente] = useState("");
  const [telefonoCliente, setTelefonoCliente] = useState("");
  const [direccionCliente, setDireccionCliente] = useState("");
  const [clienteEditado, setClienteEditado] = useState<Cliente | null>(null);

  // Obtener la colección de clientes desde la base de datos
  useEffect(() => {
    const obtenerClientes = async () => {
      const querySnapshot = await getDocs(collection(db, "Clientes"));
      const clientesObtenidos: Cliente[] = [];
      querySnapshot.forEach((doc) => {
        clientesObtenidos.push(doc.data() as Cliente);
      });
      setClientes(clientesObtenidos);
    };

    obtenerClientes();
  }, []);

  // Función para obtener y actualizar el LastId en la colección counters
  const obtenerNuevoId = async () => {
    const docRef = doc(db, "counters", "ClientesCounters");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const lastId = docSnap.data().LastId;

      // Actualizar el LastId para el siguiente uso
      await updateDoc(docRef, {
        LastId: increment(1),
      });

      return lastId + 1; // Devuelve el nuevo ID incrementado
    } else {
      throw new Error("El documento ClientesCounters no existe.");
    }
  };

  // Función para agregar un nuevo cliente
  const agregarCliente = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const nuevoId = await obtenerNuevoId(); // Obtener el ID autoincremental

      const nuevoCliente: Cliente = {
        id: nuevoId,
        nombreCliente,
        emailCliente,
        telefonoCliente,
        direccionCliente,
      };

      await setDoc(doc(db, "Clientes", nuevoId.toString()), nuevoCliente);
      setClientes([...clientes, nuevoCliente]);
      
      // Resetear los campos del formulario
      setNombreCliente("");
      setEmailCliente("");
      setTelefonoCliente("");
      setDireccionCliente("");
    } catch (error) {
      console.error("Error al agregar cliente con ID autoincremental: ", error);
    }
  };

  // Función para editar un cliente
  const editarCliente = (index: number) => {
    const cliente = clientes[index];
    setClienteEditado(cliente);
    setNombreCliente(cliente.nombreCliente);
    setEmailCliente(cliente.emailCliente);
    setTelefonoCliente(cliente.telefonoCliente);
    setDireccionCliente(cliente.direccionCliente);
  };

  // Función para guardar los cambios al editar un cliente
  const guardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();

    if (clienteEditado) {
      const clienteActualizado: Cliente = {
        ...clienteEditado,
        nombreCliente,
        emailCliente,
        telefonoCliente,
        direccionCliente,
      };

      try {
        await updateDoc(doc(db, "Clientes", clienteEditado.id.toString()), {
          nombreCliente: clienteActualizado.nombreCliente,
          emailCliente: clienteActualizado.emailCliente,
          telefonoCliente: clienteActualizado.telefonoCliente,
          direccionCliente: clienteActualizado.direccionCliente,
        });

        setClientes(
          clientes.map((cliente) =>
            cliente.id === clienteEditado.id ? clienteActualizado : cliente
          )
        );

        // Resetear campos y estado de edición
        setClienteEditado(null);
        setNombreCliente("");
        setEmailCliente("");
        setTelefonoCliente("");
        setDireccionCliente("");
      } catch (error) {
        console.error("Error al actualizar cliente: ", error);
      }
    }
  };

  // Función para eliminar un cliente
  const eliminarCliente = async (index: number) => {
    const cliente = clientes[index];
    try {
      // Eliminar el cliente de la base de datos
      await deleteDoc(doc(db, "Clientes", cliente.id.toString()));
      
      // Filtrar el cliente de la lista local (clientes) para actualizar la UI
      setClientes(clientes.filter((c) => c.id !== cliente.id));
    } catch (error) {
      console.error("Error al eliminar cliente: ", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Clientes</h1>
        </div>
      </div>

      <Card className="border-2 border-gray-100">
        <CardHeader className="border-b bg-gray-50/50">
          <div className="flex items-center space-x-2">
            {clienteEditado ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            <h2 className="text-2xl font-semibold">
              {clienteEditado ? "Editar Cliente" : "Agregar Cliente"}
            </h2>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={clienteEditado ? guardarCambios : agregarCliente} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombreCliente" className="text-sm font-medium">
                  Nombre del Cliente
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="nombreCliente"
                    value={nombreCliente}
                    onChange={(e) => setNombreCliente(e.target.value)}
                    className="pl-10 focus-visible:ring-primary"
                    required
                    placeholder="Nombre completo"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailCliente" className="text-sm font-medium">
                  Email del Cliente
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="emailCliente"
                    type="email"
                    value={emailCliente}
                    onChange={(e) => setEmailCliente(e.target.value)}
                    className="pl-10 focus-visible:ring-primary"
                    required
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefonoCliente" className="text-sm font-medium">
                  Teléfono del Cliente
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="telefonoCliente"
                    value={telefonoCliente}
                    onChange={(e) => setTelefonoCliente(e.target.value)}
                    className="pl-10 focus-visible:ring-primary"
                    required
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccionCliente" className="text-sm font-medium">
                  Dirección del Cliente
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="direccionCliente"
                    value={direccionCliente}
                    onChange={(e) => setDireccionCliente(e.target.value)}
                    className="pl-10 focus-visible:ring-primary"
                    required
                    placeholder="Dirección completa"
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full gap-2 text-base"
            >
              {clienteEditado ? (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Agregar Cliente
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Lista de Clientes</h2>
          <div className="h-1 flex-1 mx-4 bg-gradient-to-r from-primary/20 to-transparent" />
        </div>

        {clientes.length > 0 ? (
          <div className="grid gap-4">
            {clientes.map((cliente, index) => (
              <div
                key={cliente.id}
                className="group relative bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="grid grid-cols-[1fr,auto] gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {cliente.nombreCliente}
                      </h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{cliente.emailCliente}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{cliente.telefonoCliente}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{cliente.direccionCliente}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editarCliente(index)}
                      className="gap-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => eliminarCliente(index)}
                      className="gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay clientes disponibles.</p>
          </div>
        )}
      </div>
    </div>
  );
};