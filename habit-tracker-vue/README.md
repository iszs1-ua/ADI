# 🎯 Habit Tracker - Migración con Patrón Adapter

**Trabajo para ADI 2526: Migración de arquitectura de PocketBase a Supabase implementando el Patrón Adapter**

Este proyecto demuestra cómo usar el **Patrón Adapter** para hacer una aplicación Vue.js independiente del backend, permitiendo alternar entre **PocketBase** y **Supabase** sin modificar el código de la aplicación.

---

## 📋 Descripción del Trabajo

### Tema
Migración de arquitectura de PocketBase a Supabase mediante el **Patrón Adapter** (también conocido como Wrapper).

### Objetivo
Refactorizar la capa de servicios de la práctica implementando el Patrón Adapter, lo que permite:
- ✅ Hacer la aplicación independiente del backend específico
- ✅ Alternar entre PocketBase y Supabase mediante configuración
- ✅ Cambiar de backend dinámicamente sin alterar la interfaz de la aplicación
- ✅ Demostrar un patrón de diseño estructural profesional

---

## 🏗️ Arquitectura: Patrón Adapter

### ¿Qué es el Patrón Adapter?

El **Patrón Adapter** es un patrón de diseño estructural que permite que objetos con interfaces incompatibles trabajen juntos. Actúa como un puente entre dos interfaces incompatibles.

### Estructura en este proyecto

```
┌─────────────────────────────────────┐
│     Aplicación Vue.js (Cliente)     │
│   Solo conoce BackendAdapter        │
└──────────────┬──────────────────────┘
               │
               ▼
     ┌───────────────────┐
     │ BackendAdapter    │  ← Interfaz común
     │  (Target)         │
     └─────────┬─────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
┌──────────┐        ┌──────────┐
│PocketBase│        │ Supabase │
│ Adapter  │        │ Adapter  │
└──────────┘        └──────────┘
```

### Componentes Implementados

1. **`BackendAdapter.js`**: Interfaz base que define el contrato común
2. **`PocketBaseAdapter.js`**: Adapta la API de PocketBase a la interfaz común
3. **`SupabaseAdapter.js`**: Adapta la API de Supabase a la interfaz común
4. **`BackendFactory.js`**: Factory Pattern para crear instancias de adaptadores
5. **`adapterService.js`**: Servicio centralizado que gestiona el adaptador actual

---

## 🚀 Características

- ✅ **Autenticación**: Login y registro funcionando en ambos backends
- ✅ **CRUD de Hábitos**: Crear, leer, actualizar y eliminar hábitos
- ✅ **Marcas de Completado**: Sistema de tracking diario de hábitos
- ✅ **Cambio Dinámico**: Botón para alternar entre PocketBase y Supabase en tiempo real
- ✅ **Normalización de Datos**: Conversión automática entre formatos de cada backend

---

## 📦 Instalación

### Prerrequisitos

- Node.js ^20.19.0 o >=22.12.0
- PocketBase ejecutándose en `http://127.0.0.1:8090` (para modo PocketBase)
- Proyecto de Supabase configurado (para modo Supabase)

### Pasos

1. **Clonar el repositorio** (si aplica)
   ```bash
   git clone <repository-url>
   cd habit-tracker-vue
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar backends**

   Edita `src/config.js`:
   ```javascript
   export const config = {
     DEFAULT_BACKEND: 'pocketbase', // o 'supabase'
     POCKETBASE_URL: 'http://127.0.0.1:8090',
     SUPABASE_URL: 'https://tu-proyecto.supabase.co',
     SUPABASE_ANON_KEY: 'tu-anon-key'
   }
   ```

4. **Configurar Supabase** (si usas Supabase)
   
   Ejecuta el script SQL en el SQL Editor de Supabase:
   ```bash
   sql/supabase-migration.sql
   ```

5. **Iniciar PocketBase** (si usas PocketBase)
   ```bash
   ./pocketbase serve
   ```

6. **Ejecutar la aplicación**
   ```bash
   npm run dev
   ```

---

## 🎮 Uso

### Cambiar de Backend

Puedes cambiar entre PocketBase y Supabase de tres formas:

1. **Desde la configuración**: Edita `src/config.js` y cambia `DEFAULT_BACKEND`
2. **Desde el header** (cuando estás autenticado): Click en el botón "🔄 PocketBase" o "🔄 Supabase"
3. **Desde Login/Registro**: Click en el botón del selector de backend

⚠️ **Nota**: Los datos son independientes entre backends. Necesitarás crear cuentas y datos en cada uno por separado.

---

## 📁 Estructura del Proyecto

```
habit-tracker-vue/
├── src/
│   ├── adapters/              # Patrón Adapter
│   │   ├── BackendAdapter.js      # Interfaz común
│   │   ├── PocketBaseAdapter.js   # Adaptador PocketBase
│   │   ├── SupabaseAdapter.js     # Adaptador Supabase
│   │   └── BackendFactory.js      # Factory Pattern
│   ├── services/
│   │   ├── adapterService.js  # Gestión centralizada del adaptador
│   │   ├── auth.js            # Autenticación (usa adaptador)
│   │   ├── habitos.js         # CRUD hábitos (usa adaptador)
│   │   └── marcas.js          # Tracking (usa adaptador)
│   ├── stores/                # Pinia stores
│   ├── views/                 # Vistas Vue.js
│   ├── components/            # Componentes Vue.js
│   └── config.js              # Configuración de backends
├── sql/
│   └── supabase-migration.sql # Migración SQL para Supabase
└── docs/
    └── PATRON_ADAPTER.md      # Documentación teórica detallada
```

---

## 🔬 Cómo Funciona

### Ejemplo: Crear un Hábito

**Sin el Patrón Adapter** (❌ Problema):
```javascript
// Código acoplado a PocketBase
const habit = await pb.collection('habitos').create(data)

// Si queremos usar Supabase, hay que reescribir todo:
const { data: habit } = await supabase.from('habitos').insert(data).select()
```

**Con el Patrón Adapter** (✅ Solución):
```javascript
// La aplicación solo conoce la interfaz común
const adapter = getAdapter() // PocketBase o Supabase según configuración
const habit = await adapter.createHabit({
  nombre: 'Beber agua',
  descripcion: '2 litros al día',
  frecuencia: 'daily'
})

// ¡Cambiar de backend es solo cambiar la configuración!
```

---

## 📚 Referencias

### Documentación Oficial

1. **Vue.js 3**: [Documentación oficial](https://vuejs.org/)
2. **PocketBase**: [Documentación oficial](https://pocketbase.io/docs/)
3. **Supabase**: [Documentación oficial](https://supabase.com/docs)
4. **Pinia**: [Estado global para Vue.js](https://pinia.vuejs.org/)

### Patrones de Diseño

5. **Refactoring Guru - Adapter Pattern**: [https://refactoring.guru/design-patterns/adapter](https://refactoring.guru/design-patterns/adapter)
6. **SourceMaking - Adapter Pattern**: [https://sourcemaking.com/design_patterns/adapter](https://sourcemaking.com/design_patterns/adapter)
7. **Design Patterns: Elements of Reusable Object-Oriented Software** (Gang of Four) - Capítulo 4: Adapter Pattern

### Recursos Adicionales

8. **Vite**: [Build tool documentation](https://vite.dev/)
9. **MDN Web Docs - JavaScript Classes**: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
10. **Stack Overflow**: Discusiones sobre implementación de Adapter Pattern en JavaScript

### Videos y Tutoriales

11. **YouTube**: Búsqueda "JavaScript Adapter Pattern" para ejemplos prácticos
12. **FreeCodeCamp**: Tutoriales sobre patrones de diseño en JavaScript

### LLMs y Asistentes

13. **ChatGPT/Claude**: Consultas sobre implementación de Adapter Pattern y arquitectura de software
14. **GitHub Copilot**: Asistencia en la escritura del código

---

## 🎥 Presentación del Trabajo

Este proyecto forma parte de un trabajo académico que incluye:

- ✅ **Implementación funcional** del Patrón Adapter
- ✅ **Código fuente** completo y documentado
- 📹 **Video de presentación** (5-15 minutos) explicando el patrón y la demostración

---

## 👥 Autores

- Iker Sanchez Zaragoza
- Juan Carlos Ponce de León Ruiz

---

## 📝 Notas Técnicas

- El proyecto usa **Vue.js 3** con **Composition API**
- **Pinia** para gestión de estado
- **Vite** como build tool
- **Vuetify** para componentes UI (en algunas vistas)
- **ES6+ JavaScript** (módulos, clases, async/await)

---

## ⚖️ Licencia

Este proyecto es parte de un trabajo académico para la asignatura ADI 2526.

---

## 🔗 Enlaces Rápidos

- [Documentación teórica detallada](./docs/PATRON_ADAPTER.md)
- [Migración SQL para Supabase](./sql/supabase-migration.sql)
- [Configuración de backends](./src/config.js)
