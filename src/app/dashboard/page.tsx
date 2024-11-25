"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig"; // O la ruta de tu archivo de configuración
import { collection, query, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, Users, Calendar, TrendingUp, Activity, ShoppingCart, Clock } from "lucide-react";

// Funciones para obtener los datos de Firebase
const getTotalVentas = async () => {
  const ventasRef = collection(db, "Ventas");
  const q = query(ventasRef);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.reduce((total, doc) => total + doc.data().total, 0);
};

const getCantidadProductosRegistrados = async () => {
  const productosRef = collection(db, "Productos");
  const q = query(productosRef);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.size; // Total de productos registrados
};

const getClientesAtendidos = async () => {
  const clientesRef = collection(db, "Clientes");
  const q = query(clientesRef);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.size; // Total de clientes atendidos
};

const getPedidosRealizados = async () => {
  const pedidosRef = collection(db, "Pedidos");
  const q = query(pedidosRef);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.size; // Total de pedidos realizados
};

export default function Dashboard() {
  const [totalVentas, setTotalVentas] = useState(0);
  const [cantidadProductos, setCantidadProductos] = useState(0);
  const [clientesAtendidos, setClientesAtendidos] = useState(0);
  const [pedidosRealizados, setPedidosRealizados] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setTotalVentas(await getTotalVentas());
        setCantidadProductos(await getCantidadProductosRegistrados());
        setClientesAtendidos(await getClientesAtendidos());
        setPedidosRealizados(await getPedidosRealizados());
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Resumen de métricas principales
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Última actualización: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Cargando datos...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-6">
            {/* Primera Fila */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Total Ventas Card */}
              <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-teal-500/10 transition-opacity duration-300 group-hover:opacity-80" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium group-hover:text-green-600 transition-colors">
                    Total Ventas
                  </CardTitle>
                  <div className="p-2 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col">
                    <div className="text-3xl font-bold group-hover:text-green-600 transition-colors">
                      ${totalVentas}
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Productos Registrados Card */}
              <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 transition-opacity duration-300 group-hover:opacity-80" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium group-hover:text-indigo-600 transition-colors">
                    Productos Registrados
                  </CardTitle>
                  <div className="p-2 rounded-full bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
                    <Package className="h-6 w-6 text-indigo-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col">
                    
                  <div className="text-3xl font-bold group-hover:text-indigo-600 transition-colors">
                      {cantidadProductos}
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Productos activos</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Segunda Fila */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Clientes Atendidos Card */}
              <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-sky-500/10 transition-opacity duration-300 group-hover:opacity-80" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium group-hover:text-blue-600 transition-colors">
                    Clientes Atendidos
                  </CardTitle>
                  <div className="p-2 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col">
                    <div className="text-3xl font-bold group-hover:text-blue-600 transition-colors">
                      {clientesAtendidos}
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pedidos Realizados Card */}
              <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 transition-opacity duration-300 group-hover:opacity-80" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium group-hover:text-orange-600 transition-colors">
                    Pedidos Realizados
                  </CardTitle>
                  <div className="p-2 rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col">
                    <div className="text-3xl font-bold group-hover:text-orange-600 transition-colors">
                      {pedidosRealizados}
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
