import { useState } from "react";

export default function NombreOperador({ valorInicial, onGuardar, onCancelar }) {
  const [nombre, setNombre] = useState(valorInicial || "");

  const guardar = (e) => {
    e.preventDefault();
    const limpio = nombre.trim();
    if (limpio.length < 2) {
      alert("Escribe tu nombre");
      return;
    }
    onGuardar(limpio);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px",
        zIndex: 1200,
      }}
    >
      <form
        onSubmit={guardar}
        style={{
          background: "#fff",
          color: "#222",
          borderRadius: "10px",
          width: "100%",
          maxWidth: "400px",
          padding: "20px",
        }}
      >
        <h3 style={{ margin: "0 0 8px 0" }}>👤 ¿Quién eres?</h3>
        <p style={{ margin: "0 0 14px 0", fontSize: "15px" }}>
          Tu nombre aparecerá en las salidas que registres desde este celular.
        </p>

        <input
          type="text"
          className="form-control"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre y apellido"
          autoFocus
          style={{ marginBottom: "14px" }}
        />

        <div style={{ display: "flex", gap: "8px" }}>
          {onCancelar && (
            <button
              type="button"
              onClick={onCancelar}
              style={{
                flex: 1,
                background: "#6c757d",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            style={{
              flex: 1,
              background: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}