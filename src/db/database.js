// src/db/database.js
// Funciones para interactuar con IndexedDB

import { openDB } from "idb";
import {
  DB_NAME,
  DB_VERSION,
  STORE_INVENTARIO,
  STORE_SALIDAS,
  STORE_ITEMS_SALIDA,
  initDB,
} from "./schema.js";

export const initDatabase = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      initDB(db);
    },
  });
};

// Singleton
let dbInstance = null;

export const getDB = async () => {
  if (!dbInstance) {
    dbInstance = await initDatabase();
  }
  return dbInstance;
};

// ============================================
// INVENTARIO
// ============================================

export const buscarItemPorSKU = async (sku) => {
  const db = await getDB();
  return db.get(STORE_INVENTARIO, sku);
};

export const obtenerTodosLosItems = async () => {
  const db = await getDB();
  return db.getAll(STORE_INVENTARIO);
};

export const agregarItem = async (itemData) => {
  const db = await getDB();
  const stock = Number(itemData.stock ?? itemData.stock_total ?? 0);

  const item = {
    ...itemData,
    categoria: itemData.categoria || "General",
    stock_total: stock,
    stock_disponible: stock,
    estado: itemData.estado || "bueno",
  };

  await db.add(STORE_INVENTARIO, item);
  return item;
};

export const actualizarStock = async (sku, cantidadEntrante = 0, cantidadSaliente = 0) => {
  const db = await getDB();
  const tx = db.transaction(STORE_INVENTARIO, "readwrite");
  const store = tx.objectStore(STORE_INVENTARIO);

  const item = await store.get(sku);
  if (!item) {
    throw new Error("Item no encontrado en el inventario");
  }

  const nuevoStock = item.stock_disponible + cantidadEntrante - cantidadSaliente;
  if (nuevoStock < 0) {
    throw new Error("No hay suficiente stock");
  }
  if (nuevoStock > item.stock_total) {
    throw new Error("Excede el stock total disponible");
  }

  const updatedItem = { ...item, stock_disponible: nuevoStock };
  await store.put(updatedItem);
  await tx.done;

  return updatedItem;
};

// ============================================
// SALIDAS
// ============================================

export const crearSalida = async (salidaData) => {
  const db = await getDB();
  const tx = db.transaction([STORE_SALIDAS, STORE_ITEMS_SALIDA], "readwrite");

  const salida = {
    turno: "1",
    ...salidaData,
    items: salidaData.items || [],
    estado_sync: "local",
    ultima_modificacion: Date.now(),
  };

  const id = await tx.objectStore(STORE_SALIDAS).add(salida);
  salida.id = id;

  for (const item of salida.items) {
    await tx.objectStore(STORE_ITEMS_SALIDA).add({
      ...item,
      notas: item.notas || "",
      idSalida: id,
      fecha: salida.fecha,
    });
  }

  await tx.done;
  return salida;
};

export const obtenerSalidasPorFecha = async (fecha) => {
  const db = await getDB();
  return db.getAllFromIndex(STORE_SALIDAS, "fecha", fecha);
};

export const obtenerSalidasOperador = async (operador, desdeFecha = null) => {
  const db = await getDB();
  const salidas = await db.getAllFromIndex(STORE_SALIDAS, "operador", operador);

  return salidas
    .filter((s) => !desdeFecha || s.fecha >= desdeFecha)
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1)); // más recientes primero
};

// ============================================
// SINCRONIZACIÓN
// ============================================

export const obtenerSalidasParaSync = async () => {
  const db = await getDB();
  return db.getAllFromIndex(STORE_SALIDAS, "estado_sync", "local");
};

export const sincronizarSalida = async (salidaId) => {
  const db = await getDB();
  const tx = db.transaction(STORE_SALIDAS, "readwrite");
  const salida = await tx.store.get(salidaId);

  if (!salida) {
    throw new Error("Salida no encontrada");
  }

  salida.estado_sync = "synced";
  salida.backup_timestamp = Date.now();
  await tx.store.put(salida);
  await tx.done;

  return { exito: true, salida };
};

export const revertirSincronizacion = async (salidaId) => {
  const db = await getDB();
  const tx = db.transaction(STORE_SALIDAS, "readwrite");
  const salida = await tx.store.get(salidaId);

  if (salida) {
    salida.estado_sync = "local";
    await tx.store.put(salida);
  }

  await tx.done;
  return true;
};

export const obtenerTodasLasSalidas = async () => {
  const db = await getDB();
  return db.getAll(STORE_SALIDAS);
};

export const eliminarSalida = async (salidaId) => {
  const db = await getDB();
  const tx = db.transaction([STORE_SALIDAS, STORE_ITEMS_SALIDA], "readwrite");

  // Borrar los items de esta salida
  let cursor = await tx
    .objectStore(STORE_ITEMS_SALIDA)
    .index("idSalida")
    .openCursor(salidaId);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }

  await tx.objectStore(STORE_SALIDAS).delete(salidaId);
  await tx.done;
};