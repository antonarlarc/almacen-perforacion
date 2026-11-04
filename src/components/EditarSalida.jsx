// src/components/EditarSalida.jsx
// Ventana para editar los items de una salida ya guardada

import { useState } from "react";

const NUEVO_VACIO = { nombre: "", sku: "", cantidad: 1, id_maquina: "", notas: "" };

const campo = {
  width: "100%",
  padding: "8px",
  fontSize: "16px",
  boxSizing: "border-box",
  background: "#fff",
  color: "#222",
  border: "1px solid #aaa",
  borderRadius: "6px",
};

export default function EditarSalida({ salida, onGuardar, onCancelar }) {
  const [items, setItems] = useState(() => (salida.items || []).map((it) => ({ ...it })));
  const [nuevo, setNuevo] = useState(NUEVO_VACIO);
  const [guardando, setGuardando] = useState(false);

  const cambiarItem = (i, nombreCampo, valor) => {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [nombreCampo]: valor } : it)));
  };

  const quitarItem = (i) => {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  };

  const agregarNuevo = () => {
    if (!nuevo.nombre.trim()) {
      alert("Escribe el nombre del item");
      return;
    }
    if (!nuevo.id_maquina.trim()) {
      alert("Escribe la máquina");
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        ...nuevo,
        nombre: nuevo.nombre.trim(),
        cantidad: parseInt(nuevo.cantidad) || 1,
        nombre_maquina: "",
        idSalida: salida.id,
      },
    ]);
    setNuevo(NUEVO_VACIO);
  };

  const guardar = async () => {
    if (items.length === 0) {
      alert("La salida debe tener al menos un item. Si quieres quitarla por completo, elimínala desde la tabla.");
      return;
    }
    if (items.some((it) => !(parseInt(it.cantidad) >= 1))) {
      alert("Todas las cantidades deben ser 1 o más");
      return;
    }
    setGuardando(true);
    await onGuardar({
      ...salida,
      items: items.map((it) => ({ ...it, cantidad: parseInt(it.cantidad) })),
    });
    setGuardando(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px",
        zIndex: 1100,
      }}
    >
      <div
        style={{
          background: "#fff",
          color: "#222",
          borderRadius: "10px",
          width: "100%",
          maxWidth: "500px",
          maxHeight: "92vh",
          overflowY: "auto",
          padding: "16px",
        }}
      >
        <h3 style={{ margin: "0 0 4px 0" }}>Editar salida</h3>
        <p style={{ margin: "0 0 12px 0", fontSize: "14px" }}>
          {salida.fecha} · {salida.operador}
        </p>

        {items.map((it, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "10px",
              marginBottom: "10px",
              background: "#f8f9fa",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
              {it.nombre} {it.sku ? <small>({it.sku})</small> : null}
            </div>

            <label style={{ fontSize: "13px" }}>Cantidad</label>
            <input
              type="number"
              min="1"
              value={it.cantidad}
              onChange={(e) => cambiarItem(i, "cantidad", e.target.value)}
              style={{ ...campo, marginBottom: "6px" }}
            />

            <label style={{ fontSize: "13px" }}>Máquina</label>
            <input
              type="text"
              value={it.id_maquina || ""}
              onChange={(e) => cambiarItem(i, "id_maquina", e.target.value)}
              style={{ ...campo, marginBottom: "6px" }}
            />

            <label style={{ fontSize: "13px" }}>Notas</label>
            <textarea
              rows="2"
              value={it.notas || ""}
              onChange={(e) => cambiarItem(i, "notas", e.target.value)}
              style={{ ...campo, marginBottom: "8px" }}
            />

            <button
              type="button"
              onClick={() => quitarItem(i)}
              style={{
                padding: "6px 12px",
                background: "#dc3545",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              🗑️ Quitar item
            </button>
          </div>
        ))}

        {/* Agregar un item nuevo */}
        <div
          style={{
            border: "2px dashed #28a745",
            borderRadius: "8px",
            padding: "10px",
            marginBottom: "12px",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "6px" }}>➕ Agregar item</div>

          <input
            type="text"
            placeholder="Nombre del item"
            value={nuevo.nombre}
            onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
            style={{ ...campo, marginBottom: "6px" }}
          />
          <input
            type="text"
            placeholder="SKU (opcional)"
            value={nuevo.sku}
            onChange={(e) => setNuevo({ ...nuevo, sku: e.target.value })}
            style={{ ...campo, marginBottom: "6px" }}
          />
          <input
            type="number"
            min="1"
            placeholder="Cantidad"
            value={nuevo.cantidad}
            onChange={(e) => setNuevo({ ...nuevo, cantidad: e.target.value })}
            style={{ ...campo, marginBottom: "6px" }}
          />
          <input
            type="text"
            placeholder="Máquina (Ej: M-01)"
            value={nuevo.id_maquina}
            onChange={(e) => setNuevo({ ...nuevo, id_maquina: e.target.value })}
            style={{ ...campo, marginBottom: "6px" }}
          />
          <textarea
            rows="2"
            placeholder="Notas"
            value={nuevo.notas}
            onChange={(e) => setNuevo({ ...nuevo, notas: e.target.value })}
            style={{ ...campo, marginBottom: "8px" }}
          />
          <button
            type="button"
            onClick={agregarNuevo}
            style={{
              padding: "8px 14px",
              background: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Agregar a la salida
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={onCancelar}
            disabled={guardando}
            style={{
              flex: 1,
              padding: "12px",
              fontSize: "16px",
              background: "#6c757d",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            style={{
              flex: 1,
              padding: "12px",
              fontSize: "16px",
              background: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            {guardando ? "Guardando..." : "💾 Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}