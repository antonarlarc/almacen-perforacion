export const DB_NAME = "almacen-perforacion";
export const DB_VERSION = 2;

export const STORE_INVENTARIO = "inventario";
export const STORE_SALIDAS = "salidas";

export const initDB = (db, oldVersion) => {
  if (!db.objectStoreNames.contains(STORE_INVENTARIO)) {
    const inventario = db.createObjectStore(STORE_INVENTARIO, { keyPath: "sku" });
    inventario.createIndex("nombre", "nombre", { unique: false });
  }

  // v2: las salidas usan un id único (UUID) y guardan sus items dentro
  if (oldVersion < 2) {
    if (db.objectStoreNames.contains(STORE_SALIDAS)) db.deleteObjectStore(STORE_SALIDAS);
    if (db.objectStoreNames.contains("items_salida")) db.deleteObjectStore("items_salida");

    const salidas = db.createObjectStore(STORE_SALIDAS, { keyPath: "id" });
    salidas.createIndex("fecha", "fecha", { unique: false });
    salidas.createIndex("operador", "operador", { unique: false });
    salidas.createIndex("estado_sync", "estado_sync", { unique: false });
  }
};