// scripts/demo_habitos.js
import { login, logout } from '../services/userService.js';
import { crearHabit, listarHabits, obtenerHabit, actualizarHabit, borrarHabit } from '../services/habitService.js';

(async () => {
  try {
    await login('ikerzaragoza23@gmail.com', 'Zaragoza.2003'); // <-- pon tu pass

    const h = await crearHabit({ nombre: 'Meditación', descripcion: '15 min', completado: false });
    console.log('CREADO:', h.id, h.nombre);

    const uno = await obtenerHabit(h.id);
    console.log('OBTENER:', uno.nombre);

    const up = await actualizarHabit(h.id, { nombre: 'Meditación mañana', completado: true });
    console.log('ACTUALIZADO:', up.nombre, up.completado);

    const lista = await listarHabits({ page:1, perPage:5 });
    console.log('LISTAR:', lista.items.map(x => x.nombre));

    await borrarHabit(h.id);
    console.log('BORRADO:', h.id);
  } catch (e) {
    console.error('ERROR:', e?.message || e);
  } finally {
    logout();
  }

})();
