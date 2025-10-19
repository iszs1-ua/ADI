# ADI
✅ Checklist de la Parte II (PocketBase + capa de servicios)
1) Autenticación de usuarios

 Login con email/password.

 Registro de usuario.

 Persistencia de sesión (la hace el SDK en localStorage).

 Logout (botón que llame a pb.authStore.clear() y redirija a /login).

2) CRUD del recurso principal (hábitos)

Colección: habitos (campos: nombre, descripcion, frecuencia, completado, usuario (Relation → users))

 Crear un hábito (desde new-habit).

 Listar hábitos del usuario actual (desde habitos).

 Editar un hábito por id (desde edit-habit).

 Eliminar un hábito por id.

 Marcar completado / pendiente (update booleano).

3) Búsqueda / filtros (requerido)

 Buscar hábitos por texto (ej. en nombre o descripcion).

 Filtrar por frecuencia (daily/weekly/3-times-a-week).
👉 Esto se hace con getList(page, perPage, { filter: 'nombre ~ "agua" && frecuencia="weekly"' }) y un <input> / <select> en la página habitos.

4) Listar todos (ya cubierto)

 Listado de hábitos del usuario con getList (reglas RLS ya filtran por usuario).

5) CRUD de usuarios (además de autenticación)

 Create (registro).

 Read (mostrar perfil del usuario logeado).

 Update (permitir cambiar username o avatar).

 Delete (opcional: botón “Eliminar mi cuenta” → pb.collection('users').delete(id)).

Nota: Eliminar usuarios suele requerir privilegios o una Cloud Function. Si no lo queréis, con Update del usuario sería suficiente para marcar CRUD razonable (C+R+U al menos). Si queréis Delete, podéis permitir selfDelete en reglas o hacerlo desde admin con una función.
