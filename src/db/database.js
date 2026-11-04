import { openDB } from "idb";
import { DB_NAME, DB_VERSION, STORE_INVENTARIO, STORE_SALIDAS, initDB} from "./schema.js";

export const initDatabase = async () =>
  openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      initDB(db, oldVersion);
    },
  });

let dbInstance = null;
export const getDB = async () => {
  if (!dbInstance) dbInstance = await initDatabase();
  return dbInstance;
};

// ============ INVENTARIO ============

export const buscarItemPorSKU = async (sku) => (await getDB()).get(STORE_INVENTARIO, sku);

export const obtenerTodosLosItems = async () => (await getDB()).getAll(STORE_INVENTARIO);

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
  const item = await tx.store.get(sku);
  if (!item) throw new Error("Item no encontrado en el inventario");

  const nuevoStock = item.stock_disponible + cantidadEntrante - cantidadSaliente;
  if (nuevoStock < 0) throw new Error("No hay suficiente stock");
  if (nuevoStock > item.stock_total) throw new Error("Excede el stock total disponible");

  const actualizado = { ...item, stock_disponible: nuevoStock };
  await tx.store.put(actualizado);
  await tx.done;
  return actualizado;
};

// ============ SALIDAS ============

export const crearSalida = async (salidaData) => {
  const db = await getDB();
  const salida = {
    turno: "1",
    ...salidaData,
    id: crypto.randomUUID(),
    items: salidaData.items || [],
    eliminada: false,
    estado_sync: "local",
    ultima_modificacion: Date.now(),
  };
  await db.put(STORE_SALIDAS, salida);
  return salida;
};

// Guardar cambios de una salida existente (edición)
export const guardarSalida = async (salida) => {
  const db = await getDB();
  const actualizada = { ...salida, estado_sync: "local", ultima_modificacion: Date.now() };
  await db.put(STORE_SALIDAS, actualizada);
  return actualizada;
};

export const obtenerSalidaPorId = async (id) => (await getDB()).get(STORE_SALIDAS, id);

export const obtenerSalidasPorFecha = async (fecha) => {
  const db = await getDB();
  const lista = await db.getAllFromIndex(STORE_SALIDAS, "fecha", fecha);
  return lista.filter((s) => !s.eliminada);
};

export const obtenerTodasLasSalidas = async () => {
  const db = await getDB();
  return (await db.getAll(STORE_SALIDAS)).filter((s) => !s.eliminada);
};

// "Eliminar" = marcar como eliminada, para que el cambio también llegue a los demás celulares
export const eliminarSalida = async (id) => {
  const db = await getDB();
  const salida = await db.get(STORE_SALIDAS, id);
  if (!salida) return;
  await db.put(STORE_SALIDAS, {
    ...salida,
    eliminada: true,
    estado_sync: "local",
    ultima_modificacion: Date.now(),
  });
};

// ============ SINCRONIZACIÓN ============

export const obtenerSalidasParaSync = async () =>
  (await getDB()).getAllFromIndex(STORE_SALIDAS, "estado_sync", "local");

// Solo marca como enviada si no la editaron mientras se subía
export const marcarSincronizada = async (id, ultimaModificacion) => {
  const db = await getDB();
  const tx = db.transaction(STORE_SALIDAS, "readwrite");
  const s = await tx.store.get(id);
  if (s && s.ultima_modificacion === ultimaModificacion) {
    await tx.store.put({ ...s, estado_sync: "synced" });
  }
  await tx.done;
};

// Guarda lo que llegó del servidor, sin pisar cambios locales pendientes
export const guardarDesdeServidor = async (filas) => {
  const db = await getDB();
  const tx = db.transaction(STORE_SALIDAS, "readwrite");
  for (const f of filas) {
    const local = await tx.store.get(f.id);
    if (local && local.estado_sync === "local") continue;
    await tx.store.put({
      id: f.id,
      fecha: f.fecha,
      operador: f.operador,
      turno: f.turno,
      items: f.items || [],
      eliminada: f.eliminada,
      ultima_modificacion: f.ultima_modificacion,
      estado_sync: "synced",
    });
  }
  await tx.done;
};