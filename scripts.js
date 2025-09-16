document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('[data-nav]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Previene el comportamiento por defecto del enlace de recargar la página
            e.preventDefault();
            
            // Simula la navegación de una SPA
            const targetPage = e.target.getAttribute('href');
            
            // Actualiza la URL sin recargar la página (usando History API)
            window.history.pushState({}, '', targetPage);
            
            // Opcional: Cambia la clase 'active' para simular la navegación
            navLinks.forEach(navLink => {
                navLink.classList.remove('site-header__nav-link--active');
            });
            e.target.classList.add('site-header__nav-link--active');
            
            // Aquí podrías añadir lógica para cargar dinámicamente el contenido
            // En este prototipo, simplemente se cambia la clase activa,
            // ya que cada archivo HTML ya contiene su propio contenido.
            console.log(`Navegando a: ${targetPage}`);
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Lógica del selector de vistas
    const viewButtons = document.querySelectorAll('.dashboard__view-button');
    const calendars = document.querySelectorAll('[data-calendar]');

    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Eliminar la clase activa de todos los botones
            viewButtons.forEach(btn => btn.classList.remove('dashboard__view-button--active'));
            // Añadir la clase activa al botón clickeado
            button.classList.add('dashboard__view-button--active');
            
            // Ocultar todos los calendarios
            calendars.forEach(calendar => calendar.style.display = 'none');
            
            // Mostrar el calendario correspondiente al botón
            const viewType = button.getAttribute('data-view');
            document.querySelector(`[data-calendar="${viewType}"]`).style.display = 'grid'; // Usar 'grid' o 'flex' según el diseño
        });
    });

    // Tu lógica de navegación para la SPA (sin cambios)
    const navLinks = document.querySelectorAll('[data-nav]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = e.target.getAttribute('href');
            window.history.pushState({}, '', targetPage);
            navLinks.forEach(navLink => {
                navLink.classList.remove('site-header__nav-link--active');
            });
            e.target.classList.add('site-header__nav-link--active');
            console.log(`Navegando a: ${targetPage}`);
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Lógica para el selector de vistas del dashboard
    const viewButtons = document.querySelectorAll('.dashboard__view-button');
    const calendars = document.querySelectorAll('[data-calendar]');

    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Eliminar la clase activa de todos los botones
            viewButtons.forEach(btn => btn.classList.remove('dashboard__view-button--active'));
            // Añadir la clase activa al botón clickeado
            button.classList.add('dashboard__view-button--active');

            // Ocultar todos los calendarios
            calendars.forEach(calendar => {
                calendar.style.display = 'none';
            });

            // Mostrar el calendario correspondiente al botón
            const viewType = button.getAttribute('data-view');
            const targetCalendar = document.querySelector(`[data-calendar="${viewType}"]`);
            if (targetCalendar) {
                // Usa 'flex' para la vista semanal y 'grid' para el resto.
                if (viewType === 'weekly') {
                    targetCalendar.style.display = 'block'; // Usar 'block' para que los hijos sigan la estructura original
                } else {
                    targetCalendar.style.display = 'block'; // Usar 'block' para que los hijos sigan la estructura original
                }
            }
        });
    });

    // Tu lógica de navegación para la SPA (sin cambios)
    const navLinks = document.querySelectorAll('[data-nav]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = e.target.getAttribute('href');
            window.history.pushState({}, '', targetPage);
            navLinks.forEach(navLink => {
                navLink.classList.remove('site-header__nav-link--active');
            });
            e.target.classList.add('site-header__nav-link--active');
            console.log(`Navegando a: ${targetPage}`);
        });
    });
});