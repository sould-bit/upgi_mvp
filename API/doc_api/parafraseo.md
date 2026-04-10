***construir una API REST con FastAPI capaz de gestionar el registro de usuarios e inicio de sesión***

## Definición del Sistema

La API proporcionará endpoints para:

1. **Registro de Usuarios**
   - Recibir datos del usuario (nombre de usuario y contraseña)
   - Validar que el nombre de usuario sea único en el sistema
   - Validar que la contraseña cumpla con requisitos de seguridad mínimos
   - Almacenar la contraseña de forma segura utilizando hash + salt con bcrypt
   - Devolver confirmación exitosa o error según corresponda

2. **Inicio de Sesión (Login)**
   - Recibir credenciales del usuario (nombre y contraseña)
   - Verificar si el usuario existe en la base de datos
   - Comparar la contraseña ingresada con el hash almacenado
   - Generar token JWT para sesiones autenticadas
   - Devolver respuesta de autenticación exitosa o error según corresponda

## Objetivos del Negocio

- Permitir que nuevos usuarios se registren en la plataforma
- Garantizar la seguridad de las credenciales mediante hashing
- Proporcionar acceso autenticado a usuarios registrados
- Mantener un historial de sesiones con timestamps

[back to README](README.md)
