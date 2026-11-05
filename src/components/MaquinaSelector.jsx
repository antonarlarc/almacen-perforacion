// src/components/MaquinaSelector.jsx
// Botones para elegir una o varias máquinas

export const MAQUINAS = ["S2", "S3", "408"];

// "S2, S3" -> ["S2", "S3"]
export const textoAMaquinas = (texto) =>
  (texto || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

// ["S3", "S2"] -> "S2, S3" (siempre en el mismo orden)
export const maquinasATexto = (lista) => {
  const orden = (m) => {
    const i = MAQUINAS.indexOf(m);
    return i === -1 ? 99 : i;
  };
  return [...lista].sort((a, b) => orden(a) - orden(b)).join(", ");
};

export default function MaquinaSelector({ value, onChange }) {
  const toggle = (m) => {
    onChange(value.includes(m) ? value.filter((x) => x !== m) : [...value, m]);
  };

  // Valores viejos escritos a mano (por ejemplo "M-01") se conservan
  const otras = value.filter((m) => !MAQUINAS.includes(m));

  return (
    <div>
      <div style={{ display: "flex", gap: "8px" }}>
        {MAQUINAS.map((m) => {
          const activo = value.includes(m);
          return (
            <button
              key={m}
              type="button"
              onClick={() => toggle(m)}
              aria-pressed={activo}
              style={{
                flex: 1,
                minHeight: "56px",
                fontSize: "20px",
                fontWeight: "bold",
                borderRadius: "8px",
                border: activo ? "3px solid #1e7e34" : "2px solid #8a8fa3",
                background: activo ? "#28a745" : "#fff",
                color: activo ? "#fff" : "#222",
                cursor: "pointer",
              }}
            >
              {activo ? "✓ " : ""}
              {m}
            </button>
          );
        })}
      </div>
      {otras.length > 0 && (
        <div style={{ fontSize: "13px", marginTop: "4px" }}>Otras: {otras.join(", ")}</div>
      )}
    </div>
  );
}