// src/db/schema.js
export const DB_NAME = "almacen-perforacion";
export const DB_VERSION = 1;

export const STORE_INVENTARIO = "inventario";
export const STORE_SALIDAS = "salidas";
export const STORE_ITEMS_SALIDA = "items_salida";

// Se llama dentro de upgrade() al abrir la base de datos
export const initDB = (db) => {
  if (!db.objectStoreNames.contains(STORE_INVENTARIO)) {
    const inventario = db.createObjectStore(STORE_INVENTARIO, { keyPath: "sku" });
    inventario.createIndex("nombre", "nombre", { unique: false });
  }

  if (!db.objectStoreNames.contains(STORE_SALIDAS)) {
    const salidas = db.createObjectStore(STORE_SALIDAS, {
      keyPath: "id",
      autoIncrement: true,
    });
    salidas.createIndex("fecha", "fecha", { unique: false });
    salidas.createIndex("operador", "operador", { unique: false });
    salidas.createIndex("estado_sync", "estado_sync", { unique: false });
  }

  if (!db.objectStoreNames.contains(STORE_ITEMS_SALIDA)) {
    const items = db.createObjectStore(STORE_ITEMS_SALIDA, {
      keyPath: "id",
      autoIncrement: true,
    });
    items.createIndex("idSalida", "idSalida", { unique: false });
    items.createIndex("sku", "sku", { unique: false });
    items.createIndex("fecha", "fecha", { unique: false });
  }
};