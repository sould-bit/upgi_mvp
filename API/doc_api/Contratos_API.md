# CONTRATOS API - UPGI

## BASE URL

```
http://localhost:8000/api/v1
```

## ENDPOINTS POR DOMINIO

---

# DOMINIO: AUTH

## A01. Registrar Usuario

```
POST /auth/register
```

### Request

```json
{
    "email": "usuario@email.com",
    "password": "Password*123",
    "nombre": "Juan Pérez",
    "telefono": "3001234567"
}
```

### Response 201 Created

```json
{
    "status": 201,
    "message": "Registro exitoso",
    "user_id": 1
}
```

### Errors

| Code | Response |
|------|----------|
| 400 | `{"status": 400, "error": "Datos inválidos", "details": [...]}` |
| 409 | `{"status": 409, "error": "El email ya está registrado"}` |

---

## A02. Iniciar Sesión

```
POST /auth/login
```

### Request

```json
{
    "email": "usuario@email.com",
    "password": "Password*123"
}
```

### Response 200 OK

```json
{
    "status": 200,
    "message": "Autenticación exitosa",
    "user_id": 1,
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 86400,
    "user": {
        "id": 1,
        "email": "usuario@email.com",
        "nombre": "Juan Pérez",
        "is_admin": false
    }
}
```

### Errors

| Code | Response |
|------|----------|
| 401 | `{"status": 401, "error": "Credenciales incorrectas"}` |
| 404 | `{"status": 404, "error": "El usuario no existe"}` |
| 422 | `{"status": 422, "error": "Validación fallida", "details": [...]}` |

---

## A03. Cerrar Sesión

```
POST /auth/logout
```

### Headers

```
Authorization: Bearer <token_jwt>
```

### Response 200 OK

```json
{
    "status": 200,
    "message": "Sesión cerrada exitosamente"
}
```

### Errors

| Code | Response |
|------|----------|
| 401 | `{"status": 401, "error": "No autorizado"}` |

---

## A04. Obtener Usuario Actual

```
GET /auth/me
```

### Headers

```
Authorization: Bearer <token_jwt>
```

### Response 200 OK

```json
{
    "status": 200,
    "user": {
        "id": 1,
        "email": "usuario@email.com",
        "nombre": "Juan Pérez",
        "telefono": "3001234567",
        "is_admin": false,
        "created_at": "2024-01-10T10:30:00Z"
    }
}
```

### Errors

| Code | Response |
|------|----------|
| 401 | `{"status": 401, "error": "Token inválido o expirado"}` |

---

# DOMINIO: CANCHAS

## C01. Listar Canchas

```
GET /canchas
```

### Response 200 OK

```json
{
    "status": 200,
    "canchas": [
        {
            "id": 1,
            "nombre": "Cancha 1",
            "tipo": "Fútbol 5",
            "precio_hora": 15000.00,
            "capacidad": 10,
            "is_active": true
        },
        {
            "id": 2,
            "nombre": "Cancha 2",
            "tipo": "Fútbol 7",
            "precio_hora": 20000.00,
            "capacidad": 14,
            "is_active": true
        }
    ]
}
```

---

## C02. Ver Detalle de Cancha

```
GET /canchas/{cancha_id}
```

### Response 200 OK

```json
{
    "status": 200,
    "cancha": {
        "id": 1,
        "nombre": "Cancha 1",
        "tipo": "Fútbol 5",
        "precio_hora": 15000.00,
        "capacidad": 10,
        "is_active": true,
        "horarios": [
            {
                "dia_semana": 1,
                "dia_nombre": "Lunes",
                "hora_inicio": "08:00",
                "hora_fin": "22:00"
            }
        ]
    }
}
```

### Errors

| Code | Response |
|------|----------|
| 404 | `{"status": 404, "error": "Cancha no encontrada"}` |

---

## C03. Verificar Disponibilidad

```
GET /canchas/{cancha_id}/disponibilidad
```

### Query Parameters

```
fecha: string (YYYY-MM-DD) [requerido]
hora_inicio: string (HH:MM) [requerido]
hora_fin: string (HH:MM) [requerido]
```

### Response 200 OK - Disponible

```json
{
    "status": 200,
    "disponible": true,
    "cancha": {
        "id": 1,
        "nombre": "Cancha 1"
    },
    "horas_duracion": 2,
    "duracion_label": "2 horas",
    "precio_total": 30000.00
}
```

### Response 200 OK - No Disponible

```json
{
    "status": 200,
    "disponible": false,
    "cancha": {
        "id": 1,
        "nombre": "Cancha 1"
    },
    "mensaje": "El horario seleccionado ya está reservado"
}
```

### Errors

| Code | Response |
|------|----------|
| 400 | `{"status": 400, "error": "Parámetros inválidos"}` |
| 404 | `{"status": 404, "error": "Cancha no encontrada"}` |

---

## C04. Crear Cancha (Admin)

```
POST /canchas
```

### Headers

```
Authorization: Bearer <token_jwt>
```

### Request

```json
{
    "nombre": "Cancha 3",
    "tipo": "Futsal",
    "precio_hora": 18000.00,
    "capacidad": 10
}
```

### Response 201 Created

```json
{
    "status": 201,
    "message": "Cancha creada exitosamente",
    "cancha": {
        "id": 3,
        "nombre": "Cancha 3",
        "tipo": "Futsal",
        "precio_hora": 18000.00,
        "capacidad": 10
    }
}
```

### Errors

| Code | Response |
|------|----------|
| 401 | `{"status": 401, "error": "No autorizado"}` |
| 403 | `{"status": 403, "error": "Acceso denegado"}` |

---

## C05. Editar Cancha (Admin)

```
PUT /canchas/{cancha_id}
```

### Request

```json
{
    "nombre": "Cancha 1 - Techada",
    "tipo": "Fútbol 5 Techada",
    "precio_hora": 18000.00,
    "capacidad": 10
}
```

### Response 200 OK

```json
{
    "status": 200,
    "message": "Cancha actualizada exitosamente",
    "cancha": {...}
}
```

---

# DOMINIO: RESERVAS

## R01. Crear Reserva

```
POST /reservas
```

### Headers

```
Authorization: Bearer <token_jwt>
```

### Request

```json
{
    "cancha_id": 1,
    "fecha": "2024-01-15",
    "hora_inicio": "14:00",
    "hora_fin": "16:00",
    "jugadores": 8,
    "observaciones": "Llegamos tarde, disculpen"
}
```

### Response 201 Created

```json
{
    "status": 201,
    "message": "Reserva creada exitosamente",
    "reserva": {
        "id": 1,
        "cancha": {
            "id": 1,
            "nombre": "Cancha 1"
        },
        "fecha": "2024-01-15",
        "hora_inicio": "14:00",
        "hora_fin": "16:00",
        "jugadores": 8,
        "estado_pago": "Sin pagar",
        "precio_total": 30000.00,
        "observaciones": "Llegamos tarde, disculpen"
    }
}
```

### Errors

| Code | Response |
|------|----------|
| 400 | `{"status": 400, "error": "El horario no está disponible"}` |
| 400 | `{"status": 400, "error": "La cantidad de jugadores excede la capacidad"}` |
| 401 | `{"status": 401, "error": "No autorizado"}` |
| 404 | `{"status": 404, "error": "Cancha no encontrada"}` |

---

## R02. Listar Mis Reservas

```
GET /reservas
```

### Headers

```
Authorization: Bearer <token_jwt>
```

### Query Parameters

```
fecha_desde: string (YYYY-MM-DD) [opcional]
fecha_hasta: string (YYYY-MM-DD) [opcional]
estado_pago: string [opcional]
page: int (default 1)
limit: int (default 20)
```

### Response 200 OK

```json
{
    "status": 200,
    "reservas": [
        {
            "id": 1,
            "cancha": {
                "id": 1,
                "nombre": "Cancha 1",
                "tipo": "Fútbol 5"
            },
            "fecha": "2024-01-15",
            "hora_inicio": "14:00",
            "hora_fin": "16:00",
            "jugadores": 8,
            "estado_pago": "Sin pagar",
            "precio_total": 30000.00
        }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
}
```

---

## R03. Ver Detalle de Reserva

```
GET /reservas/{reserva_id}
```

### Headers

```
Authorization: Bearer <token_jwt>
```

### Response 200 OK

```json
{
    "status": 200,
    "reserva": {
        "id": 1,
        "usuario": {
            "id": 1,
            "nombre": "Juan Pérez",
            "email": "juan@email.com",
            "telefono": "3001234567"
        },
        "cancha": {
            "id": 1,
            "nombre": "Cancha 1",
            "tipo": "Fútbol 5"
        },
        "fecha": "2024-01-15",
        "hora_inicio": "14:00",
        "hora_fin": "16:00",
        "jugadores": 8,
        "estado_pago": "Sin pagar",
        "precio_total": 30000.00,
        "observaciones": "",
        "created_at": "2024-01-10T10:30:00Z"
    }
}
```

### Errors

| Code | Response |
|------|----------|
| 401 | `{"status": 401, "error": "No autorizado"}` |
| 403 | `{"status": 403, "error": "No tienes acceso a esta reserva"}` |
| 404 | `{"status": 404, "error": "Reserva no encontrada"}` |

---

## R04. Cancelar Reserva

```
DELETE /reservas/{reserva_id}
```

### Headers

```
Authorization: Bearer <token_jwt>
```

### Response 200 OK

```json
{
    "status": 200,
    "message": "Reserva cancelada exitosamente"
}
```

### Errors

| Code | Response |
|------|----------|
| 400 | `{"status": 400, "error": "No se puede cancelar una reserva pagada"}` |
| 403 | `{"status": 403, "error": "No tienes permiso para cancelar esta reserva"}` |

---

## R05. Actualizar Estado de Pago (Admin)

```
PATCH /reservas/{reserva_id}/pago
```

### Headers

```
Authorization: Bearer <token_jwt>
```

### Request

```json
{
    "estado_pago": "Pagado"
}
```

### Response 200 OK

```json
{
    "status": 200,
    "message": "Estado de pago actualizado",
    "reserva": {
        "id": 1,
        "estado_pago": "Pagado"
    }
}
```

### Errors

| Code | Response |
|------|----------|
| 400 | `{"status": 400, "error": "Estado de pago inválido"}` |
| 403 | `{"status": 403, "error": "Acceso denegado"}` |

---

# DOMINIO: REPORTES (Admin)

## RP01. Dashboard - Estadísticas

```
GET /admin/dashboard
```

### Headers

```
Authorization: Bearer <token_jwt>
```

### Response 200 OK

```json
{
    "status": 200,
    "stats": {
        "reservas_hoy": 5,
        "reservas_semana": 23,
        "reservas_mes": 87,
        "reservas_totales": 320,
        "ingresos_hoy": 75000,
        "ingresos_semana": 345000,
        "ingresos_mes": 1305000,
        "ingresos_totales": 4800000,
        "canchas_activas": 4,
        "usuarios_totales": 45
    }
}
```

---

## RP02. Reporte Semanal

```
GET /admin/reportes/reservas-semana
```

### Query Parameters

```
fecha_inicio: string (YYYY-MM-DD) [requerido]
fecha_fin: string (YYYY-MM-DD) [requerido]
```

### Response 200 OK

```json
{
    "status": 200,
    "periodo": {
        "fecha_inicio": "2024-01-08",
        "fecha_fin": "2024-01-14"
    },
    "reporte": [
        {"label": "Lunes", "total": 5},
        {"label": "Martes", "total": 3},
        {"label": "Miércoles", "total": 7},
        {"label": "Jueves", "total": 4},
        {"label": "Viernes", "total": 8},
        {"label": "Sábado", "total": 12},
        {"label": "Domingo", "total": 10}
    ],
    "total_reservas": 49
}
```

---

## RP03. Reporte de Ingresos

```
GET /admin/reportes/ingresos
```

### Query Parameters

```
fecha_desde: string (YYYY-MM-DD) [requerido]
fecha_hasta: string (YYYY-MM-DD) [requerido]
```

### Response 200 OK

```json
{
    "status": 200,
    "periodo": {
        "fecha_desde": "2024-01-01",
        "fecha_hasta": "2024-01-31"
    },
    "ingresos": {
        "total": 1305000,
        "pagado": 1050000,
        "abonado": 255000,
        "sin_pagar": 0
    },
    "reservas_procesadas": 58,
    "reservas_pendientes": 0
}
```

---

## RP04. Listar Todas las Reservas (Admin)

```
GET /admin/reservas
```

### Query Parameters

```
fecha: string (YYYY-MM-DD) [opcional]
cancha_id: int [opcional]
estado_pago: string [opcional]
usuario_id: int [opcional]
page: int (default 1)
limit: int (default 50)
```

### Response 200 OK

```json
{
    "status": 200,
    "reservas": [
        {
            "id": 1,
            "usuario": {
                "id": 1,
                "nombre": "Juan Pérez",
                "email": "juan@email.com"
            },
            "cancha": {
                "id": 1,
                "nombre": "Cancha 1"
            },
            "fecha": "2024-01-15",
            "hora_inicio": "14:00",
            "hora_fin": "16:00",
            "estado_pago": "Pagado",
            "precio_total": 30000.00,
            "created_at": "2024-01-10T10:30:00Z"
        }
    ],
    "total": 87,
    "page": 1,
    "limit": 50
}
```

---

# CÓDIGOS DE ESTADO HTTP

| Código | Descripción | Uso común |
|--------|-------------|-----------|
| 200 | OK | Operaciones exitosas (GET, PUT, PATCH) |
| 201 | Created | Recursos creados exitosamente (POST) |
| 400 | Bad Request | Datos inválidos o reglas de negocio |
| 401 | Unauthorized | Token inválido o faltante |
| 403 | Forbidden | Sin permisos para la acción |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto (horario ocupado, duplicado) |
| 422 | Unprocessable Entity | Validación de schema fallida |
| 500 | Internal Server Error | Error interno del servidor |

[back to README](README.md)
