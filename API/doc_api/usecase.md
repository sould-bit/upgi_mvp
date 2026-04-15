# ACTORES GLOBALES

- **Sistema**
  - API (FastAPI)
  - Frontend (React + TypeScript)
  - Base de Datos (SQLite en desarrollo)
- **Cliente**
  - Consumidor (cliente que reserva canchas sin cuenta — flujo público)
  - Usuario autenticado (cliente registrado que gestiona sus reservas)
  - Administrador (gestión completa del sistema)

---

# CASOS DE USO: AUTH

## UC-A01: Registrar Usuario

**Descripción**: El usuario debe poder registrarse en la plataforma.

**Precondiciones**:
- El usuario debe encontrarse en la pantalla de login y haber seleccionado "Registrar cuenta"

### Flujo Principal (REGISTRARSE)

| Paso | Actor | Acción |
|------|-------|--------|
| A | Usuario | Ingresa email y contraseña |
| B | Sistema | Valida formato de email |
| C | Sistema | Valida requisitos de contraseña |
| D | Sistema | Verifica que el email no exista |
| E | Sistema | Genera salt y hash de contraseña |
| F | Sistema | Crea registro en auth y users |
| G | Sistema | Retorna mensaje **Registro exitoso** |

### Flujos Alternativos

| Paso | Condición | Resultado |
|------|-----------|-----------|
| B | Email inválido | Error [400 Bad Request] |
| C | Contraseña no cumple | Error [400 Bad Request] |
| D | Email ya existe | Error [409 Conflict] |

### INPUTS

```
email: string (formato válido, max 255 caracteres)
password: string (min 8 chars, mayúscula, minúscula, número, especial)
nombre: string (max 100 caracteres)
telefono: string (opcional, max 20 caracteres)
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

---

## UC-A02: Iniciar Sesión

**Descripción**: El usuario debe poder iniciar sesión con sus credenciales.

**Precondiciones**:
- El usuario debe haberse registrado previamente

### Flujo Principal (INICIAR SESIÓN)

| Paso | Actor | Acción |
|------|-------|--------|
| A | Usuario | Ingresa email y contraseña |
| B | Sistema | Busca usuario por email |
| C | Sistema | Verifica hash de contraseña |
| D | Sistema | Genera token JWT |
| E | Sistema | Crea registro de sesión |
| F | Sistema | Retorna token + datos de usuario |

### Flujos Alternativos

| Paso | Condición | Resultado |
|------|-----------|-----------|
| B | Usuario no existe | Error [404 Not Found] |
| C | Contraseña incorrecta | Error [401 Unauthorized] |

### INPUTS

```
email: string
password: string
```

### OUTPUT

**Éxito** `200 OK`
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

---

## UC-A03: Cerrar Sesión

**Descripción**: El usuario autenticado debe poder cerrar su sesión.

**Precondiciones**:
- El usuario debe tener una sesión activa

### Flujo Principal (CERRAR SESIÓN)

| Paso | Actor | Acción |
|------|-------|--------|
| A | Usuario | Solicita logout |
| B | Sistema | Valida token |
| C | Sistema | Invalida sesión |
| D | Sistema | Retorna confirmación |

### OUTPUT

**Éxito** `200 OK`
```json
{
    "status": 200,
    "message": "Sesión cerrada exitosamente"
}
```

---

# CASOS DE USO: CANCHAS

## UC-C01: Listar Canchas

**Descripción**: El usuario debe poder ver todas las canchas disponibles.

**Precondiciones**:
- El usuario debe estar autenticado

### Flujo Principal (LISTAR CANCHAS)

| Paso | Actor | Acción |
|------|-------|--------|
| A | Usuario | Solicita listado de canchas |
| B | Sistema | Consulta canchas activas |
| C | Sistema | Retorna lista con detalles |

### OUTPUT

**Éxito** `200 OK`
```json
{
    "status": 200,
    "canchas": [
        {
            "id": 1,
            "nombre": "Cancha 1",
            "tipo": "Fútbol 5",
            "precio_hora": 15000,
            "capacidad": 10
        }
    ]
}
```

---

## UC-C02: Verificar Disponibilidad de Horario

**Descripción**: El sistema debe verificar si un horario está disponible.

**Precondiciones**:
- El usuario debe especificar: cancha, fecha, hora_inicio, hora_fin

### Flujo Principal (VERIFICAR DISPONIBILIDAD)

| Paso | Actor | Acción |
|------|-------|--------|
| A | Usuario | Envía parámetros de búsqueda |
| B | Sistema | Consulta horarios de la cancha |
| C | Sistema | Busca reservas superpuestas |
| D | Sistema | Retorna disponibilidad |

### OUTPUT

**Éxito** `200 OK`
```json
{
    "status": 200,
    "disponible": true,
    "cancha": {
        "id": 1,
        "nombre": "Cancha 1"
    },
    "duracion": "2 horas",
    "precio_total": 30000
}
```

---

# CASOS DE USO: RESERVAS

## UC-R01: Crear Reserva (Autenticado)

**Descripción**: El usuario autenticado debe poder reservar una cancha.

**Precondiciones**:
- El usuario debe estar autenticado (JWT)
- La cancha debe existir y estar activa
- El horario debe estar disponible

### Flujo Principal (CREAR RESERVA)

| Paso | Actor | Acción |
|------|-------|--------|
| A | Usuario | Selecciona cancha, fecha, horario |
| B | Sistema | Valida datos |
| C | Sistema | Verifica disponibilidad |
| D | Sistema | Calcula precio total |
| E | Sistema | Crea reserva con estado "Sin pagar" |
| F | Sistema | Retorna confirmación |

### Flujos Alternativos

| Paso | Condición | Resultado |
|------|-----------|-----------|
| C | Horario ocupado | Error [409 Conflict] |
| B | Fecha pasada | Error [400 Bad Request] |
| B | Jugadores > capacidad | Error [400 Bad Request] |

### INPUTS

```
cancha_id: int
fecha: date (YYYY-MM-DD)
hora_inicio: time (HH:MM)
hora_fin: time (HH:MM)
jugadores: int
observaciones: string (opcional)
```

### OUTPUT

**Éxito** `201 Created`
```json
{
    "status": 201,
    "message": "Reserva creada exitosamente",
    "reserva": {
        "id": 1,
        "cancha": "Cancha 1",
        "fecha": "2024-01-15",
        "hora_inicio": "14:00",
        "hora_fin": "16:00",
        "jugadores": 8,
        "estado_pago": "Sin pagar",
        "precio_total": 30000
    }
}
```

---

## UC-R01b: Crear Reserva (Público — Sin Cuenta)

**Descripción**: El consumidor reserva una cancha sin necesidad de cuenta ni login. El sistema crea automáticamente un usuario por email.

**Precondiciones**:
- Ninguna (no requiere autenticación)
- La cancha debe existir y estar activa
- El horario debe estar disponible

### Flujo Principal (RESERVA PÚBLICA)

| Paso | Actor | Acción |
|------|-------|--------|
| A | Consumidor | Ingresa nombre, email, teléfono (opcional) |
| B | Consumidor | Selecciona cancha, fecha, horario |
| C | Sistema | Busca Auth por email |
| D | Sistema | Si no existe, crea Auth + User |
| E | Sistema | Verifica disponibilidad |
| F | Sistema | Calcula precio total |
| G | Sistema | Crea reserva con estado "Sin pagar" |
| H | Sistema | Retorna confirmación |

### Flujos Alternativos

| Paso | Condición | Resultado |
|------|-----------|-----------|
| D | Email ya existe | Reutiliza usuario existente, actualiza datos |
| E | Horario ocupado | Error [409 Conflict] |
| B | Fecha pasada | Error [400 Bad Request] |

### INPUTS

```
cancha_id: int
fecha: date (YYYY-MM-DD)
hora_inicio: time (HH:MM)
hora_fin: time (HH:MM)
jugadores: int
nombre: string
email: string
telefono: string (opcional)
observaciones: string (opcional)
```

### OUTPUT

**Éxito** `201 Created`
```json
{
    "status": 201,
    "message": "Reserva creada exitosamente",
    "reserva": {
        "id": 2,
        "cancha": "Cancha 1",
        "fecha": "2024-01-15",
        "hora_inicio": "14:00",
        "hora_fin": "16:00",
        "jugadores": 8,
        "estado_pago": "Sin pagar",
        "precio_total": 30000
    }
}
```

---

## UC-R02: Listar Mis Reservas

**Descripción**: El usuario debe poder ver sus reservas.

**Precondiciones**:
- El usuario debe estar autenticado

### Flujo Principal (LISTAR RESERVAS)

| Paso | Actor | Acción |
|------|-------|--------|
| A | Usuario | Solicita sus reservas |
| B | Sistema | Filtra por user_id |
| C | Sistema | Retorna lista ordenada por fecha |

### INPUTS (Opcionales)

```
fecha_desde: date (filtro)
fecha_hasta: date (filtro)
estado_pago: string (filtro)
```

### OUTPUT

**Éxito** `200 OK`
```json
{
    "status": 200,
    "reservas": [
        {
            "id": 1,
            "cancha": "Cancha 1",
            "fecha": "2024-01-15",
            "hora_inicio": "14:00",
            "hora_fin": "16:00",
            "estado_pago": "Sin pagar",
            "precio_total": 30000
        }
    ],
    "total": 1
}
```

---

## UC-R03: Ver Detalle de Reserva

**Descripción**: El usuario debe poder ver el detalle de una reserva específica.

**Precondiciones**:
- El usuario debe estar autenticado
- La reserva debe pertenecer al usuario (o ser admin)

### OUTPUT

**Éxito** `200 OK`
```json
{
    "status": 200,
    "reserva": {
        "id": 1,
        "usuario": {
            "id": 1,
            "nombre": "Juan Pérez",
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
        "precio_total": 30000,
        "observaciones": "",
        "created_at": "2024-01-10T10:30:00Z"
    }
}
```

---

## UC-R04: Cancelar Reserva

**Descripción**: El usuario o admin puede cancelar una reserva. La cancelación es una baja lógica (no se borran registros).

**Precondiciones**:
- El usuario debe estar autenticado
- La reserva debe pertenecer al usuario (o ser admin)

### Flujo Principal (CANCELAR RESERVA)

| Paso | Actor | Acción |
|------|-------|--------|
| A | Usuario | Solicita cancelación |
| B | Sistema | Valida propiedad de reserva |
| C | Sistema | Verifica que no esté pagada |
| D | Sistema | Marca `estado_pago = Libre` (baja lógica) |
| E | Sistema | Agrega nota de auditoría en observaciones |
| F | Sistema | Retorna confirmación |

### Flujos Alternativos

| Paso | Condición | Resultado |
|------|-----------|-----------|
| C | Reserva ya pagada | Error [400 Bad Request] |

### OUTPUT

**Éxito** `200 OK`
```json
{
    "status": 200,
    "message": "Reserva cancelada exitosamente"
}
```

> Las reservas canceladas (`Libre`) se excluyen automáticamente de listados operativos y reportes de ingresos.

---

## UC-R05: Actualizar Estado de Pago

**Descripción**: El admin debe poder actualizar el estado de pago de una reserva.

**Precondiciones**:
- El usuario debe ser administrador

### INPUTS

```
reserva_id: int
estado_pago: "Libre" | "Abonado" | "Sin pagar" | "Pagado"
```

### OUTPUT

**Éxito** `200 OK`
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

---

# CASOS DE USO: ADMIN

## UC-AD01: Dashboard - Estadísticas

**Descripción**: El admin debe poder ver estadísticas generales.

**Precondiciones**:
- El usuario debe ser administrador

### OUTPUT

**Éxito** `200 OK`
```json
{
    "status": 200,
    "stats": {
        "reservas_hoy": 5,
        "reservas_semana": 23,
        "reservas_mes": 87,
        "ingresos_hoy": 75000,
        "ingresos_semana": 345000,
        "ingresos_mes": 1305000,
        "canchas_activas": 4
    }
}
```

---

## UC-AD02: Reporte de Reservas por Semana

**Descripción**: El admin debe poder ver un reporte semanal de reservas.

**Precondiciones**:
- El usuario debe ser administrador

### INPUTS

```
fecha_inicio: date
fecha_fin: date
```

### OUTPUT

**Éxito** `200 OK`
```json
{
    "status": 200,
    "reporte": [
        {"label": "Lunes", "total": 5},
        {"label": "Martes", "total": 3},
        {"label": "Miércoles", "total": 7},
        {"label": "Jueves", "total": 4},
        {"label": "Viernes", "total": 8},
        {"label": "Sábado", "total": 12},
        {"label": "Domingo", "total": 10}
    ]
}
```

---

## UC-AD03: Gestionar Canchas

**Descripción**: El admin debe poder crear, editar y desactivar canchas.

### Sub-casos

#### UC-AD03a: Crear Cancha
#### UC-AD03b: Editar Cancha
#### UC-AD03c: Desactivar Cancha (Baja Lógica)

**Descripción**: El admin puede desactivar una cancha (baja lógica). No se borran datos físicos.

**Precondiciones**:
- El usuario debe ser administrador

### Flujo Principal (DESACTIVAR CANCHA)

| Paso | Actor | Acción |
|------|-------|--------|
| A | Admin | Solicita eliminar cancha |
| B | Sistema | Verifica que no tenga reservas futuras activas |
| C | Sistema | Marca `is_active = false` |
| D | Sistema | Retorna confirmación |

### Flujos Alternativos

| Paso | Condición | Resultado |
|------|-----------|-----------|
| B | Tiene reservas futuras | Error [409 Conflict] |

### OUTPUT

**Éxito** `200 OK`
```json
{
    "status": 200,
    "message": "Cancha desactivada exitosamente",
    "cancha": {"id": 1, "nombre": "Cancha 1"}
}
```

### INPUTS (Crear/Editar)

```
nombre: string (max 100)
tipo: string (max 50)
precio_hora: decimal
capacidad: int
```

### OUTPUT

**Éxito** `201 Created / 200 OK`
```json
{
    "status": 201,
    "message": "Cancha creada exitosamente",
    "cancha": {
        "id": 1,
        "nombre": "Cancha 1",
        "tipo": "Fútbol 5",
        "precio_hora": 15000,
        "capacidad": 10
    }
}
```

---

## UC-AD04: Ver Todas las Reservas

**Descripción**: El admin debe poder ver y gestionar todas las reservas.

### INPUTS (Filtros)

```
fecha: date (opcional)
cancha_id: int (opcional)
estado_pago: string (opcional)
```

### OUTPUT

**Éxito** `200 OK`
```json
{
    "status": 200,
    "reservas": [
        {
            "id": 1,
            "usuario": "Juan Pérez",
            "cancha": "Cancha 1",
            "fecha": "2024-01-15",
            "hora_inicio": "14:00",
            "hora_fin": "16:00",
            "estado_pago": "Pagado",
            "precio_total": 30000
        }
    ],
    "total": 1
}
---

## UC-AD05: Admin Crea Reserva para Cliente

**Descripción**: El admin puede crear una reserva especificando los datos del cliente, sin que el cliente necesite cuenta.

**Precondiciones**:
- El usuario debe ser administrador
- La cancha debe existir y estar activa

### Flujo Principal (ADMIN CREA RESERVA)

| Paso | Actor | Acción |
|------|-------|--------|
| A | Admin | Ingresa nombre, email, teléfono del cliente |
| B | Admin | Selecciona cancha, fecha, horario |
| C | Sistema | Busca o crea usuario por email (mismo flujo que reserva pública) |
| D | Sistema | Verifica disponibilidad |
| E | Sistema | Crea reserva con estado "Sin pagar" |
| F | Sistema | Retorna confirmación |

### OUTPUT

**Éxito** `201 Created`

> Usa el mismo contrato que [UC-R01b: Crear Reserva (Público)](#uc-r01b-crear-reserva-público--sin-cuenta) (endpoint `POST /reservas/public`).

[back to README](README.md)
