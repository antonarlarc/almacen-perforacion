import { supabase } from "./supabase";
import {
  obtenerSalidasParaSync,
  marcarSincronizada,
  guardarDesdeServidor,
} from "./database";

export const sincronizar = async () => {
  // 1. Subir lo pendiente de este celular
  const pendientes = await obtenerSalidasParaSync();
  if (pendientes.length > 0) {
    const filas = pendientes.map((s) => ({
      id: s.id,
      fecha: s.fecha,
      operador: s.operador,
      turno: s.turno || "1",
      items: s.items || [],
      eliminada: !!s.eliminada,
      ultima_modificacion: s.ultima_modificacion,
    }));
    const { error } = await supabase.from("salidas").upsert(filas);
    if (error) throw error;
    for (const s of pendientes) {
      await marcarSincronizada(s.id, s.ultima_modificacion);
    }
  }

  // 2. Bajar lo de los demás (últimos 90 días)
  const desde = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const { data, error } = await supabase.from("salidas").select("*").gte("fecha", desde);
  if (error) throw error;
  await guardarDesdeServidor(data || []);
};
