"use client";
import { useState, useEffect, ChangeEvent } from "react";
import dynamic from "next/dynamic";
import L, { LatLngExpression } from "leaflet";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import "leaflet/dist/leaflet.css"; 
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";

// Firebase
import { collection, addDoc, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig"; 

const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });

const customMarker = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function RepartoForm() {
  const [repartidor, setRepartidor] = useState("");
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<any>(null);
  const [direccion, setDireccion] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState<string>(new Date().toISOString().split('T')[0]);
  const [ubicaciones, setUbicaciones] = useState<
    Array<{ repartidor: string; direccion: string; fechaEntrega: string; lat: number; lon: number }>
  >([]);
  const [repartidores, setRepartidores] = useState<string[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [position, setPosition] = useState<LatLngExpression>([-26.8241, -65.2226]);

  useEffect(() => {
    // Fetch repartidores
    const fetchRepartidores = async () => {
      const querySnapshot = await getDocs(collection(db, "Repartidores"));
      const repartidoresData: string[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        repartidoresData.push(data.Nombre);
      });

      setRepartidores(repartidoresData);
    };

    // Fetch pedidos 
    const fetchPedidosSinReparto = async () => {
      const q = query(collection(db, "Pedidos"));
      const querySnapshot = await getDocs(q);
      const pedidosData: any[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        pedidosData.push({
          id: doc.id,
          cantidad: data.cantidad,
          cliente: data.cliente,
          direccionCliente: data.direccionCliente,
          fechaEntrega: data.fechaEntrega,
          producto: data.producto
        });
      });

      setPedidos(pedidosData);
    };

    // Fetch existing repartos
    const fetchReparto = async () => {
      const querySnapshot = await getDocs(collection(db, "Reparto"));
      const RepartoData: Array<{ repartidor: string; direccion: string; fechaEntrega: string; lat: number; lon: number }> = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        RepartoData.push({
          repartidor: data.repartidor,
          direccion: data.direccion,
          fechaEntrega: data.fechaEntrega,
          lat: data.lat,
          lon: data.lon,
        });
      });

      setUbicaciones(RepartoData);
    };

    fetchRepartidores();
    fetchPedidosSinReparto();
    fetchReparto();
  }, []);

  const handlePedidoSelect = (pedidoId: string) => {
    const pedido = pedidos.find(p => p.id === pedidoId);
    setPedidoSeleccionado(pedido);
    setDireccion(pedido.direccionCliente); // Changed from pedido.direccion to pedido.direccionCliente
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fullAddress = `${direccion}, San Miguel de Tucumán, Argentina`;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`
      );
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];
        const newPosition: LatLngExpression = [parseFloat(lat), parseFloat(lon)];

        // Actualizar estado de ubicaciones
        setUbicaciones([
          ...ubicaciones,
          { repartidor, direccion, fechaEntrega, lat: parseFloat(lat), lon: parseFloat(lon) },
        ]);
        setPosition(newPosition);

        // Guardar reparto en Firebase
        await addDoc(collection(db, "Reparto"), {
          repartidor,
          direccion,
          fechaEntrega,
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          pedidoId: pedidoSeleccionado?.id
        });

        // Actualizar estado del pedido
        if (pedidoSeleccionado) {
          // Actualiza el pedido a "entregado" o el estado que corresponda
          console.log("Actualizar estado del pedido:", pedidoSeleccionado.id);
        }

        alert("Entrega registrada con éxito");
        
        // Resetear formulario
        setRepartidor("");
        setPedidoSeleccionado(null);
        setDireccion("");
      } else {
        alert("Dirección no encontrada");
      }
    } catch (error) {
      console.error("Error al buscar la dirección:", error);
    }
  };

  const handleDownloadPDF = async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    const headerFontSize = 16;
    let yOffset = 750;

    // Título del PDF
    page.drawText("Hoja de Ruta", {
      x: 50,
      y: yOffset,
      size: headerFontSize,
      font,
      color: rgb(0, 0, 0),
    });

    yOffset -= 30;

    // Información del encabezado (más detallada)
    page.drawText("Fecha de Generación: " + new Date().toLocaleDateString(), {
      x: 50,
      y: yOffset,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });

    yOffset -= 30;

    // Tablón con la información de las entregas
    page.drawText("Entregas Registradas", {
      x: 50,
      y: yOffset,
      size: headerFontSize,
      font,
      color: rgb(0, 0, 0),
    });

    yOffset -= 20;

    // Columnas de la tabla
    page.drawText("Repartidor", {
      x: 50,
      y: yOffset,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
    page.drawText("Dirección", {
      x: 150,
      y: yOffset,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
    page.drawText("Fecha de Entrega", {
      x: 300,
      y: yOffset,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });

    yOffset -= 20;

    // Listado de entregas
    ubicaciones.forEach((ubicacion, index) => {
      page.drawText(`${index + 1}.`, {
        x: 50,
        y: yOffset,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      page.drawText(ubicacion.repartidor, {
        x: 70,
        y: yOffset,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      page.drawText(ubicacion.direccion, {
        x: 150,
        y: yOffset,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      page.drawText(ubicacion.fechaEntrega, {
        x: 300,
        y: yOffset,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });

      yOffset -= 20;
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Hoja_de_Ruta.pdf";
    a.click();
    URL.revokeObjectURL(url);
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
      setErrorMessage("No se puede seleccionar una fecha anterior al día actual");
      setShowErrorDialog(true);
      // Establecer la fecha actual como valor por defecto
      setFechaEntrega(new Date().toISOString().split('T')[0]);
    } else {
      setFechaEntrega(newDate);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Formulario de Registro */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Registro de Reparto</h2>
            <p className="text-sm text-muted-foreground">
              Ingresa los detalles del nuevo reparto
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Repartidor</Label>
                <Select value={repartidor} onValueChange={setRepartidor}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un repartidor" />
                  </SelectTrigger>
                  <SelectContent>
                    {repartidores.map((repartidor) => (
                      <SelectItem key={repartidor} value={repartidor}>
                        {repartidor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Pedido</Label>
                <Select value={pedidoSeleccionado?.id || ""} onValueChange={handlePedidoSelect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un pedido" />
                  </SelectTrigger>
                  <SelectContent>
                    {pedidos.map((pedido) => (
                      <SelectItem key={pedido.id} value={pedido.id}>
                        {pedido.cliente} - {pedido.producto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Dirección</Label>
                <Input
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Dirección de entrega"
                  className="w-full"
                />
              </div>

              {/* Actualizar el input de fecha en el formulario */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Fecha de Entrega</Label>
        <Input
          type="date"
          value={fechaEntrega}
          onChange={handleDateChange}
          min={new Date().toISOString().split('T')[0]}
          className="w-full"
        />
      </div>

              <Button type="submit" className="w-full">
                Registrar Entrega
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={handleDownloadPDF}
              variant="outline"
              className="flex items-center gap-2"
            >
              Descargar PDF
            </Button>
          </CardFooter>
        </Card>

        {/* Mapa */}
        <Card className="shadow-lg z-0">
          <CardHeader>
            <h2 className="text-2xl font-bold tracking-tight">Ubicaciones de Reparto</h2>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[500px] rounded-md overflow-hidden">
              <MapContainer 
                center={position} 
                zoom={13} 
                className="h-full w-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {ubicaciones.map((ubicacion, index) => (
                  <Marker
                    key={index}
                    position={[ubicacion.lat, ubicacion.lon]}
                    icon={customMarker}
                  >
                    <div>{`${ubicacion.repartidor} - ${ubicacion.direccion}`}</div>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Repartos */}
      <Card className="shadow-lg">
        <CardHeader className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Lista de Repartos</h2>
          <p className="text-sm text-muted-foreground">
            Historial de todos los repartos registrados
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Repartidor</TableHead>
                  <TableHead className="font-semibold">Dirección</TableHead>
                  <TableHead className="font-semibold">Fecha de Entrega</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ubicaciones.map((ubicacion, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{ubicacion.repartidor}</TableCell>
                    <TableCell>{ubicacion.direccion}</TableCell>
                    <TableCell>{ubicacion.fechaEntrega}</TableCell>
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
function setErrorMessage(arg0: string) {
  throw new Error("Function not implemented.");
}

function setShowErrorDialog(arg0: boolean) {
  throw new Error("Function not implemented.");
}

