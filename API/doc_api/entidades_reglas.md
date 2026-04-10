# ENTIDADES

## Dominio: Auth

| ATRIBUTO | TIPO | DESCRIPCIÓN |
|----------|------|-------------|
| id | INT (PK, AUTO) | Identificador único |
| email | VARCHAR(255) UNIQUE | Email del usuario |
| password_hash | VARCHAR(255) | Hash bcrypt de la contraseña |
| salt | VARCHAR(32) | Salt aleatorio por usuario |
| is_active | BOOLEAN | Si la cuenta está activa |
| created_at | DATETIME | Timestamp de creación |
| updated_at | DATETIME | Timestamp de modificación |

## Dominio: Users

| ATRIBUTO | TIPO | DESCRIPCIÓN |
|----------|------|-------------|
| id | INT (PK, AUTO) | Identificador único |
| auth_id | INT (FK → auth) | Referencia a autenticación |
| nombre | VARCHAR(100) | Nombre completo |
| telefono | VARCHAR(20) | Teléfono de contacto |
| is_admin | BOOLEAN | Si tiene rol de administrador |
| created_at | DATETIME | Timestamp de creación |

## Dominio: Canchas

| ATRIBUTO | TIPO | DESCRIPCIÓN |
|----------|------|-------------|
| id | INT (PK, AUTO) | Identificador único |
| nombre | VARCHAR(100) | Nombre de la cancha |
| tipo | VARCHAR(50) | Tipo (fútbol 5, futsal, etc.) |
| precio_hora | DECIMAL(10,2) | Precio por hora |
| capacidad | INT | Capacidad máxima de jugadores |
| is_active | BOOLEAN | Si está disponible |
| created_at | DATETIME | Timestamp de creación |

## Dominio: Horarios

| ATRIBUTO | TIPO | DESCRIPCIÓN |
|----------|------|-------------|
| id | INT (PK, AUTO) | Identificador único |
| cancha_id | INT (FK → canchas) | Cancha asociada |
| dia_semana | INT | Día (0=Lunes, 6=Domingo) |
| hora_inicio | TIME | Hora de apertura |
| hora_fin | TIME | Hora de cierre |

## Dominio: Reservas

| ATRIBUTO | TIPO | DESCRIPCIÓN |
|----------|------|-------------|
| id | INT (PK, AUTO) | Identificador único |
| usuario_id | INT (FK → users) | Usuario que reserva |
| cancha_id | INT (FK → canchas) | Cancha reservada |
| fecha | DATE | Fecha de la reserva |
| hora_inicio | TIME | Hora de inicio |
| hora_fin | TIME | Hora de fin |
| jugadores | INT | Cantidad de jugadores |
| estado_pago | ENUM | Libre, Abonado, Sin pagar, Pagado |
| precio_total | DECIMAL(10,2) | Precio calculado |
| observaciones | TEXT | Notas adicionales |
| created_at | DATETIME | Timestamp de creación |
| updated_at | DATETIME | Timestamp de modificación |

## Dominio: Sesiones

| ATRIBUTO | TIPO | DESCRIPCIÓN |
|----------|------|-------------|
| id | INT (PK, AUTO) | Identificador único |
| user_id | INT (FK → users) | Usuario de la sesión |
| token | VARCHAR(500) | Token JWT |
| expires_at | DATETIME | Expiración del token |
| is_active | BOOLEAN | Si la sesión está activa |
| created_at | DATETIME | Timestamp de inicio |

---

# REGLAS DE NEGOCIO

## Reglas: Auth

```
1. El email debe ser único en el sistema
2. El email debe tener formato válido
3. La contraseña debe tener mínimo 8 caracteres
4. La contraseña debe contener al menos:
   - 1 letra mayúscula
   - 1 letra minúscula
   - 1 número
   - 1 carácter especial (@$!%*?&)
5. Las contraseñas se almacenan con bcrypt (cost factor 12) + salt
6. El token JWT tiene vigencia de 24 horas
7. Un usuario no puede iniciar sesión sin estar registrado
```

## Reglas: Users

```
1. Cada usuario tiene un perfil asociado a un registro de auth
2. El nombre es obligatorio
3. El teléfono es opcional pero recomendado
4. El rol is_admin determina acceso al panel administrativo
```

## Reglas: Canchas

```
1. Las canchas tienen horarios definidos por día de la semana
2. El precio por hora es fijo por cancha
3. Las canchas pueden ser desactivadas (is_active=false)
4. No se pueden reservar canchas inactivas
```

## Reglas: Reservas

```
1. Una reserva requiere: cancha, fecha, hora_inicio, hora_fin
2. No se permiten reservas en horarios superpuestos para la misma cancha
3. La hora_fin debe ser posterior a hora_inicio
4. La duración mínima es de 1 hora
5. El precio_total = precio_hora × horas_duracion
6. Estados de pago:
   - Libre: horario disponible
   - Abonado: tiene unseña
   - Sin pagar: sin abono
   - Pagado: completamente pagado
7. Un usuario puede cancelar sus reservas
8. Solo admins pueden modificar reservas de otros usuarios
```

## Reglas: Horarios

```
1. Cada cancha tiene horarios específicos por día
2. Las reservas deben estar dentro del horario de atención
3. Las reservas no pueden exceder la hora_fin del horario
```

---

# VALIDACIONES

## Validación: Email

| Regla | Descripción |
|-------|-------------|
| Formato | Debe cumplir RFC 5322 |
| Longitud máxima | 255 caracteres |
| Unicidad | Case-insensitive |
| Dominios permitidos | Cualquier dominio válido |

## Validación: Contraseña

| Regla | Descripción |
|-------|-------------|
| Longitud mínima | 8 caracteres |
| Longitud máxima | 128 caracteres |
| Mayúsculas | Al menos 1 |
| Minúsculas | Al menos 1 |
| Números | Al menos 1 |
| Especiales | Al menos 1 (@$!%*?&) |

## Validación: Reserva

| Regla | Descripción |
|-------|-------------|
| Fecha | No puede ser anterior a hoy |
| Hora inicio | Dentro del horario de la cancha |
| Hora fin | Posterior a hora inicio |
| Capacidad | Jugadores ≤ capacidad de la cancha |
| Superposición | No puede coincidir con otra reserva activa |

[back to README](README.md)
