# Instrucciones para Probar la Aplicación

## 1. Asegúrate de que PocketBase esté corriendo

Antes de iniciar la aplicación Vue, necesitas tener PocketBase ejecutándose:

1. Abre una terminal y navega a la carpeta donde tienes PocketBase
2. Ejecuta PocketBase:
   ```bash
   ./pocketbase serve
   ```
   O en Windows:
   ```bash
   pocketbase.exe serve
   ```

3. Verifica que esté corriendo en `http://127.0.0.1:8090`

## 2. Instalar dependencias (si es necesario)

Si no has instalado las dependencias aún, ejecuta:

```bash
cd habit-tracker-vue
npm install
```

## 3. Iniciar el servidor de desarrollo

En una nueva terminal, navega a la carpeta del proyecto Vue y ejecuta:

```bash
cd habit-tracker-vue
npm run dev
```

Esto iniciará el servidor de desarrollo en `http://localhost:5173` (o el puerto que Vite asigne).

## 4. Probar la aplicación

### Paso 1: Registro de usuario
1. Abre el navegador en la URL que muestra Vite (normalmente `http://localhost:5173`)
2. Deberías ver la página de login
3. Haz clic en "Regístrate" o ve a `/register`
4. Completa el formulario:
   - Nombre de usuario (mínimo 3 caracteres)
   - Email válido
   - Contraseña (mínimo 8 caracteres)
   - Confirmar contraseña
5. Haz clic en "Registrarse"
6. Deberías ser redirigido automáticamente a `/habits`

### Paso 2: Crear un hábito
1. Haz clic en el botón "+ Nuevo Hábito" o ve a `/habits/new`
2. Completa el formulario:
   - Nombre del hábito (mínimo 3 caracteres)
   - Descripción (opcional)
   - Frecuencia (selecciona una)
3. Haz clic en "Crear Hábito"
4. Deberías ver el nuevo hábito en la lista

### Paso 3: Ver detalles
1. En la lista de hábitos, haz clic en "Ver detalles" de cualquier hábito
2. Se abrirá un modal mostrando toda la información
3. Cierra el modal haciendo clic fuera o en el botón "Cerrar"

### Paso 4: Editar un hábito
1. Haz clic en "Editar" en cualquier hábito
2. Modifica los campos que quieras
3. Haz clic en "Guardar Cambios"
4. Verifica que los cambios se hayan guardado

### Paso 5: Marcar como completado
1. Haz clic en "Marcar como completado" en un hábito
2. El botón debería cambiar a "✓ Completado"
3. Haz clic de nuevo para marcarlo como pendiente

### Paso 6: Buscar y filtrar
1. En la página de hábitos, usa el campo de búsqueda
2. Escribe parte del nombre de un hábito
3. La lista se filtrará automáticamente
4. Prueba el filtro de frecuencia seleccionando una opción

### Paso 7: Eliminar un hábito
1. Haz clic en "Eliminar" en cualquier hábito
2. Confirma la eliminación
3. El hábito debería desaparecer de la lista

### Paso 8: Paginación
1. Si tienes más de 10 hábitos, verás botones de paginación
2. Haz clic en "Siguiente" o "Anterior" para navegar

### Paso 9: Ver perfil
1. Haz clic en "Perfil" en el header
2. Verás tus estadísticas de hábitos
3. Puedes cerrar sesión desde aquí o desde el header

### Paso 10: Cerrar sesión
1. Haz clic en "Cerrar Sesión" en el header
2. Confirma la acción
3. Deberías ser redirigido al login

## 5. Verificar funcionalidades adicionales

### Transiciones y animaciones
- Al crear/eliminar hábitos, deberías ver animaciones suaves
- El modal de detalles tiene animación de entrada/salida
- Los formularios "tiemblan" cuando hay errores de validación

### Validación de formularios
- Intenta enviar un formulario vacío → debería mostrar errores
- Intenta crear un hábito con nombre muy corto → debería mostrar error
- Intenta registrar con contraseñas que no coincidan → debería mostrar error

### Protección de rutas
- Intenta acceder a `/habits` sin estar logueado → debería redirigir al login
- Después de hacer login, deberías ser redirigido a la página que intentabas ver

## Solución de problemas

### Error: "Cannot connect to PocketBase"
- Verifica que PocketBase esté corriendo en `http://127.0.0.1:8090`
- Revisa la URL en `src/services/pb.js`

### Error: "Module not found"
- Ejecuta `npm install` en la carpeta `habit-tracker-vue`

### La aplicación no carga
- Verifica que el puerto no esté en uso
- Revisa la consola del navegador para ver errores

### Los hábitos no se cargan
- Verifica que estés autenticado
- Revisa la consola del navegador
- Verifica que la colección "habitos" exista en PocketBase con los campos correctos

