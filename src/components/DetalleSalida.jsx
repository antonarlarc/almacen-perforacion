// src/components/DetalleSalida.jsx
// Ventana con el detalle de una salida y control de captura en CONTPAQi

export default function DetalleSalida({ salida, onCerrar, onEditar, onActualizarItems }) {
  if (!salida) return null;

  const items = salida.items || [];
  const totalPiezas = items.reduce((suma, it) => suma + (Number(it.cantidad) || 0), 0);
  const capturados = items.filter((it) => it.capturado).length;
  const todosCapturados = items.length > 0 && capturados === items.length;

  const cambiarCapturado = (index) => {
    if (!onActualizarItems) return;
    onActualizarItems(
      items.map((it, i) => (i === index ? { ...it, capturado: !it.capturado } : it))
    );
  };

  const marcarTodos = () => {
    if (!onActualizarItems) return;
    onActualizarItems(items.map((it) => ({ ...it, capturado: !todosCapturados })));
  };

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

        <h4 style={{ margin: "16px 0 4px 0" }}>
          Items ({items.length}) · {totalPiezas} piezas
        </h4>

        <div
          style={{
            margin: "0 0 10px 0",
            padding: "8px",
            borderRadius: "6px",
            fontWeight: "bold",
            background: todosCapturados ? "#d4edda" : "#fff3cd",
          }}
        >
          {todosCapturados ? "✅" : "⏳"} {capturados} de {items.length} capturados en CONTPAQi
        </div>

        {items.length > 1 && onActualizarItems && (
          <button
            type="button"
            onClick={marcarTodos}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              fontSize: "15px",
              background: "#fff",
              color: "#1e7e34",
              border: "2px solid #28a745",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            {todosCapturados ? "Quitar todas las marcas" : "Marcar todos como capturados"}
          </button>
        )}

        {items.length === 0 && <p>Esta salida no tiene items.</p>}

        {items.map((it, i) => (
          <div
            key={i}
            style={{
              border: it.capturado ? "2px solid #28a745" : "1px solid #ddd",
              borderRadius: "8px",
              padding: "10px",
              marginBottom: "8px",
              background: it.capturado ? "#d4edda" : "#f8f9fa",
            }}
          >
            <div style={{ fontWeight: "bold" }}>
              {it.cantidad} × {it.nombre}
            </div>
            <div style={{ fontSize: "14px" }}>SKU: {it.sku || "-"}</div>
            <div style={{ fontSize: "14px" }}>Máquina: {it.id_maquina || "-"}</div>
            {it.notas && <div style={{ fontSize: "14px" }}>Notas: {it.notas}</div>}

            {onActualizarItems && (
              <button
                type="button"
                onClick={() => cambiarCapturado(i)}
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "10px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  background: it.capturado ? "#28a745" : "#fff",
                  color: it.capturado ? "#fff" : "#222",
                  border: it.capturado ? "2px solid #1e7e34" : "2px solid #8a8fa3",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                {it.capturado ? "✅ Capturado en CONTPAQi" : "⬜ Marcar como capturado"}
              </button>
            )}
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