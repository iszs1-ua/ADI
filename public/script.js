// ------------------------
// CONFIG PB + HELPERS
// ------------------------
const pb = new PocketBase('http://127.0.0.1:8090');
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

// slug de página: "login", "registro", "habitos", "new-habit", "edit-habit", "index"
const pathname = location.pathname.toLowerCase().replace(/\/+$/, '');
const slug = (() => {
  const last = pathname.split('/').pop();
  if (!last || last === '') return 'index';
  return last.endsWith('.html') ? last.replace('.html', '') : last;
})();
const onPage = (names, fn) => {
  const set = Array.isArray(names) ? names : [names];
  if (set.some(n => n === slug)) fn();
};

// Marcar activo en navbar según URL (sin bloquear navegación)
(function highlightNav() {
  const navLinks = $$('[data-nav]');
  navLinks.forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase().replace(/\.html$/, '');
    const isActive = href && (href.endsWith('/' + slug) || href === slug || (slug === 'index' && href.endsWith('/index')));
    if (isActive) a.classList.add('site-header__nav-link--active');
    else a.classList.remove('site-header__nav-link--active');
  });
})();

// ------------------------
// DASHBOARD: selector de vistas (solo UI)
// ------------------------
(function dashboardViews() {
  const viewButtons = $$('.dashboard__view-button');
  const calendars = $$('[data-calendar]');
  if (!viewButtons.length) return;

  viewButtons.forEach(button => {
    button.addEventListener('click', () => {
      viewButtons.forEach(btn => btn.classList.remove('dashboard__view-button--active'));
      button.classList.add('dashboard__view-button--active');
      calendars.forEach(cal => cal.style.display = 'none');
      const viewType = button.getAttribute('data-view');
      const target = document.querySelector(`[data-calendar="${viewType}"]`);
      if (target) target.style.display = 'block';
    });
  });
})();

// ------------------------
// LOGIN (login / login.html)
// ------------------------
onPage(['login'], () => {
  $('.auth-form__container')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const email = $('#email').value.trim();
      const password = $('#password').value;
      await pb.collection('users').authWithPassword(email, password);
      location.href = 'index.html';
    } catch (err) {
      alert(err?.message || 'Login fallido');
    }
  });
});

// ------------------------
// REGISTRO (registro / registro.html)
// ------------------------
onPage(['registro'], () => {
  $('.auth-form__container')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const username = $('#username').value.trim();
      const email = $('#email').value.trim();
      const password = $('#password').value;
      const confirm = $('#confirm-password').value;
      if (password !== confirm) return alert('Las contraseñas no coinciden');
      await pb.collection('users').create({ username, email, password, passwordConfirm: confirm });
      await pb.collection('users').authWithPassword(email, password);
      location.href = 'index.html';
    } catch (err) {
      alert(err?.message || 'Registro fallido');
    }
  });
});

// ------------------------
// LISTADO HÁBITOS (habitos / habitos.html)
// Colección: "habitos" -> nombre, descripcion, completado, frecuencia, usuario
// ------------------------
onPage(['habitos'], () => {
  (async () => {
    try {
      if (!pb.authStore.isValid) return location.href = 'login.html';
      const grid = $('.habit-list__grid');
      if (!grid) return;

      const res = await pb.collection('habitos').getList(1, 50, { sort: '-created' });

      grid.innerHTML = '';
      grid.insertAdjacentHTML('beforeend',
        `<a href="new-habit.html" class="habit-list__add-button" data-nav="new-habit">+ Nuevo Hábito</a>`);

      for (const h of res.items) {
        const freq = h.frecuencia || '—';
        grid.insertAdjacentHTML('afterbegin', `
          <div class="habit-card" data-id="${h.id}">
            <div class="habit-card__header">
              <h3 class="habit-card__title">${h.nombre}</h3>
              <div>
                <span class="habit-card__badge habit-card__badge--status">${h.completado ? 'Hecho' : 'Pendiente'}</span>
                <span class="habit-card__badge habit-card__badge--freq">${freq}</span>
              </div>
            </div>
            <p class="habit-card__description">${h.descripcion || ''}</p>
            <div class="habit-card__progress"><span class="habit-card__progress-text">—</span></div>
            <button class="habit-card__button" data-action="toggle">
              ${h.completado ? 'Marcar pendiente' : 'Marcar completado'}
            </button>
            <a href="edit-habit.html?id=${h.id}" class="habit-card__button habit-card__button--edit">Editar</a>
            <button class="habit-card__button habit-card__button--delete" data-action="delete">Eliminar</button>
          </div>
        `);
      }

      // Acciones: eliminar / alternar completado
      grid.addEventListener('click', async (ev) => {
        const btn = ev.target.closest('[data-action]');
        if (!btn) return;
        const card = ev.target.closest('.habit-card');
        const id = card?.dataset.id;
        if (!id) return;

        if (btn.dataset.action === 'delete') {
          if (!confirm('¿Eliminar este hábito?')) return;
          try {
            await pb.collection('habitos').delete(id);
            card.remove();
          } catch (err) {
            alert(err?.message || 'No se pudo eliminar');
          }
        }

        if (btn.dataset.action === 'toggle') {
          try {
            const h = await pb.collection('habitos').getOne(id);
            const upd = await pb.collection('habitos').update(id, { completado: !h.completado });
            card.querySelector('.habit-card__badge--status').textContent = upd.completado ? 'Hecho' : 'Pendiente';
            btn.textContent = upd.completado ? 'Marcar pendiente' : 'Marcar completado';
          } catch (err) {
            alert(err?.message || 'No se pudo actualizar');
          }
        }
      });
    } catch (err) {
      alert(err?.message || 'No se pudo cargar la lista');
    }
  })();
});

// ------------------------
// NUEVO HÁBITO (new-habit / new-habit.html)
// ------------------------
onPage(['new-habit'], () => {
  $('.habit-form__container')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      if (!pb.authStore.isValid) return location.href = 'login.html';

      const nombre = $('#habit-name').value.trim();
      const descripcion = $('#habit-description').value.trim();
      const frecuencia = $('#habit-frequency')?.value || 'daily';
      const userId = pb.authStore.model?.id;   // <-- id del usuario logeado

      await pb.collection('habitos').create({
        nombre,
        descripcion,
        frecuencia,
        completado: false,
        usuario: userId          // <-- asociación explícita
      });

      location.href = 'habitos.html';
    } catch (err) {
      alert(err?.message || 'No se pudo crear');
    }
  });
});

// ------------------------
// EDITAR HÁBITO (edit-habit / edit-habit.html)
// ------------------------
onPage(['edit-habit'], () => {
  const id = new URLSearchParams(location.search).get('id');

  // Si no hay id en la URL, volvemos a la lista
  if (!id) {
    alert('Falta el id del hábito');
    location.href = 'habitos.html';
    return;
  }

  (async () => {
    try {
      if (!pb.authStore.isValid) return location.href = 'login.html';
      const h = await pb.collection('habitos').getOne(id);
      $('#habit-name').value = h.nombre || '';
      $('#habit-description').value = h.descripcion || '';
      $('#habit-frequency').value = h.frecuencia || 'daily';
    } catch (err) {
      alert(err?.message || 'No se pudo cargar el hábito');
    }
  })();

  $('.habit-form__container')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const nombre = $('#habit-name').value.trim();
      const descripcion = $('#habit-description').value.trim();
      const frecuencia = $('#habit-frequency').value;
      await pb.collection('habitos').update(id, { nombre, descripcion, frecuencia });
      location.href = 'habitos.html';
    } catch (err) {
      alert(err?.message || 'No se pudo guardar');
    }
  });
});

// ------------------------
// PERFIL e INICIO (perfil / index)
// ------------------------
onPage(['perfil', 'index'], () => {
  (async () => {
    if (!pb.authStore.isValid) {
      if (slug === 'perfil') location.href = 'login.html';
      return;
    }
    const u = pb.authStore.model;
    const nameEl = document.querySelector('.user-profile__name');
    const emailEl = document.querySelector('.user-profile__email');
    if (nameEl && u?.username) nameEl.textContent = u.username;
    if (emailEl && u?.email) emailEl.textContent = u.email;
  })();
});

// ------------------------
// (Opcional) Cerrar sesión si existe #logoutBtn
// ------------------------
$('#logoutBtn')?.addEventListener('click', () => {
  pb.authStore.clear();
  location.href = 'login.html';
});
