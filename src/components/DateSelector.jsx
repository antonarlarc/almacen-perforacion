// src/components/DateSelector.jsx
// Selector de fecha (usa el calendario nativo del dispositivo)

export default function DateSelector({ value, onChange }) {
  return (
    <div className="date-selector" style={{ marginBottom: "10px" }}>
      <label
        htmlFor="fecha-salida"
        style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}
      >
        📅 Fecha de la salida:
      </label>
      <input
        type="date"
        id="fecha-salida"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "18px",
          borderRadius: "8px",
          border: "2px solid #28a745",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}