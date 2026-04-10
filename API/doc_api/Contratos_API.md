# CONTRATOS API

*MÓDULO SESSION*

## ENDPOINTS

### A. Registro de Usuario

```
POST /api/v1/auth/register
```

### B. Inicio de Sesión

```
POST /api/v1/auth/login
```

### C. Cerrar Sesión

```
POST /api/v1/auth/logout
```

### D. Verificar Token

```
GET /api/v1/auth/me
```

---

# PAYLOADS (REQUEST)

## A. POST /api/v1/auth/register

```json
{
    "username": "juanito23",
    "password": "Juanito*2024"
}
```

### Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| username | string | Sí | Nombre de usuario (3-50 caracteres) |
| password | string | Sí | Contraseña (mín 8 caracteres) |

---

## B. POST /api/v1/auth/login

```json
{
    "username": "juanito23",
    "password": "Juanito*2024"
}
```

### Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| username | string | Sí | Nombre de usuario |
| password | string | Sí | Contraseña |

---

## C. POST /api/v1/auth/logout

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Headers

```
Authorization: Bearer <token_jwt>
```

---

# RESPONSES

## A. POST /api/v1/auth/register - Éxito (201 Created)

```json
{
    "status": 201,
    "message": "Registro exitoso",
    "user_id": 1,
    "username": "juanito23"
}
```

---

## B. POST /api/v1/auth/login - Éxito (200 OK)

```json
{
    "status": 200,
    "message": "Autenticación exitosa",
    "user_id": 1,
    "username": "juanito23",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600
}
```

---

## C. POST /api/v1/auth/logout - Éxito (200 OK)

```json
{
    "status": 200,
    "message": "Sesión cerrada exitosamente"
}
```

---

## D. GET /api/v1/auth/me - Éxito (200 OK)

```json
{
    "status": 200,
    "user_id": 1,
    "username": "juanito23",
    "created_at": "2024-01-15T10:30:00Z"
}
```

---

# MANEJO DE ERRORES

## A. POST /api/v1/auth/register

### Error 409 Conflict - Usuario ya existe

```json
{
    "status": 409,
    "error": "El usuario ya existe"
}
```

### Error 400 Bad Request - Contraseña no cumple requisitos

```json
{
    "status": 400,
    "error": "La contraseña no cumple con los requisitos de seguridad"
}
```

### Error 422 Unprocessable Entity - Datos inválidos

```json
{
    "status": 422,
    "error": "Datos inválidos",
    "details": [
        {
            "field": "username",
            "message": "El nombre de usuario debe tener entre 3 y 50 caracteres"
        }
    ]
}
```

---

## B. POST /api/v1/auth/login

### Error 404 Not Found - Usuario no registrado

```json
{
    "status": 404,
    "error": "El usuario no se encuentra registrado"
}
```

### Error 401 Unauthorized - Contraseña incorrecta

```json
{
    "status": 401,
    "error": "La contraseña no coincide"
}
```

### Error 422 Unprocessable Entity - Campos vacíos

```json
{
    "status": 422,
    "error": "Datos inválidos",
    "details": [
        {
            "field": "username",
            "message": "El campo username es requerido"
        }
    ]
}
```

---

## C. POST /api/v1/auth/logout

### Error 401 Unauthorized - Token inválido

```json
{
    "status": 401,
    "error": "Token inválido o expirado"
}
```

---

## D. GET /api/v1/auth/me

### Error 401 Unauthorized - No autenticado

```json
{
    "status": 401,
    "error": "No autorizado. Token requerido"
}
```

### Error 401 Unauthorized - Token expirado

```json
{
    "status": 401,
    "error": "Token expirado"
}
```

---

# CÓDIGOS DE ESTADO HTTP

| Código | Descripción | Uso |
|--------|-------------|-----|
| 200 | OK | Login exitoso, logout exitoso, token válido |
| 201 | Created | Usuario registrado exitosamente |
| 400 | Bad Request | Datos inválidos o requisitos no cumplidos |
| 401 | Unauthorized | Credenciales incorrectas o token inválido |
| 404 | Not Found | Recurso no encontrado (usuario) |
| 409 | Conflict | Recurso duplicado (usuario ya existe) |
| 422 | Unprocessable Entity | Validación de datos fallida |
| 500 | Internal Server Error | Error interno del servidor |

[back to README](README.md)
