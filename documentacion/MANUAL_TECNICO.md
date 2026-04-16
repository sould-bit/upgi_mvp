# MANUAL TÉCNICO — UPGI
## Sistema de Gestión de Reservas Deportivas

**Versión:** 1.0  
**Fecha:** Abril 2026  
**Formato:** GFPI-F-135

---

## TABLA DE CONTENIDOS

1. [Introducción](#1-introducción)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Módulo: Autenticación](#3-módulo-autenticación)
4. [Módulo: Canchas](#4-módulo-canchas)
5. [Módulo: Reservas](#5-módulo-reservas)
6. [Módulo: Reportes](#6-módulo-reportes)
7. [Módulo: Inventario](#7-módulo-inventario)
8. [Configuración de Ambientes](#8-configuración-de-ambientes)
9. [Base de Datos](#9-base-de-datos)
10. [Seguridad](#10-seguridad)

---

## 1. INTRODUCCIÓN

### 1.1 Propósito

Este manual técnico describe la arquitectura, módulos y componentes del sistema UPGI, documentando los datos de entrada y salida de cada módulo para cumplir con los requisitos del formato GFPI-F-135.

### 1.2 Alcance

El sistema UPGI comprende los siguientes módulos funcionales:
- Autenticación (usuarios admin y consumidores)
- Gestión de Canchas
- Reservas (públicas y administrativas)
- Reportes y Estadísticas
- Inventario de Equipos

---

## 2. ARQUITECTURA DEL SISTEMA

### 2.1 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + TypeScript)            │
│                 Puerto: 5173 (desarrollo)                    │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTP/REST (JSON)
┌─────────────────────────────▼───────────────────────────────┐
│                    BACKEND (FastAPI + Python)                 │
│                 Puerto: 8000 (desarrollo)                     │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │ Canchas  │  │ Reservas │  │ Reportes │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       └─────────────┴─────────────┴─────────────┘          │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │ SQLAlchemy ORM
┌─────────────────────────▼────────────────────────────────────┐
│                   BASE DE DATOS (SQLite)                      │
│                    Archivo: upgi.db                           │
└───────────────────────────────────────────────────────────────┘
```

### 2.2 Tecnologías por Capa

| Capa | Tecnología | Puerto | Propósito |
|------|------------|--------|-----------|
| Frontend | React 18 + Vite | 5173 | Interfaz de usuario |
| Backend | FastAPI + Python 3.10+ | 8000 | API REST |
| Base de Datos | SQLite 3 | — | Persistencia local |

---

## 3. MÓDULO: AUTENTICACIÓN

### 3.1 Descripción

Gestiona el registro e inicio de sesión de usuarios administradores. Los consumidores pueden reservar sin autenticación.

### 3.2 Endpoints

#### A01 — Registrar Usuario Admin

| Atributo | Valor |
|----------|-------|
| **Método** | `POST` |
| **Ruta** | `/api/v1/auth/register` |
| **Auth** | No requerida |

**Datos de Entrada:**
```json
{
    "email": "string (email válido, único)",
    "password": "string (mín. 8 caracteres)",
    "nombre": "string (máx. 100 caracteres)",
    "telefono": "string (opcional, 10 dígitos)"
}
```

**Datos de Salida (201 Created):**
```json
{
    "status": 201,
    "message": "Registro exitoso",
    "user_id": 1
}
```

**Códigos de Error:**
| Código | Condición |
|--------|-----------|
| 400 | Datos inválidos |
| 409 | Email ya registrado |

---

#### A02 — Iniciar Sesión

| Atributo | Valor |
|----------|-------|
| **Método** | `POST` |
| **Ruta** | `/api/v1/auth/login` |
| **Auth** | No requerida |

**Datos de Entrada:**
```json
{
    "email": "string",
    "password": "string"
}
```

**Datos de Salida (200 OK):**
```json
{
    "status": 200,
    "message": "Autenticación exitosa",
    "user_id": 1,
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "expires_in": 86400,
    "user": {
        "id": 1,
        "email": "admin@ejemplo.com",
        "nombre": "Administrador",
        "is_admin": true
    }
}
```

**Códigos de Error:**
| Código | Condición |
|--------|-----------|
| 401 | Contraseña incorrecta |
| 404 | Usuario no existe |

---

#### A04 — Obtener Usuario Actual

| Atributo | Valor |
|----------|-------|
| **Método** | `GET` |
| **Ruta** | `/api/v1/auth/me` |
| **Auth** | Bearer Token |

**Datos de Entrada (Headers):**
```
Authorization: Bearer <token_jwt>
```

**Datos de Salida (200 OK):**
```json
{
    "status": 200,
    "user": {
        "id": 1,
        "email": "admin@ejemplo.com",
        "nombre": "Administrador",
        "telefono": "3001234567",
        "is_admin": true,
        "created_at": "2026-04-15T10:30:00Z"
    }
}
```

---

## 4. MÓDULO: CANCHAS

### 4.1 Descripción

Gestiona el CRUD de canchas deportivas, incluyendo horarios de atención y verificación de disponibilidad.

### 4.2 Endpoints

#### C01 — Listar Canchas

| Atributo | Valor |
|----------|-------|
| **Método** | `GET` |
| **Ruta** | `/api/v1/canchas` |
| **Auth** | No requerida |

**Datos de Salida (200 OK):**
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
        }
    ]
}
```

---

#### C03 — Verificar Disponibilidad

| Atributo | Valor |
|----------|-------|
| **Método** | `GET` |
| **Ruta** | `/api/v1/canchas/{cancha_id}/disponibilidad` |
| **Auth** | No requerida |

**Datos de Entrada (Query Parameters):**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| fecha | string | Sí | Formato YYYY-MM-DD |
| hora_inicio | string | Sí | Formato HH:MM |
| hora_fin | string | Sí | Formato HH:MM |

**Datos de Salida (200 OK) — Disponible:**
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

**Datos de Salida (200 OK) — No Disponible:**
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

---

#### C04 — Crear Cancha (Admin)

| Atributo | Valor |
|----------|-------|
| **Método** | `POST` |
| **Ruta** | `/api/v1/canchas` |
| **Auth** | Bearer Token (Admin) |

**Datos de Entrada:**
```json
{
    "nombre": "string",
    "tipo": "string (Fútbol 5, Fútbol 7, Futsal, etc.)",
    "precio_hora": "number (COP)",
    "capacidad": "integer"
}
```

**Datos de Salida (201 Created):**
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

---

#### C06 — Eliminar Cancha (Admin)

| Atributo | Valor |
|----------|-------|
| **Método** | `DELETE` |
| **Ruta** | `/api/v1/canchas/{cancha_id}` |
| **Auth** | Bearer Token (Admin) |

**Nota:** Eliminación lógica (`is_active = false`). No se permite si hay reservas futuras activas.

---

## 5. MÓDULO: RESERVAS

### 5.1 Descripción

Gestiona la creación, consulta, cancelación y gestión de pagos de reservas.

### 5.2 Endpoints

#### R01 — Crear Reserva (Usuario Autenticado)

| Atributo | Valor |
|----------|-------|
| **Método** | `POST` |
| **Ruta** | `/api/v1/reservas` |
| **Auth** | Bearer Token |

**Datos de Entrada:**
```json
{
    "cancha_id": "integer",
    "fecha": "string (YYYY-MM-DD)",
    "hora_inicio": "string (HH:MM)",
    "hora_fin": "string (HH:MM)",
    "jugadores": "integer",
    "observaciones": "string (opcional)"
}
```

**Datos de Salida (201 Created):**
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
        "fecha": "2026-04-20",
        "hora_inicio": "14:00",
        "hora_fin": "16:00",
        "jugadores": 8,
        "estado_pago": "Sin pagar",
        "precio_total": 30000.00
    }
}
```

---

#### R01b — Crear Reserva (Público Sin Auth)

| Atributo | Valor |
|----------|-------|
| **Método** | `POST` |
| **Ruta** | `/api/v1/reservas/public` |
| **Auth** | No requerida |

**Datos de Entrada:**
```json
{
    "cancha_id": "integer",
    "fecha": "string (YYYY-MM-DD)",
    "hora_inicio": "string (HH:MM)",
    "hora_fin": "string (HH:MM)",
    "jugadores": "integer",
    "nombre": "string",
    "email": "string",
    "telefono": "string",
    "observaciones": "string (opcional)"
}
```

> El sistema crea automáticamente un usuario con el email proporcionado.

---

#### R04 — Cancelar Reserva

| Atributo | Valor |
|----------|-------|
| **Método** | `DELETE` |
| **Ruta** | `/api/v1/reservas/{reserva_id}` |
| **Auth** | Bearer Token |

> **Nota:** Cancelación lógica (`estado_pago = Libre`). No se permite cancelar reservas ya pagadas.

---

#### R05 — Actualizar Estado de Pago (Admin)

| Atributo | Valor |
|----------|-------|
| **Método** | `PATCH` |
| **Ruta** | `/api/v1/reservas/{reserva_id}/pago` |
| **Auth** | Bearer Token (Admin) |

**Datos de Entrada:**
```json
{
    "estado_pago": "Sin pagar | Abonado | Pagado"
}
```

---

## 6. MÓDULO: REPORTES

### 6.1 Descripción

Proporciona estadísticas, gráficos y exportación de datos para análisis administrativo.

### 6.2 Endpoints

#### RP01 — Dashboard de Estadísticas

| Atributo | Valor |
|----------|-------|
| **Método** | `GET` |
| **Ruta** | `/api/v1/admin/dashboard` |
| **Auth** | Bearer Token (Admin) |

**Datos de Salida (200 OK):**
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

#### RP02 — Reporte Semanal

| Atributo | Valor |
|----------|-------|
| **Método** | `GET` |
| **Ruta** | `/api/v1/admin/reportes/reservas-semana` |
| **Auth** | Bearer Token (Admin) |

**Datos de Entrada (Query Parameters):**
| Parámetro | Tipo | Requerido |
|-----------|------|-----------|
| fecha_inicio | string (YYYY-MM-DD) | Sí |
| fecha_fin | string (YYYY-MM-DD) | Sí |

---

#### RP03 — Reporte de Ingresos

| Atributo | Valor |
|----------|-------|
| **Método** | `GET` |
| **Ruta** | `/api/v1/admin/reportes/ingresos` |
| **Auth** | Bearer Token (Admin) |

**Datos de Salida (200 OK):**
```json
{
    "status": 200,
    "periodo": {
        "fecha_desde": "2026-04-01",
        "fecha_hasta": "2026-04-30"
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

#### Exportación Excel

| Atributo | Valor |
|----------|-------|
| **Método** | `GET` |
| **Ruta** | `/api/v1/admin/reportes/export/excel` |
| **Auth** | Bearer Token (Admin) |

> Genera un archivo `.xlsx` con los 4 reportes: Estadísticas, Reservas, Ingresos y Ocupación.

---

## 7. MÓDULO: INVENTARIO

### 7.1 Descripción

Gestiona el inventario de equipos para alquiler (balones, conos, Chalecos, etc.).

### 7.2 Endpoints

#### Listar Equipos

| Atributo | Valor |
|----------|-------|
| **Método** | `GET` |
| **Ruta** | `/api/v1/admin/equipos` |
| **Auth** | Bearer Token (Admin) |

**Datos de Salida (200 OK):**
```json
{
    "status": 200,
    "equipos": [
        {
            "id": 1,
            "nombre": "Balón Fútbol 5",
            "categoria": "Balones",
            "precio_alquiler": 5000,
            "stock_total": 10,
            "is_active": true
        }
    ]
}
```

---

#### Crear Equipo

| Atributo | Valor |
|----------|-------|
| **Método** | `POST` |
| **Ruta** | `/api/v1/admin/equipos` |
| **Auth** | Bearer Token (Admin) |

**Datos de Entrada:**
```json
{
    "nombre": "string",
    "categoria": "string (Balones, Conos, Chalecos, Redes, Otros)",
    "precio_alquiler": "number (COP)",
    "stock_total": "integer"
}
```

---

## 8. CONFIGURACIÓN DE AMBIENTES

### 8.1 Variables de Entorno (Backend)

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `DATABASE_URL` | Cadena de conexión SQLite | `sqlite:///./upgi.db` |
| `SECRET_KEY` | Clave para firma JWT | (generada) |
| `ALGORITHM` | Algoritmo de firma | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del token | `1440` (24h) |
| `DEBUG` | Modo debug | `true` |

### 8.2 Ambientes

| Ambiente | Backend | Frontend |
|----------|---------|----------|
| **Desarrollo** | `http://localhost:8000` | `http://localhost:5173` |
| **Pruebas** | `http://localhost:8000` | `http://localhost:5173` |
| **Producción** | (pendiente despliegue) | (pendiente despliegue) |

---

## 9. BASE DE DATOS

### 9.1 Esquema de Tablas

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    users     │     │   reservas   │     │   canchas    │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id (PK)      │────▶│ usuario_id   │◀────│ id (PK)      │
│ auth_id (FK) │     │ cancha_id(FK)│     │ nombre       │
│ nombre       │     │ fecha        │     │ tipo         │
│ telefono     │     │ hora_inicio  │     │ precio_hora  │
│ is_admin     │     │ hora_fin     │     │ capacidad    │
│ created_at   │     │ estado_pago  │     │ is_active    │
└──────────────┘     │ precio_total│     └──────────────┘
                      │ created_at   │            │
                      └──────────────┘            │
                                                  ▼
                     ┌──────────────┐     ┌──────────────┐
                     │   equipos    │     │  horarios    │
                     ├──────────────┤     ├──────────────┤
                     │ id (PK)      │     │ id (PK)      │
                     │ nombre       │     │ cancha_id(FK)│
                     │ categoria    │     │ dia_semana   │
                     │ precio_alq.  │     │ hora_inicio  │
                     │ stock_total  │     │ hora_fin     │
                     │ is_active    │     └──────────────┘
                     └──────────────┘
```

### 9.2 Estados de Reserva

| Estado | Descripción |
|--------|-------------|
| `Sin pagar` | Reserva creada, pendiente de pago |
| `Abonado` | Pago parcial realizado |
| `Pagado` | Pago completo |
| `Libre` | Reserva cancelada (baja lógica) |

---

## 10. SEGURIDAD

### 10.1 Autenticación

- **JWT** con expiración de 24 horas
- Tokens almacenados en `sessionStorage` (frontend)
- Contraseñas hasheadas con bcrypt (cost factor 12)

### 10.2 Autorización

| Rol | Permisos |
|-----|----------|
| **Consumidor** | Crear reservas públicas, ver mis reservas |
| **Admin** | Todos los permisos, incluyendo gestión de canchas, reportes, inventario |

### 10.3 Validación

- Pydantic schemas para validación de inputs
- Validación de horarios (no permitir superposición de reservas)
- Verificación de capacidad de cancha

---

**Documento elaborado para cumplimiento GFPI-F-135**  
**Proyecto UPGI — MVP**
