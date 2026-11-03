// src/components/ItemForm.jsx
// Formulario para agregar items a una salida

import { useState, useEffect } from "react";
import { obtenerTodosLosItems } from "../db/database.js";

const FORM_INICIAL = { cantidad: 1, id_maquina: "", notas: "" };

export default function ItemForm({
  fecha,
  operador,
  onAgregarItem,
  onEliminarItem,
  onActualizar,
}) {
  const [formData, setFormData] = useState(FORM_INICIAL);
  const [items, setItems] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Cargar el inventario local una vez
  useEffect(() => {
    obtenerTodosLosItems()
      .then(setInventario)
      .catch((err) => console.error("Error cargando inventario:", err));
  }, []);

  // Sugerencias mientras se escribe
  const sugerencias =
    !selectedItem && searchTerm.trim().length >= 2
      ? inventario
          .filter((it) =>
            `${it.nombre} ${it.sku}`.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .slice(0, 5)
      : [];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setSearchTerm(item.nombre);
  };

  const handleAgregarItem = (e) => {
    e.preventDefault();

    const nombre = selectedItem ? selectedItem.nombre : searchTerm.trim();
    if (!nombre) return;

    const cantidad = parseInt(formData.cantidad) || 1;

    // Validar stock (considerando lo que ya se agregó de ese mismo SKU)
    if (selectedItem) {
      const yaAgregado = items
        .filter((i) => i.sku === selectedItem.sku)
        .reduce((suma, i) => suma + i.cantidad, 0);
      const disponible = selectedItem.stock_disponible || 0;

      if (cantidad + yaAgregado > disponible) {
        alert(
          `Stock insuficiente para: ${selectedItem.nombre}\n` +
            `Disponible: ${disponible}\n` +
            `Ya agregado: ${yaAgregado}\n` +
            `Cantidad solicitada: ${cantidad}`
        );
        return;
      }
    }

    const nuevoItem = {
      sku: selectedItem ? selectedItem.sku : "",
      nombre,
      cantidad,
      id_maquina: formData.id_maquina || "",
      nombre_maquina: "",
      notas: formData.notas || "",
      idSalida: null,
    };

    setItems((prev) => [...prev, nuevoItem]);
    if (onAgregarItem) onAgregarItem(nuevoItem);

    // Limpiar formulario
    setSelectedItem(null);
    setSearchTerm("");
    setFormData(FORM_INICIAL);
  };

  const handleEliminar = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    if (onEliminarItem) onEliminarItem(index);
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      alert("Debes agregar al menos un item");
      return;
    }
    if (!onActualizar) return;
    const ok = await onActualizar({ fecha, items, operador });
    if (ok) setItems([]);
  };

  return (
    <form onSubmit={handleAgregarItem}>
      <h3>Agregar Item:</h3>

      <div className="form-group" style={{ position: "relative" }}>
        <label htmlFor="nombre" className="form-label">Nombre del item:</label>
        <input
          type="text"
          id="nombre"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setSelectedItem(null);
          }}
          placeholder="Escribe el nombre o SKU del item"
          className="form-control"
          required
          autoComplete="off"
          style={{ fontSize: "16px" }}
        />

        {sugerencias.length > 0 && (
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              border: "1px solid #888",
              borderRadius: "4px",
              background: "#fff",
              color: "#222",
            }}
          >
            {sugerencias.map((it) => (
              <li
                key={it.sku}
                onClick={() => handleSelectItem(it)}
                style={{ padding: "8px", cursor: "pointer", borderBottom: "1px solid #eee" }}
              >
                {it.nombre} <small>({it.sku})</small>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedItem && (
        <div className="form-group">
          <label htmlFor="sku" className="form-label">SKU:</label>
          <input
            type="text"
            id="sku"
            value={selectedItem.sku}
            className="form-control"
            disabled
            style={{ backgroundColor: "#f0f0f0", color: "#666" }}
          />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="cantidad" className="form-label">Cantidad:</label>
        <input
          type="number"
          id="cantidad"
          value={formData.cantidad}
          onChange={(e) => handleChange("cantidad", e.target.value)}
          min="1"
          max={selectedItem?.stock_disponible || 999}
          className="form-control"
          style={{ fontSize: "20px", fontWeight: "bold" }}
        />
      </div>

      {selectedItem && (
        <div
          className="stock-status"
          style={{
            backgroundColor:
              selectedItem.stock_disponible < selectedItem.stock_total ? "#fff3cd" : "#d4edda",
            color: "#222",
            padding: "8px",
            borderRadius: "4px",
            marginBottom: "8px",
          }}
        >
          Disponible: {selectedItem.stock_disponible} de {selectedItem.stock_total}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="id_maquina" className="form-label">Máquina:</label>
        <input
          type="text"
          id="id_maquina"
          value={formData.id_maquina}
          onChange={(e) => handleChange("id_maquina", e.target.value)}
          placeholder="Ej: M-01, M-02, etc."
          className="form-control"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="notas" className="form-label">Notas:</label>
        <textarea
          id="notas"
          value={formData.notas}
          onChange={(e) => handleChange("notas", e.target.value)}
          placeholder="Observaciones sobre la salida..."
          className="form-control"
          rows="2"
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "18px",
          marginTop: "16px",
          background: "#28a745",
          color: "white",
        }}
      >
        ➕ Agregar Item
      </button>

      {items.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <h4>Items en esta salida ({items.length}):</h4>
          <ul style={{ paddingLeft: "18px" }}>
            {items.map((it, i) => (
              <li key={i} style={{ marginBottom: "6px" }}>
                {it.cantidad} × {it.nombre} — máquina {it.id_maquina}{" "}
                <button type="button" onClick={() => handleEliminar(i)}>
                  ✖
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={handleSubmit}
            className="btn btn-success"
            style={{ width: "100%", padding: "10px", marginTop: "8px" }}
          >
            ✅ Enviar a Sistema
          </button>
        </div>
      )}
    </form>
  );
}