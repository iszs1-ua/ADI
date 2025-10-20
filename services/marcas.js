// public/services/marcas.js
import { pb, requireAuth } from './pb.js';

const startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const iso = (d) => d.toISOString();

export async function createMark({ habitId, date = new Date() }) {
  const u = requireAuth();
  return pb.collection('marcas').create({ usuario: u.id, habit: habitId, fecha: iso(date) });
}

export async function deleteTodayMark({ habitId }) {
  const u = requireAuth();
  const today = startOfDay(new Date());
  const next  = new Date(today.getTime() + 24*60*60*1000);
  const res = await pb.collection('marcas').getList(1, 1, {
    filter: `usuario="${u.id}" && habit="${habitId}" && fecha >= "${iso(today)}" && fecha < "${iso(next)}"`
  });
  if (res.items.length) {
    await pb.collection('marcas').delete(res.items[0].id);
    return true;
  }
  return false;
}

export async function hasTodayMark({ habitId }) {
  const u = requireAuth();
  const today = startOfDay(new Date());
  const next  = new Date(today.getTime() + 24*60*60*1000);
  const res = await pb.collection('marcas').getList(1, 1, {
    filter: `usuario="${u.id}" && habit="${habitId}" && fecha >= "${iso(today)}" && fecha < "${iso(next)}"`
  });
  return res.items.length > 0;
}
