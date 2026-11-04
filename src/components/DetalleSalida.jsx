// src/components/DetalleSalida.jsx
// Ventana con el detalle de una salida

export default function DetalleSalida({ salida, onCerrar, onEditar }) {
  if (!salida) return null;

  const items = salida.items || [];
  const totalPiezas = items.reduce((suma, it) => suma + (Number(it.cantidad) || 0), 0);

  return (
    <div
      onClick={onCerrar}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          color: "#222",
          borderRadius: "10px",
          width: "100%",
          maxWidth: "500px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "16px",
        }}
      >
        <h3 style={{ margin: "0 0 8px 0" }}>Detalle de la salida</h3>

        <p style={{ margin: "2px 0" }}><strong>Fecha:</strong> {salida.fecha}</p>
        <p style={{ margin: "2px 0" }}><strong>Operador:</strong> {salida.operador}</p>
        <p style={{ margin: "2px 0" }}><strong>Turno:</strong> {salida.turno || "1"}</p>
        <p style={{ margin: "2px 0" }}>
          <strong>Estado:</strong> {salida.estado_sync === "synced" ? "☁️ Enviada" : "📱 Local"}
        </p>

        <h4 style={{ margin: "16px 0 8px 0" }}>
          Items ({items.length}) · {totalPiezas} piezas
        </h4>

        {items.length === 0 && <p>Esta salida no tiene items.</p>}

        {items.map((it, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "10px",
              marginBottom: "8px",
              background: "#f8f9fa",
            }}
          >
            <div style={{ fontWeight: "bold" }}>
              {it.cantidad} × {it.nombre}
            </div>
            <div style={{ fontSize: "14px" }}>SKU: {it.sku || "-"}</div>
            <div style={{ fontSize: "14px" }}>Máquina: {it.id_maquina || "-"}</div>
            {it.notas && <div style={{ fontSize: "14px" }}>Notas: {it.notas}</div>}
          </div>
        ))}
        {onEditar && (
          <button
            type="button"
            onClick={onEditar}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              fontSize: "16px",
              background: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            ✏️ Editar salida
          </button>
        )}
        <button
          type="button"
          onClick={onCerrar}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "8px",
            fontSize: "16px",
            background: "#6c757d",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}