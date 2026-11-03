// src/components/ItemForm.jsx
// Formulario para agregar items a una salida

import { useState, useEffect } from "react";

export default function ItemForm({ fecha, operador, onAgregarItem, onEliminarItem, onActualizar }) {
  const [stockTotal, setStockTotal] = useState({});
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Manejar selección de item
  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setItems([]);
  };
  
  // Manejar cambios en inputs
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };
  
  // Buscar item en inventario local
  const buscarItem = async (texto) => {
    const db = await import("../db/database.js").then(mod => mod.getDB);
    const dbInstance = await db();
    const store = dbInstance.transaction("inventario").store;
    const allItems = await store.getAll();
    
    // Filtrar items que coincidan con el texto
    const items = allItems.filter(item => {
      const nombreCompleto = `${item.nombre} ${item.sku}`;
      return nombreCompleto.toLowerCase().includes(texto.toLowerCase());
    }).slice(0, 10);
    
    if (items.length > 0) {
      return items[0];
    }
    return null;
  };
  
  // Agregar item al formulario
  const handleAgregarItem = async (e) => {
    e.preventDefault();
    
    // Validar stock
    if (selectedItem && formData.cantidad > (selectedItem.stock_disponible || 0)) {
      alert(`Stock insuficiente para: ${selectedItem.nombre}\nDisponible: ${selectedItem.stock_disponible}\nCantidad solicitada: ${formData.cantidad}`);
      return;
    }
    
    onAgregarItem({
      ...formData,
      sku: selectedItem ? selectedItem.sku : "",
      nombre: selectedItem ? selectedItem.nombre : formData.nombre,
      cantidad: parseInt(formData.cantidad) || 1,
      id_maquina: formData.id_maquina || "",
      idSalida: null
    });
    
    // Reset form
    setItems([]);
    setSelectedItem(null);
    setSearchTerm("");
    setFormData({
      nombre: "",
      sku: "",
      cantidad: 1,
      id_maquina: "",
      nombre_maquina: "",
      notas: ""
    });
  };
  
  // Actualizar stock
  const handleActualizarStock = async (sku, cantidad) => {
    const db = async () => {
      const dbInstance = await import("../db/database.js").then(mod => mod.getDB());
      return dbInstance;
    };
    
    try {
      const dbInstance = await db();
      const stock = dbInstance.stock;
      stock[sku] = (stock[sku] || 0) + cantidad;
      await dbInstance.guardarStock(stock);
      alert(`Stock actualizado: ${sku} +${cantidad}`);
    } catch (error) {
      alert("Error actualizando stock: " + error.message);
    }
  };
  
  // Validar que haya items agregados
  const handleSubmit = async () => {
    if (items.length === 0) {
      alert("Debes agregar al menos un item");
      return;
    }
    
    onActualizar({ fecha, items, operador });
  };
  
  return (
    <form onSubmit={handleAgregarItem}>
      <h3>Agregar Item:</h3>
      
      <div className="form-group">
        <label htmlFor="nombre" className="form-label">Nombre del item:</label>
        <input
          type="text"
          id="nombre"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (searchTerm.length > 2) {
              buscarItem(e.target.value).then(item => {
                if (item) {
                  handleSelectItem(item);
                  e.target.value = "";
                }
              });
            }
          }}
          placeholder="Escribe el nombre del item o presiona Enter para buscar"
          className="form-control"
          required
          style={{ fontSize: '16px' }}
        />
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
            style={{ backgroundColor: '#f0f0f0', color: '#666' }}
          />
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="cantidad" className="form-label">Cantidad:</label>
        <input
          type="number"
          id="cantidad"
          value={formData.cantidad}
          onChange={(e) => handleChange('cantidad', e.target.value)}
          min="1"
          max={selectedItem?.stock_disponible || 999}
          className="form-control"
          style={{ fontSize: '20px', fontWeight: 'bold' }}
        />
      </div>
      
      {selectedItem && (
        <div className="stock-status" style={{ 
          backgroundColor: selectedItem.stock_disponible < selectedItem.stock_total ? '#fff3cd' : '#d4edda',
          padding: '8px',
          borderRadius: '4px',
          marginBottom: '8px'
        }}>
          {selectedItem.stock_disponible < selectedItem.stock_total ? (
            <>
              ⚠️ Stock bajo: {selectedItem.stock_disponible} disponibles de {selectedItem.stock_total}
            </>
          ) : (
            <>
              ✅ Stock suficiente
            </>
          )}
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="id_maquina" className="form-label">Máquina:</label>
        <input
          type="text"
          id="id_maquina"
          value={formData.id_maquina}
          onChange={(e) => handleChange('id_maquina', e.target.value)}
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
          onChange={(e) => handleChange('notas', e.target.value)}
          placeholder="Observaciones sobre la salida..."
          className="form-control"
          rows="2"
        />
      </div>
      
      <button 
        type="submit" 
        className="btn btn-primary"
        disabled={items.length === 0}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '18px',
          marginTop: '16px',
          background: items.length > 0 ? '#28a745' : '#ccc',
          color: 'white'
        }}
      >
        {items.length > 0 ? '➕ Agregar Item' : '📝 Agregue items primero'}
      </button>
      
      {items.length > 0 && (
        <button 
          type="button"
          onClick={handleSubmit}
          className="btn btn-success"
          style={{ width: '100%', padding: '10px', marginTop: '8px' }}
        >
          ✅ Enviar a Sistema
        </button>
      )}
    </form>
  );
};