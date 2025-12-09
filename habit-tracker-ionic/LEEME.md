# Práctica Evaluable 4: Aplicaciones web en dispositivos móviles

## Autores
- **Alumno 1:** Juan Carlos Ponce de León Ruiz.
- **Alumno 2:** Iker

## Descripción del Proyecto
Esta aplicación es la versión móvil del "Habit Tracker" (Gestor de Hábitos) desarrollado con **Ionic para Vue** y **TypeScript**. Permite a los usuarios gestionar sus hábitos diarios desde dispositivos móviles con una interfaz nativa.

## Tecnologías Utilizadas
- **Framework:** Ionic 8 para Vue 3
- **Lenguaje:** TypeScript
- **Estado:** Pinia (Stores para Auth y Hábitos)
- **Routing:** Vue Router con Ionic Router
- **Backend:** PocketBase
- **Build Tool:** Vite

## Requisitos Mínimos Implementados (7 puntos)

### ✅ Login/Logout
- Pantalla de login (`LoginPage.vue`) con componentes Ionic
- Pantalla de registro (`RegisterPage.vue`)
- Logout desde la pantalla de hábitos
- Protección de rutas con guards de navegación

### ✅ CRUD de Hábitos
- **Crear:** Pantalla `NewHabitPage.vue` con formulario validado
- **Leer:** Pantalla `HabitsPage.vue` con lista de hábitos usando `ion-list`
- **Actualizar:** Pantalla `EditHabitPage.vue` para editar hábitos
- **Eliminar:** Botón de eliminar con confirmación usando `alertController`
- **Ver detalles:** Modal `HabitDetailsModal.vue` para ver información completa

### ✅ Componentes Ionic Utilizados
- `ion-page`: Contenedor principal de cada pantalla
- `ion-header` / `ion-toolbar`: Barra superior
- `ion-content`: Área de contenido principal
- `ion-list` / `ion-item`: Lista de hábitos
- `ion-item-sliding`: Items deslizables con acciones
- `ion-item-options`: Opciones de editar/eliminar
- `ion-fab` / `ion-fab-button`: Botón flotante para añadir
- `ion-searchbar`: Búsqueda de hábitos
- `ion-select`: Filtro por frecuencia
- `ion-checkbox`: Marcar como completado
- `ion-card`: Tarjetas para formularios
- `ion-input` / `ion-textarea`: Campos de formulario
- `ion-button`: Botones de acción
- `ion-modal`: Modal de detalles
- `ion-alert`: Confirmaciones

## Estructura del Proyecto

```
habit-tracker-ionic/
├── src/
│   ├── components/
│   │   └── HabitDetailsModal.vue    # Modal de detalles
│   ├── services/
│   │   ├── pb.ts                    # Cliente PocketBase
│   │   ├── auth.ts                  # Servicios de autenticación
│   │   └── habitos.ts               # Servicios de hábitos
│   ├── stores/
│   │   ├── authStore.ts             # Store de autenticación
│   │   └── habitsStore.ts           # Store de hábitos
│   ├── views/
│   │   ├── LoginPage.vue            # Pantalla de login
│   │   ├── RegisterPage.vue         # Pantalla de registro
│   │   ├── HabitsPage.vue           # Pantalla principal (lista)
│   │   ├── NewHabitPage.vue         # Crear hábito
│   │   └── EditHabitPage.vue        # Editar hábito
│   ├── router/
│   │   └── index.ts                 # Configuración de rutas
│   └── main.ts                      # Punto de entrada
```

## Instrucciones para Probar la Aplicación

### 1. Asegúrate de que PocketBase esté corriendo

Antes de iniciar la aplicación Ionic, necesitas tener PocketBase ejecutándose:

```bash
cd ADI/habit-tracker-vue
./pocketbase serve
# O en Windows:
pocketbase.exe serve
```

Verifica que esté corriendo en `http://127.0.0.1:8090`

### 2. Instalar dependencias

```bash
cd ADI/habit-tracker-ionic
npm install
```

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Esto iniciará el servidor de desarrollo en `http://localhost:5173`

### 4. Probar la aplicación

1. **Login/Registro:**
   - Abre la aplicación en el navegador
   - Deberías ver la pantalla de login
   - Puedes registrarte o iniciar sesión

2. **Lista de Hábitos:**
   - Después del login, verás la lista de hábitos
   - Usa el botón flotante (+) para añadir un hábito
   - Desliza un hábito hacia la izquierda para ver opciones de editar/eliminar
   - Marca/desmarca el checkbox para cambiar el estado

3. **Búsqueda y Filtros:**
   - Usa la barra de búsqueda para buscar por nombre
   - Selecciona una frecuencia en el filtro

4. **Editar/Eliminar:**
   - Desliza un hábito y toca el icono de editar
   - O toca el icono de eliminar y confirma

## Características Implementadas

- ✅ Interfaz móvil nativa con componentes Ionic
- ✅ Navegación entre pantallas con guards de autenticación
- ✅ Validación de formularios
- ✅ Búsqueda y filtrado de hábitos
- ✅ Paginación
- ✅ Confirmaciones con alertas nativas
- ✅ Modales para ver detalles
- ✅ Items deslizables para acciones rápidas
- ✅ Botón flotante para acciones principales

## Notas Técnicas

- El proyecto usa TypeScript para mayor seguridad de tipos
- Los stores de Pinia mantienen el estado reactivo
- Los servicios abstraen la lógica de comunicación con PocketBase
- Las rutas están protegidas con guards que verifican autenticación
- Los componentes siguen las convenciones de Ionic para una experiencia móvil nativa

## Próximos Pasos (Requisitos Adicionales)

Para obtener puntos adicionales, se pueden implementar:

1. **CRUD de más de un recurso** (+1 punto): Añadir otra pantalla con tabs o sidebar
2. **Notificaciones en tiempo real** (+1 punto): Usar el realtime API de PocketBase
3. **Desplegar como PWA** (+2 puntos): Frontend en Vercel/Netlify y backend en Azure

