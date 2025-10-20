// ------------------------
// CONFIG PB + HELPERS
// ------------------------
const pb = new PocketBase('http://127.0.0.1:8090');
const $  = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

// slug de página: "login", "registro", "habitos", "new-habit", "edit-habit", "perfil", "index"
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

// ===================================================================
// CAPA DE SERVICIOS
// ===================================================================

// alias por si tu BD usa etiquetas distintas
const FREQ_ALIASES = {
  daily: ['daily', 'diario'],
  weekly: ['weekly', 'semanal'],
  '3-times-a-week': [
    '3-times-a-week',
    '3xweek',
    '3-per-week',
    '3_per_week',
    '3 veces por semana',
    'tres-veces-semana',
    'tres_veces_semana',
  ],
};
const normalizeFreq = (f) => (f || '').trim();
const freqToOr = (value) => {
  const v = normalizeFreq(value);
  const list = FREQ_ALIASES[v] || [v];
  // genera (frecuencia='a' || frecuencia='b' ...)
  return '(' + list.map(x => `frecuencia='${x.replace(/'/g, "\\'")}'`).join(' || ') + ')';
};

const AuthService = {
  isLogged: () => pb.authStore.isValid,
  currentUser: () => pb.authStore.model,
  async login(email, password) {
    return pb.collection('users').authWithPassword(email, password);
  },
  async register({ username, email, password, passwordConfirm }) {
    await pb.collection('users').create({ username, email, password, passwordConfirm });
    return this.login(email, password);
  },
  logout() {
    pb.authStore.clear();
  }
};

const HabitosService = {
  async create({ nombre, descripcion, frecuencia }) {
    const userId = AuthService.currentUser()?.id;
    return pb.collection('habitos').create({
      nombre,
      descripcion,
      frecuencia,
      completado: false,
      usuario: userId,
    });
  },

  async listMine({ page = 1, perPage = 50 } = {}) {
    const userId = AuthService.currentUser()?.id;
    const filter = `(usuario='${userId}' || usuario.id ?= '${userId}')`;
    return pb.collection('habitos').getList(page, perPage, {
      sort: '-created',
      filter,
    });
  },

  // búsqueda por texto y opcionalmente por frecuencia
  async searchMine({ q = '', frecuencia, page = 1, perPage = 50 } = {}) {
    const userId = AuthService.currentUser()?.id;
    const parts = [`(usuario='${userId}' || usuario.id ?= '${userId}')`];

    if (q) {
      const safe = q.replace(/'/g, "\\'");
      parts.push(`(nombre ~ '${safe}' || descripcion ~ '${safe}')`);
    }
    if (frecuencia) {
      parts.push(freqToOr(frecuencia));
    }

    const filter = parts.join(' && ');
    return pb.collection('habitos').getList(page, perPage, {
      sort: '-created',
      filter,
    });
  },

  // **nuevo**: filtrar SOLO por frecuencia (sin texto)
  async filterByFrequency({ frecuencia, page = 1, perPage = 50 } = {}) {
    const userId = AuthService.currentUser()?.id;
    if (!frecuencia) return this.listMine({ page, perPage });

    const filter = [
      `(usuario='${userId}' || usuario.id ?= '${userId}')`,
      freqToOr(frecuencia),
    ].join(' && ');

    return pb.collection('habitos').getList(page, perPage, {
      sort: '-created',
      filter,
    });
  },

  get: (id) => pb.collection('habitos').getOne(id),
  update: (id, data) => pb.collection('habitos').update(id, data),
  remove: (id) => pb.collection('habitos').delete(id),
};

const UsersService = {
  async updateMe(dataOrFormData) {
    const u = AuthService.currentUser();
    return pb.collection('users').update(u.id, dataOrFormData);
  },
  async deleteMe() {
    const u = AuthService.currentUser();
    return pb.collection('users').delete(u.id);
  },
  avatarUrl(user) {
    if (!user?.avatar) return '';
    return pb.files.getUrl(user, user.avatar);
  }
};

// ------------------------
// Páginas protegidas (requieren sesión)
// ------------------------
const PROTECTED = new Set(['index', 'habitos', 'perfil', 'new-habit', 'edit-habit']);
if (PROTECTED.has(slug) && !AuthService.isLogged()) {
  if (slug !== 'login' && slug !== 'registro') {
    location.href = 'login.html';
  }
}

// ------------------------
// NAV activo + Login/Logout dinámico
// ------------------------
(function highlightNav() {
  const navLinks = $$('[data-nav]');
  navLinks.forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase().replace(/\.html$/, '');
    const isActive = href && (href.endsWith('/' + slug) || href === slug || (slug === 'index' && href.endsWith('/index')));
    a.classList.toggle('site-header__nav-link--active', !!isActive);
  });
})();

function updateAuthLinks() {
  const isLogged = AuthService.isLogged();
  const loginLink = $('#loginLink');
  const logoutBtn = $('#logoutBtn');
  if (loginLink) loginLink.style.display = isLogged ? 'none' : '';
  if (logoutBtn) logoutBtn.style.display = isLogged ? '' : 'none';
}
updateAuthLinks();
pb.authStore.onChange(updateAuthLinks);

$('#logoutBtn')?.addEventListener('click', () => {
  AuthService.logout();
  updateAuthLinks();
  location.href = 'login.html';
});

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
// LOGIN (login)
// ------------------------
onPage(['login'], () => {
  $('.auth-form__container')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const email = $('#email').value.trim();
      const password = $('#password').value;
      await AuthService.login(email, password);
      location.href = 'index.html';
    } catch (err) {
      alert(err?.message || 'Login fallido');
    }
  });
});

// ------------------------
// REGISTRO (registro)
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

      await AuthService.register({ username, email, password, passwordConfirm: confirm });
      location.href = 'index.html';
    } catch (err) {
      alert(err?.message || 'No se pudo registrar.');
    }
  });
});

// ------------------------
// LISTADO HÁBITOS (habitos)
// ------------------------
onPage(['habitos'], () => {
  const grid = $('.habit-list__grid');

  const render = (items) => {
    grid.innerHTML = '';
    grid.insertAdjacentHTML('beforeend',
      `<a href="new-habit.html" class="habit-list__add-button" data-nav="new-habit">+ Nuevo Hábito</a>`);
    for (const h of items) {
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
  };

  const load = async () => {
    if (!AuthService.isLogged()) return location.href = 'login.html';
    const res = await HabitosService.listMine();
    render(res.items);
  };

  load();

  // Botón Buscar / Filtrar
  $('#applyFiltersBtn')?.addEventListener('click', async () => {
    const q = $('#searchText')?.value.trim() || '';
    const frecuencia = $('#frequencyFilter')?.value || '';

    let res;
    if (q && frecuencia) {
      res = await HabitosService.searchMine({ q, frecuencia });
    } else if (frecuencia && !q) {
      res = await HabitosService.filterByFrequency({ frecuencia });
    } else if (q && !frecuencia) {
      res = await HabitosService.searchMine({ q });
    } else {
      res = await HabitosService.listMine();
    }
    render(res.items);
  });

  // (Opcional) filtrar al cambiar el select sin pulsar botón
  $('#frequencyFilter')?.addEventListener('change', async (e) => {
    const frecuencia = e.target.value || '';
    const res = await HabitosService.filterByFrequency({ frecuencia });
    render(res.items);
  });

  // Acciones
  grid?.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('[data-action]');
    if (!btn) return;
    const card = ev.target.closest('.habit-card');
    const id = card?.dataset.id;
    if (!id) return;

    if (btn.dataset.action === 'delete') {
      if (!confirm('¿Eliminar este hábito?')) return;
      try { await HabitosService.remove(id); card.remove(); }
      catch (err) { alert(err?.message || 'No se pudo eliminar'); }
    }

    if (btn.dataset.action === 'toggle') {
      try {
        const h = await HabitosService.get(id);
        const upd = await HabitosService.update(id, { completado: !h.completado });
        card.querySelector('.habit-card__badge--status').textContent = upd.completado ? 'Hecho' : 'Pendiente';
        btn.textContent = upd.completado ? 'Marcar pendiente' : 'Marcar completado';
      } catch (err) {
        alert(err?.message || 'No se pudo actualizar');
      }
    }
  });
});

// ------------------------
// PERFIL e INICIO (perfil / index)
// ------------------------
onPage(['perfil', 'index'], () => {
  (async () => {
    if (!AuthService.isLogged()) {
      if (slug === 'perfil') location.href = 'login.html';
      return;
    }

    const u = AuthService.currentUser();

    const nameEl   = $('.user-profile__name');
    const emailEl  = $('.user-profile__email');
    const sinceEl  = $('.user-profile__join-date');
    const avatarImg = $('#profileAvatarImg');

    if (nameEl)  nameEl.textContent  = u?.name || u?.username || 'Usuario';
    if (emailEl) emailEl.textContent = u?.email || '';
    if (sinceEl && u?.created) {
      const d = new Date(u.created);
      sinceEl.textContent = 'Miembro desde: ' + d.toLocaleDateString();
    }
    if (avatarImg && u?.avatar) avatarImg.src = UsersService.avatarUrl(u);

    if (slug === 'perfil') {
      $('#deleteAccountBtn')?.addEventListener('click', async () => {
        if (!confirm('¿Seguro que quieres eliminar tu cuenta? Esta acción es irreversible.')) return;
        try {
          await UsersService.deleteMe();
          AuthService.logout();
          alert('Cuenta eliminada. ¡Hasta pronto!');
          location.href = 'registro.html';
        } catch (err) {
          console.error(err);
          alert(err?.message || 'No se pudo eliminar la cuenta');
        }
      });

      const editBtn     = $('#editProfileBtn');
      const editForm    = $('#profileEditForm');
      const cancelBtn   = $('#cancelEditProfile');
      const inputName   = $('#profileName');
      const inputAvatar = $('#profileAvatar');

      editBtn?.addEventListener('click', () => {
        if (!editForm) return;
        if (inputName) inputName.value = u?.name || u?.username || '';
        editForm.style.display = 'block';
      });

      cancelBtn?.addEventListener('click', () => {
        if (editForm) editForm.style.display = 'none';
      });

      editForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const fd = new FormData();
          if (inputName) fd.append('name', (inputName.value || '').trim());
          const file = inputAvatar?.files?.[0];
          if (file) fd.append('avatar', file);

          const updated = await UsersService.updateMe(fd);
          pb.authStore.save(pb.authStore.token, updated);

          if (nameEl) nameEl.textContent = updated.name || updated.username || 'Usuario';
          if (avatarImg && updated.avatar) avatarImg.src = UsersService.avatarUrl(updated);

          alert('Perfil actualizado ✅');
          editForm.style.display = 'none';
        } catch (err) {
          console.error(err);
          alert(err?.message || 'No se pudo actualizar el perfil');
        }
      });
    }

    // --- LÓGICA DEL DASHBOARD (INDEX) ---
    if (slug === 'index') {
      const weeklyCalendar = $('[data-calendar="weekly"]');
      const dashboardSummary = $('.dashboard__summary p');

      try {
        const res = await HabitosService.listMine();
        const habits = res.items;

        let headerRow = weeklyCalendar?.querySelector('.calendar__row--header');
        weeklyCalendar.innerHTML = '';
        if (headerRow) weeklyCalendar.appendChild(headerRow);

        if (!habits.length) {
          weeklyCalendar.innerHTML += '<p style="padding: 1rem;">No tienes hábitos. Crea uno nuevo para empezar.</p>';
        } else {
          habits.forEach(habit => {
            weeklyCalendar.innerHTML += createWeeklyHabitRow(habit);
          });
        }

        const totalHabits = habits.length;
        const completedToday = habits.filter(h => h.completado).length;

        if (dashboardSummary) {
          dashboardSummary.textContent =
            `¡Hola, ${u?.username || 'Usuario'}! Tienes ${totalHabits} hábitos. ` +
            `Hoy has completado ${completedToday} de ${totalHabits} hábitos.`;
        }

        setupDashboardViews();
      } catch (error) {
        console.error('Error al cargar el Dashboard:', error);
        if (weeklyCalendar) weeklyCalendar.innerHTML = '<p class="error-message">Error al cargar el Dashboard.</p>';
      }
    }
  })();
});

// ------------------------
// Evitar navegar a páginas protegidas desde el header si no hay sesión
// ------------------------
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-nav]');
  if (!a) return;
  const href = (a.getAttribute('href') || '').toLowerCase().replace(/\.html$/, '');
  const targetSlug = href.split('/').pop() || 'index';
  if (PROTECTED.has(targetSlug) && !AuthService.isLogged()) {
    e.preventDefault();
    location.href = 'login.html';
  }
});

// ------------------------
// FUNCIÓN PARA RENDERIZAR HÁBITOS (Vista semanal)
// ------------------------
const createWeeklyHabitRow = (habit) => {
  const days = ['✓', '✗', '✓', '✓', '✗', '✓', '✗'];
  const cells = days.map(status => {
    const cls = status === '✓' ? 'calendar__day-cell--completed' : 'calendar__day-cell--missed';
    return `<div class="calendar__day-cell ${cls}"><span class="calendar__tick">${status}</span></div>`;
  }).join('');
  return `
    <div class="calendar__row calendar__row--habit">
      <div class="calendar__habit-title">${habit.nombre}</div>
      ${cells}
    </div>
  `;
};

// ------------------------
// LÓGICA DE VISTAS DEL DASHBOARD (auxiliar)
// ------------------------
const setupDashboardViews = () => {
  const viewButtons = $$('.dashboard__view-button'); 
  const calendarContainers = $$('[data-calendar]');
  if (!viewButtons.length || !calendarContainers.length) return;

  const switchView = (viewName) => {
    calendarContainers.forEach(container => container.style.display = 'none');
    const selected = $(`[data-calendar="${viewName}"]`);
    if (selected) selected.style.display = 'block';
    viewButtons.forEach(button => {
      button.classList.toggle('dashboard__view-button--active', button.getAttribute('data-view') === viewName);
    });
  };

  viewButtons.forEach(button => {
    button.addEventListener('click', () => switchView(button.getAttribute('data-view')));
  });

  switchView('weekly');
};
