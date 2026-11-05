// src/App.jsx
// App principal - Almacén de Perforación (Offline-First)

import { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import EditarSalida from "./components/EditarSalida";
import autoTable from "jspdf-autotable";
import DetalleSalida from "./components/DetalleSalida";
import { sincronizar } from "./db/sync";
import NombreOperador from "./components/NombreOperador";
import DateSelector from "./components/DateSelector";
import ItemForm from "./components/ItemForm";
import {
  getDB,
  crearSalida,
  obtenerSalidasPorFecha,
  obtenerTodasLasSalidas,
  eliminarSalida,
  guardarSalida,
} from "./db/database";

export default function App() {
  const hoy = () => {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mes}-${dia}`;
  };
  const [fecha, setFecha] = useState(hoy());
  const [operador, setOperador] = useState(localStorage.getItem("operador_default") || "");
  const [editandoNombre, setEditandoNombre] = useState(!localStorage.getItem("operador_default"));

  const guardarNombre = (nombre) => {
    localStorage.setItem("operador_default", nombre);
    setOperador(nombre);
    setEditandoNombre(false);
  };
  const [salidas, setSalidas] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [salidaVistaId, setSalidaVistaId] = useState(null);
  const [salidaEditando, setSalidaEditando] = useState(null);
  const salidaVista = salidas.find((s) => s.id === salidaVistaId) || null;

  // Para que los listeners de conexión siempre vean la fecha actual
  const fechaRef = useRef("");
  useEffect(() => {
    fechaRef.current = fecha;
  }, [fecha]);

  // Cargar salidas de una fecha
  const cargarSalidasPorFecha = async (f) => {
    if (!f) {
      setSalidas([]);
      return;
    }
    const lista = await obtenerSalidasPorFecha(f);
    setSalidas(lista);
  };

  // Sincronizar salidas pendientes (por ahora simulado)
  const syncSalidas = async () => {
    if (!navigator.onLine) return;
    await sincronizar();
    if (fechaRef.current) {
      await cargarSalidasPorFecha(fechaRef.current);
    }
  };

  // Detectar conexión
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncSalidas().catch((err) => console.error("Error al sincronizar:", err));
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Abrir la base de datos al cargar
  useEffect(() => {
    getDB()
      .then(() => cargarSalidasPorFecha(fecha))
      .then(() => syncSalidas())
      .catch((err) => console.error("Error al iniciar:", err));
  }, []);

  const handleChangeFecha = async (fechaSeleccionada) => {
    setFecha(fechaSeleccionada);
    await cargarSalidasPorFecha(fechaSeleccionada);
  };

  // Guardar una salida nueva en la base local
  const handleActualizar = async (salidaData) => {
    if (!fecha) {
      alert("Primero selecciona una fecha");
      return false;
    }
    try {
      await crearSalida({ ...salidaData, fecha });
      await cargarSalidasPorFecha(fecha);
      syncSalidas().catch((err) => console.error("Error al sincronizar:", err));
      return true;
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar la salida: " + err.message);
      return false;
    }
  };

  const handleEliminarSalida = async (salidaId) => {
    if (!window.confirm("¿Estás seguro de eliminar esta salida?")) return;
    try {
      await eliminarSalida(salidaId);
      await cargarSalidasPorFecha(fecha);
      syncSalidas().catch((err) => console.error("Error al sincronizar:", err));
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar: " + err.message);
    }
  };

  const handleGuardarEdicion = async (salidaEditada) => {
    try {
      await guardarSalida(salidaEditada);
      setSalidaEditando(null);
      await cargarSalidasPorFecha(fecha);
      syncSalidas().catch((err) => console.error("Error al sincronizar:", err));
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar los cambios: " + err.message);
    }
  };

  const handleSyncClick = async () => {
    if (!isOnline) {
      alert("Sin conexión. Se sincronizará cuando regrese el internet.");
      return;
    }
    try {
      await syncSalidas();
    } catch (err) {
      console.error(err);
      alert("Error al sincronizar: " + err.message);
    }
  };

  // Descargar todas las salidas guardadas en este dispositivo
  const descargarReporte = async () => {
    const lista = await obtenerSalidasPorFecha(fecha);
    if (lista.length === 0) {
      alert("No hay salidas guardadas para esta fecha");
      return;
    }

    // Una fila por item
    const filas = [];
    lista.forEach((s) => {
      (s.items || []).forEach((it) => {
        filas.push([
          s.operador,
          it.nombre,
          it.sku || "-",
          it.cantidad,
          it.id_maquina || "-",
          it.notas || "",
        ]);
      });
    });

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Salidas de almacén - Perforación", 14, 16);
    doc.setFontSize(11);
    doc.text(`Fecha: ${fecha}`, 14, 24);

    autoTable(doc, {
      startY: 30,
      head: [["Operador", "Item", "SKU", "Cant.", "Máquina", "Notas"]],
      body: filas,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [40, 167, 69] },
    });

    doc.save(`salidas_${fecha}.pdf`);
  };

  const celda = { padding: "8px", borderBottom: "1px solid #ddd" };

  return (
    <div style={{ padding: "10px" }}>
      {/* Encabezado */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#f8f9fa",
          color: "#222",
          borderRadius: "8px",
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 5px 0", fontSize: "20px" }}>📦 Almacén de Perforación</h1>
          <p style={{ margin: 0, fontSize: "12px", color: isOnline ? "#28a745" : "#b8860b" }}>
            {isOnline ? "✅ Conexión activa" : "⚠️ Modo Offline - Los datos se guardarán localmente"}
          </p>
          <button
            type="button"
            onClick={() => setEditandoNombre(true)}
            style={{
              marginTop: "6px",
              padding: "4px 10px",
              background: "transparent",
              color: "#222",
              border: "1px solid #aaa",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            👤 {operador || "Sin nombre"} ✏️
          </button>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={descargarReporte}
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            📥 Descargar
          </button>

          <button
            onClick={handleSyncClick}
            style={{
              padding: "8px 16px",
              backgroundColor: isOnline ? "#28a745" : "#6c757d",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            🔄 Sincronizar
          </button>
        </div>
      </header>

      {/* Selector de fecha */}
      <DateSelector value={fecha} onChange={handleChangeFecha} />

      {/* Salidas existentes de esta fecha */}
      {salidas.length > 0 && (
        <div style={{ margin: "20px 0" }}>
          <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>Salidas para {fecha}:</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0", color: "#222" }}>
                <th style={{ ...celda, textAlign: "left" }}>Operador</th>
                <th style={celda}>Items</th>
                <th style={celda}>Estado</th>
                <th style={celda}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {salidas.map((s) => (
                <tr key={s.id}>
                  <td style={celda}>{s.operador}</td>
                  <td style={{ ...celda, textAlign: "center" }}>{(s.items || []).length}</td>
                  <td style={{ ...celda, textAlign: "center" }}>
                    {s.estado_sync === "synced" ? "☁️ Enviada" : "📱 Local"}
                  </td>
                  <td style={{ ...celda, textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                      <button
                        onClick={() => setSalidaVistaId(s.id)}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#007bff",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleEliminarSalida(s.id)}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#dc3545",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Formulario para agregar items */}
      <ItemForm fecha={fecha} operador={operador} onActualizar={handleActualizar} />
      <DetalleSalida
        salida={salidaVista}
        onCerrar={() => setSalidaVistaId(null)}
        onEditar={() => {
          setSalidaEditando(salidaVista);
          setSalidaVistaId(null);
        }}
      />

      {salidaEditando && (
        <EditarSalida
          key={salidaEditando.id}
          salida={salidaEditando}
          onGuardar={handleGuardarEdicion}
          onCancelar={() => setSalidaEditando(null)}
        />
      )}

      {editandoNombre && (
        <NombreOperador
          valorInicial={operador}
          onGuardar={guardarNombre}
          onCancelar={operador ? () => setEditandoNombre(false) : null}
        />
      )}
    </div>
  );
}
