"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebaseConfig"; // Importa la configuración de Firebase
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, increment } from "firebase/firestore";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { PackageSearch, Edit2, Trash2, Plus, Save } from "lucide-react";

// Definir la interfaz Producto
interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number; // Nuevo campo cantidad
  imagenUrl: string;
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [nombreProducto, setNombreProducto] = useState("");
  const [descripcionProducto, setDescripcionProducto] = useState("");
  const [precioProducto, setPrecioProducto] = useState(0);
  const [cantidadProducto, setCantidadProducto] = useState(1); // Estado para cantidad
  const [imagenUrlProducto, setImagenUrlProducto] = useState("");
  const [productoEditado, setProductoEditado] = useState<Producto | null>(null);
  const [showAlert, setShowAlert] = useState(false); // Estado para controlar el AlertDialog

  // Obtener la colección de productos desde la base de datos
  useEffect(() => {
    const obtenerProductos = async () => {
      const querySnapshot = await getDocs(collection(db, "Productos"));
      const productosObtenidos: Producto[] = [];
      querySnapshot.forEach((doc) => {
        productosObtenidos.push(doc.data() as Producto);
      });
      setProductos(productosObtenidos);
    };

    obtenerProductos();
  }, []);

  // Función para obtener y actualizar el LastId en la colección counters
  const obtenerNuevoId = async () => {
    const docRef = doc(db, "counters", "productosCounters");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const lastId = docSnap.data().LastId;

      // Actualizar el LastId para el siguiente uso
      await updateDoc(docRef, {
        LastId: increment(1),
      });

      return lastId + 1; // Devuelve el nuevo ID incrementado
    } else {
      throw new Error("El documento productosCounters no existe.");
    }
  };

  // Función para agregar un nuevo producto
  const agregarProducto = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const nuevoId = await obtenerNuevoId(); // Obtener el ID autoincremental

      const nuevoProducto: Producto = {
        id: nuevoId,
        nombre: nombreProducto,
        descripcion: descripcionProducto,
        precio: precioProducto,
        cantidad: cantidadProducto, // Guardar la cantidad
        imagenUrl: imagenUrlProducto,
      };

      await setDoc(doc(db, "Productos", nuevoId.toString()), nuevoProducto);
      setProductos([...productos, nuevoProducto]);
      
      // Mostrar el AlertDialog
      setShowAlert(true);

      // Resetear los campos del formulario
      setNombreProducto("");
      setDescripcionProducto("");
      setPrecioProducto(0);
      setCantidadProducto(1); // Resetear la cantidad
      setImagenUrlProducto("");
    } catch (error) {
      console.error("Error al agregar producto con ID autoincremental: ", error);
    }
  };

  // Función para editar un producto
  const editarProducto = (index: number) => {
    const producto = productos[index];
    setProductoEditado(producto);
    setNombreProducto(producto.nombre);
    setDescripcionProducto(producto.descripcion);
    setPrecioProducto(producto.precio);
    setCantidadProducto(producto.cantidad); // Cargar la cantidad
    setImagenUrlProducto(producto.imagenUrl);
  };

  // Función para guardar los cambios al editar un producto
  const guardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();

    if (productoEditado) {
      const productoActualizado: Producto = {
        ...productoEditado,
        nombre: nombreProducto,
        descripcion: descripcionProducto,
        precio: precioProducto,
        cantidad: cantidadProducto, // Guardar la cantidad actualizada
        imagenUrl: imagenUrlProducto,
      };

      try {
        await updateDoc(doc(db, "Productos", productoEditado.id.toString()), {
          nombre: productoActualizado.nombre,
          descripcion: productoActualizado.descripcion,
          precio: productoActualizado.precio,
          cantidad: productoActualizado.cantidad, // Actualizar cantidad
          imagenUrl: productoActualizado.imagenUrl,
        });

        setProductos(
          productos.map((producto) =>
            producto.id === productoEditado.id ? productoActualizado : producto
          )
        );

        // Resetear campos y estado de edición
        setProductoEditado(null);
        setNombreProducto("");
        setDescripcionProducto("");
        setPrecioProducto(0);
        setCantidadProducto(1); // Resetear cantidad
        setImagenUrlProducto("");
      } catch (error) {
        console.error("Error al actualizar producto: ", error);
      }
    }
  };

  // Función para eliminar un producto
  const eliminarProducto = async (index: number) => {
    const producto = productos[index];
    try {
      // Eliminar el producto de la base de datos
      await deleteDoc(doc(db, "Productos", producto.id.toString()));
      
      // Filtrar el producto de la lista local (productos) para actualizar la UI
      setProductos(productos.filter((p) => p.id !== producto.id));
    } catch (error) {
      console.error("Error al eliminar producto: ", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex items-center space-x-4">
        <PackageSearch className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Productos</h1>
      </div>

      <Card className="border-2 border-gray-100">
        <CardHeader className="border-b bg-gray-50/50">
          <div className="flex items-center space-x-2">
            {productoEditado ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            <h2 className="text-2xl font-semibold">
              {productoEditado ? "Editar Producto" : "Agregar Producto"}
            </h2>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={productoEditado ? guardarCambios : agregarProducto} className="space-y-5">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombreProducto">Nombre del Producto</Label>
                <Input
                  id="nombreProducto"
                  value={nombreProducto}
                  onChange={(e) => setNombreProducto(e.target.value)}
                  required
                  className="focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcionProducto">Descripción</Label>
                <Input
                  id="descripcionProducto"
                  value={descripcionProducto}
                  onChange={(e) => setDescripcionProducto(e.target.value)}
                  required
                  className="focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precioProducto">Precio ($)</Label>
                <Input
                  id="precioProducto"
                  type="number"
                  value={precioProducto}
                  onChange={(e) => setPrecioProducto(Number(e.target.value))}
                  required
                  className="focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cantidadProducto">Cantidad</Label>
                <Input
                  id="cantidadProducto"
                  type="number"
                  value={cantidadProducto}
                  onChange={(e) => setCantidadProducto(Number(e.target.value))}
                  required
                  min={1}
                  className="focus-visible:ring-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="imagenUrlProducto">URL de Imagen</Label>
              <Input
                id="imagenUrlProducto"
                value={imagenUrlProducto}
                onChange={(e) => setImagenUrlProducto(e.target.value)}
                required
                className="focus-visible:ring-primary"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full gap-2 text-base"
            >
              {productoEditado ? (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Agregar Producto
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Lista de Productos</h2>
          <div className="h-1 flex-1 mx-4 bg-gradient-to-r from-primary/20 to-transparent" />
        </div>

        {productos.length > 0 ? (
          <div className="grid gap-6">
            {productos.map((producto, index) => (
              <div
                key={producto.id}
                className="group relative bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold text-gray-900">{producto.nombre}</h3>
                      <p className="text-gray-600">{producto.descripcion}</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-medium">
                        ${producto.precio}
                      </div>
                      <div className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 font-medium">
                        Stock: {producto.cantidad}
                      </div>
                    </div>
                  </div>

                  {producto.imagenUrl && (
                    <div className="relative flex-shrink-0">
                      <img
                        src={producto.imagenUrl}
                        alt={producto.nombre}
                        className="w-32 h-32 object-cover rounded-lg shadow-sm"
                      />
                    </div>
                  )}

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editarProducto(index)}
                      className="gap-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => eliminarProducto(index)}
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
            <p className="text-gray-500 text-lg">No hay productos disponibles.</p>
          </div>
        )}
      </div>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>¡Producto Agregado!</AlertDialogTitle>
            <AlertDialogDescription>
              El producto ha sido agregado correctamente al inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end">
            <AlertDialogCancel onClick={() => setShowAlert(false)}>
              Cerrar
            </AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};