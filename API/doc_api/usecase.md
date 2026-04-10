# ACTORES GLOBALES

- **Sistema**
  - API (FastAPI)
  - Backend (SQLAlchemy)
  - Base de Datos (PostgreSQL/SQLite)
- **Cliente**
  - Aplicación Frontend
  - Consumidores de la API (apps móviles, servicios)

---

## UC-01: Registrar Usuario

**Descripción**: El usuario debe poder registrarse en la plataforma.

**Precondiciones**:
- El usuario debe encontrarse en la pantalla de login y haber seleccionado "Registrar cuenta"

### Flujo Principal (REGISTRARSE)

| Paso | Actor | Acción |
|------|-------|--------|
| A | Usuario | Ingresa datos (username, password) |
| B | Sistema | Valida datos y códigos [200 OK] |
| C | Sistema | Genera salt y hash de la contraseña |
| D | Sistema | Crea usuario en la base de datos |
| E | Sistema | Retorna mensaje **Registro exitoso** |

### Flujos Alternativos

| Paso | Condición | Resultado |
|------|-----------|-----------|
| B | El usuario ya existe | Sistema muestra error [409 Conflict] |
| B | Contraseña no cumple requisitos | Sistema muestra error [400 Bad Request] |
| B | Datos vacíos o inválidos | Sistema muestra error [422 Unprocessable Entity] |

### INPUTS

```
username: str (max 50 caracteres, alfanumérico con underscore)
password: str (min 8 caracteres, debe incluir: mayúscula, minúscula, número, caracter especial)
```

### OUTPUT

**Éxito** `201 Created`
```json
{
    "status": 201,
    "message": "Registro exitoso",
    "user_id": 1
}
```

**Error** `409 Conflict` - Usuario ya registrado
```json
{
    "status": 409,
    "error": "El usuario ya existe"
}
```

**Error** `400 Bad Request` - Contraseña no cumple requisitos
```json
{
    "status": 400,
    "error": "La contraseña no cumple con los requisitos de seguridad"
}
```

---

## UC-02: Iniciar Sesión

**Descripción**: El usuario debe poder iniciar sesión con sus credenciales.

**Precondiciones**:
- El usuario debe haberse registrado previamente

### Flujo Principal (INICIAR SESIÓN)

| Paso | Actor | Acción |
|------|-------|--------|
| A | Usuario | Ingresa credenciales (username, password) |
| B | Sistema | Valida credenciales [200 OK] |
| C | Sistema | Genera token JWT |
| D | Sistema | Registra sesión en base de datos |
| E | Sistema | Retorna mensaje **Autenticación exitosa** + token |

### Flujos Alternativos

| Paso | Condición | Resultado |
|------|-----------|-----------|
| B | Usuario no registrado | Sistema muestra error [404 Not Found] |
| B | Contraseña incorrecta | Sistema muestra error [401 Unauthorized] |
| B | Campos vacíos | Sistema muestra error [422 Unprocessable Entity] |

### INPUTS

```
username: str (max 50 caracteres)
password: str (sin restricción de longitud para login)
```

### OUTPUT

**Éxito** `200 OK` - Inicio de sesión exitoso
```json
{
    "status": 200,
    "message": "Autenticación exitosa",
    "user_id": 1,
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600
}
```

**Error** `404 Not Found` - Usuario no encontrado
```json
{
    "status": 404,
    "error": "El usuario no se encuentra registrado"
}
```

**Error** `401 Unauthorized` - Contraseña incorrecta
```json
{
    "status": 401,
    "error": "La contraseña no coincide"
}
```

---

## UC-03: Cerrar Sesión (Logout)

**Descripción**: El usuario autenticado debe poder cerrar su sesión.

**Precondiciones**:
- El usuario debe tener una sesión activa con token válido

### Flujo Principal (CERRAR SESIÓN)

| Paso | Actor | Acción |
|------|-------|--------|
| A | Usuario | Solicita cierre de sesión con token |
| B | Sistema | Valida token JWT [200 OK] |
| C | Sistema | Invalida sesión en base de datos |
| D | Sistema | Retorna mensaje **Sesión cerrada exitosamente** |

### Flujos Alternativos

| Paso | Condición | Resultado |
|------|-----------|-----------|
| B | Token expirado | Sistema muestra error [401 Unauthorized] |
| B | Token inválido | Sistema muestra error [401 Unauthorized] |

### INPUTS

```
Authorization: Bearer <token_jwt>
```

### OUTPUT

**Éxito** `200 OK`
```json
{
    "status": 200,
    "message": "Sesión cerrada exitosamente"
}
```

**Error** `401 Unauthorized` - Token inválido o expirado
```json
{
    "status": 401,
    "error": "Token inválido o expirado"
}
```

[back to README](README.md)
