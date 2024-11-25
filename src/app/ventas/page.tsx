"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebaseConfig"; 
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from "firebase/firestore"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, Users, Package, DollarSign } from "lucide-react";

interface Venta {
  cliente: string;
  producto: string;
  cantidad: number;
  vendedor: string;
  fecha: string;
  precio: number;
  total: number;
}

interface Cliente {
  nombreCliente: string;
}

interface Vendedor {
  Nombre: string;
}

interface Producto {
  nombre: string;
  precio: number;
  cantidad: number; // Se añade el campo cantidad al Producto
}

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cliente, setCliente] = useState<string>("");
  const [producto, setProducto] = useState<string>("");
  const [cantidad, setCantidad] = useState<number>(0);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [vendedor, setVendedor] = useState<string>("");
  const [fecha, setFecha] = useState<string>(new Date().toLocaleDateString());
  const [precioProducto, setPrecioProducto] = useState<number>(0);

  // Obtener ventas desde la base de datos
  useEffect(() => {
    const obtenerVentas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Ventas"));
        const ventasObtenidas: Venta[] = querySnapshot.docs.map((doc) => doc.data() as Venta);
        setVentas(ventasObtenidas);
      } catch (error) {
        console.error("Error al obtener las ventas: ", error);
      }
    };

    obtenerVentas();
  }, []); 

  // Obtener clientes desde la base de datos
  useEffect(() => {
    const obtenerClientes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Clientes"));
        const clientesObtenidos: Cliente[] = querySnapshot.docs.map((doc) => doc.data() as Cliente);
        setClientes(clientesObtenidos);
      } catch (error) {
        console.error("Error al obtener los clientes: ", error);
      }
    };

    obtenerClientes();
  }, []);

  // Obtener productos y precios de la base de datos
  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Productos"));
        const productos: Producto[] = querySnapshot.docs.map((doc) => ({
          nombre: doc.data().nombre,
          precio: doc.data().precio,
          cantidad: doc.data().cantidad, // Aseguramos que se obtenga la cantidad disponible
        }));
        setProductosDisponibles(productos);
      } catch (error) {
        console.error("Error al obtener los productos: ", error);
      }
    };

    obtenerProductos();
  }, []);

  // Obtener vendedores desde la base de datos
  useEffect(() => {
    const obtenerVendedores = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Vendedores"));
        const vendedoresObtenidos: Vendedor[] = querySnapshot.docs.map((doc) => doc.data() as Vendedor);
        setVendedores(vendedoresObtenidos);
      } catch (error) {
        console.error("Error al obtener los vendedores: ", error);
      }
    };

    obtenerVendedores();
  }, []);

  // Actualizar el precio del producto al seleccionar uno
  const actualizarPrecioProducto = (productoSeleccionado: string) => {
    const productoEncontrado = productosDisponibles.find(
      (prod) => prod.nombre === productoSeleccionado
    );
    if (productoEncontrado) {
      setPrecioProducto(productoEncontrado.precio);
    }
  };

  const registrarVenta = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    try {
      // Obtener la referencia actual del producto
      const productosRef = collection(db, "Productos");
      const q = query(productosRef, where("nombre", "==", producto));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        alert("Producto no encontrado");
        return;
      }

      const productoDoc = querySnapshot.docs[0];
      const productoActual = productoDoc.data() as Producto;

      // Verificar si hay suficiente stock
      if (productoActual.cantidad < cantidad) {
        alert(`No hay suficiente stock. Stock disponible: ${productoActual.cantidad}`);
        return;
      }

      // Calcular el total de la venta
      const totalVenta = precioProducto * cantidad;
      
      // Crear el objeto de venta
      const nuevaVenta: Venta = {
        cliente,
        producto,
        cantidad,
        vendedor,
        fecha,
        precio: precioProducto,
        total: totalVenta,
      };

      // Registrar la venta
      await addDoc(collection(db, "Ventas"), nuevaVenta);
      
      // Actualizar el stock del producto
      const nuevaCantidad = productoActual.cantidad - cantidad;
      await updateDoc(productoDoc.ref, {
        cantidad: nuevaCantidad
      });

      // Actualizar el estado local de ventas
      setVentas([...ventas, nuevaVenta]);
      
      // Actualizar el estado local de productos disponibles
      setProductosDisponibles(productosDisponibles.map(prod => 
        prod.nombre === producto 
          ? { ...prod, cantidad: nuevaCantidad }
          : prod
      ));

      // Limpiar el formulario
      setCliente("");
      setProducto("");
      setCantidad(0);
      setVendedor("");
      setPrecioProducto(0);

      
    } catch (error) {
      console.error("Error al registrar la venta: ", error);
      alert("Error al registrar la venta");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card className="bg-blue-50">
          <CardContent className="flex items-center p-6">
            <div className="rounded-full bg-blue-500 p-3 mr-4">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Ventas</p>
              <h3 className="text-2xl font-bold">{ventas.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50">
          <CardContent className="flex items-center p-6">
            <div className="rounded-full bg-green-500 p-3 mr-4">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Ventas del Día</p>
              <h3 className="text-2xl font-bold">
                ${ventas
                  .filter(v => v.fecha === new Date().toLocaleDateString())
                  .reduce((acc, v) => acc + v.total, 0)
                  .toLocaleString()}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50">
          <CardContent className="flex items-center p-6">
            <div className="rounded-full bg-purple-500 p-3 mr-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Clientes</p>
              <h3 className="text-2xl font-bold">{clientes.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50">
          <CardContent className="flex items-center p-6">
            <div className="rounded-full bg-orange-500 p-3 mr-4">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Productos</p>
              <h3 className="text-2xl font-bold">{productosDisponibles.length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Nueva Venta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={registrarVenta} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cliente" className="text-sm font-medium">
                  Cliente
                </Label>
                <Select onValueChange={(value) => setCliente(value)} value={cliente} required>
                  <SelectTrigger id="cliente" className="w-full">
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente, index) => (
                      <SelectItem key={index} value={cliente.nombreCliente}>
                        {cliente.nombreCliente}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="producto" className="text-sm font-medium">
                  Producto
                </Label>
                <Select
                  onValueChange={(value) => {
                    setProducto(value);
                    actualizarPrecioProducto(value);
                  }}
                  value={producto}
                  required
                >
                  <SelectTrigger id="producto" className="w-full">
                    <SelectValue placeholder="Seleccionar producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {productosDisponibles.map((prod, index) => (
                      <SelectItem key={index} value={prod.nombre}>
                        {`${prod.nombre} - $${prod.precio} (Stock: ${prod.cantidad})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cantidad" className="text-sm font-medium">
                    Cantidad
                  </Label>
                  <Input
                    type="number"
                    id="cantidad"
                    value={cantidad}
                    onChange={(e) => setCantidad(Number(e.target.value))}
                    min={1}
                    max={producto && productosDisponibles.find((prod) => prod.nombre === producto)?.cantidad}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="precio" className="text-sm font-medium">
                    Precio Unitario
                  </Label>
                  <Input
                    type="number"
                    id="precio"
                    value={precioProducto}
                    disabled
                    className="w-full bg-gray-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendedor" className="text-sm font-medium">
                  Vendedor
                </Label>
                <Select onValueChange={(value) => setVendedor(value)} value={vendedor} required>
                  <SelectTrigger id="vendedor" className="w-full">
                    <SelectValue placeholder="Seleccionar vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendedores.map((vendedor, index) => (
                      <SelectItem key={index} value={vendedor.Nombre}>
                        {vendedor.Nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha" className="text-sm font-medium">
                  Fecha
                </Label>
                <Input
                  type="text"
                  id="fecha"
                  value={fecha}
                  disabled
                  className="w-full bg-gray-50"
                />
              </div>

              <CardFooter className="px-0 pt-6">
                <Button type="submit" className="w-full">
                  Registrar Venta
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Últimas Ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ventas.slice(-5).map((venta, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{venta.cliente}</TableCell>
                      <TableCell>{venta.producto}</TableCell>
                      <TableCell className="text-right">{venta.cantidad}</TableCell>
                      <TableCell className="text-right">${venta.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Historial de Ventas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ventas.map((venta, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{venta.cliente}</TableCell>
                    <TableCell>{venta.producto}</TableCell>
                    <TableCell>{venta.vendedor}</TableCell>
                    <TableCell>{venta.fecha}</TableCell>
                    <TableCell className="text-right">{venta.cantidad}</TableCell>
                    <TableCell className="text-right">${venta.precio}</TableCell>
                    <TableCell className="text-right">${venta.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
