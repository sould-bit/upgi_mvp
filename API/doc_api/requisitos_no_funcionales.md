> GLOSARIO

----
- **SALT**: Valor aleatorio único asignado a cada usuario antes de aplicar el hash a la contraseña.
  - Previene ataques de *rainbow table*
  - Cada usuario tiene su propio salt
  - Longitud: 32 caracteres generados con `secrets.token_hex(16)`
---
- **HASH**: Función unidireccional que transforma contraseña + salt en una cadena irreconocible.
  - Algoritmo: bcrypt con cost factor 12
  - No reversible
---
- **JWT (JSON Web Token)**: Token estándar para autenticación stateless.
  - Estructura: Header.Payload.Signature
  - Contenido: user_id, email, is_admin, exp, iat
  - Vigencia: 24 horas (86400 segundos)
---
- **Rate Limiting**: Técnica para limitar la cantidad de requests por IP/tiempo.
  - Previene ataques de fuerza bruta y DDoS
---

# SEGURIDAD

```
1. AUTENTICACIÓN
   - Contraseñas: hash bcrypt (cost factor 12) + salt único por usuario
   - Tokens JWT con expiración de 24 horas
   - Refresh tokens para renovación automática

2. AUTORIZACIÓN
   - Middleware de autenticación en todas las rutas protegidas
   - Verificación de is_admin para endpoints administrativos
   - Validación de propiedad de recursos (usuarios solo ven sus reservas)

3. PROTECCIÓN DE RUTAS
   - Rate limiting: 100 requests/minuto por IP
   - Timeout de requests: 30 segundos máximo
   - Validación estricta de inputs con Pydantic

4. COMUNICACIÓN
   - HTTPS obligatorio en producción
   - Headers de seguridad (CORS configurado)
   - No exponer datos sensibles en logs
```

## Implementación de Hash con Salt

```python
# Para cada contraseña:
1. Generar salt: secrets.token_hex(16)  # 32 caracteres
2. Concatenar: password + salt
3. Aplicar bcrypt con cost factor 12
4. Almacenar: {salt, password_hash}
```

---

# CONSISTENCIA

```
1. BASE DE DATOS
   - Constraints UNIQUE en email (usuarios)
   - Constraints UNIQUE para reservas (cancha, fecha, hora_inicio) overlap
   - Índices en campos de búsqueda frecuente
   - Transactions atómicas para operaciones de escritura

2. VALIDACIONES DE NEGOCIO
   - Todas las validaciones se ejecutan ANTES de escribir a la BD
   - Verificación de disponibilidad antes de crear reserva
   - Verificación de propiedad antes de modificar/eliminar

3. CONCURRENCIA
   - Manejo de race conditions con transacciones
   - Bloqueo de filas al verificar disponibilidad
   - Uso de unique constraints como última línea de defensa

4. INTEGRIDAD REFERENCIAL
   - Foreign keys con ON DELETE RESTRICT
   - Validación de existencia de entidades relacionadas
```

## Validación de Superposición de Reservas

```sql
-- No permitir reservas que se superpongan
SELECT COUNT(*) FROM reservas
WHERE cancha_id = ?
  AND fecha = ?
  AND estado_pago != 'Cancelada'
  AND (
    (hora_inicio < ? AND hora_fin > ?) OR  -- nueva empieza durante existente
    (hora_inicio < ? AND hora_fin > ?) OR  -- nueva termina durante existente
    (hora_inicio >= ? AND hora_fin <= ?)   -- nueva contenida en existente
  )
```

---

# MANEJO DE ERRORES

```
1. PRINCIPIOS
   - Mensajes GENÉRICOS al cliente
   - Detalles completos en logs internos
   - Nunca exponer: stack traces, queries SQL, estructura de BD

2. RESPUESTAS DE ERROR
   - Formato consistente: {status, error, details?}
   - Código de estado HTTP correcto
   - Mensaje legible para el usuario

3. EXCEPCIONES CUSTOM
   - AppException base class
   - AuthException, NotFoundException, ConflictException, ValidationException
   - Handler global de excepciones en FastAPI
```

## Ejemplos de Mensajes

| Escenario | Mensaje al Cliente | Log Interno |
|-----------|-------------------|-------------|
| Email duplicado | "El email ya está registrado" | "Duplicate email: usuario@email.com" |
| Contraseña débil | "La contraseña no cumple requisitos" | "Password validation failed: missing special char" |
| Horario ocupado | "El horario seleccionado ya está reservado" | "Conflict on Cancha 1, 2024-01-15, 14:00-16:00" |
| No autorizado | "No autorizado" | "Invalid JWT token from IP: 192.168.1.1" |
| DB error | "Error interno del servidor" | "psycopg2.OperationalError: connection refused" |

---

# RENDIMIENTO

```
1. TIEMPO DE RESPUESTA
   - Endpoints simples: < 200ms
   - Endpoints con consulta: < 500ms
   - Reportes complejos: < 2s

2. BASE DE DATOS
   - Connection pooling (min 5, max 20 conexiones)
   - Índices en: email, cancha_id, fecha, user_id
   - Queries optimizadas con EXPLAIN ANALYZE

3. CACHÉ (futuro)
   - Cache de listado de canchas (5 min TTL)
   - Cache de horarios (1 min TTL)
   - Invalidación en cambios

4. PAGINACIÓN
   - Todos los listados con paginación
   - Default: 20 items
   - Máximo: 100 items
```

---

# ESCALABILIDAD

```
1. ARQUITECTURA
   - Stateless (JWT para sesiones)
   - Preparado para containerización (Docker)
   - Configuración via variables de entorno
   - Separación por dominios (Clean Architecture)

2. CONFIGURACIÓN EXTERNA
   - DATABASE_URL: string de conexión
   - SECRET_KEY: clave para JWT
   - ALGORITHM: HS256
   - ACCESS_TOKEN_EXPIRE_MINUTES: 1440 (24h)

3. ESTRUCTURA DE PROYECTO
   - domains/ - Lógica de negocio por dominio
   - core/ - Componentes compartidos
   - db/ - Configuración de base de datos
```

---

# MONITOREO Y LOGGING

```
1. LOGGING
   - Nivel: DEBUG (desarrollo), INFO (producción)
   - Formato: JSON estructurado
   - Destinos: stdout, archivo (rotación diaria)

2. LOGS REQUERIDOS
   - Requests entrantes (method, path, IP, duration)
   - Errores (exception, stack trace, user_id si existe)
   - Autenticación (login, logout, failed attempts)

3. MÉTRICAS (futuro)
   - Request count por endpoint
   - Response time percentiles (p50, p95, p99)
   - Error rate
   - Active connections
```

---

# TESTING

```
1. UNIT TESTS
   - Services con mocks de repositorio
   - Validaciones de schemas
   - Lógica de negocio

2. INTEGRATION TESTS
   - Endpoints con base de datos en memoria
   - Flujos completos (registro → login → reserva)

3. COBERTURA MÍNIMA
   - Dominio Auth: 80%
   - Dominio Reservas: 80%
   - Dominio Canchas: 70%
```

---

# API DOCUMENTATION

```
1. SPEC
   - OpenAPI 3.0 (generada automáticamente por FastAPI)
   - Swagger UI en /docs
   - ReDoc en /redoc

2. CONVENCIONES
   - Nombres de endpoints: kebab-case
   - Verbos HTTP según semántica (GET, POST, PUT, PATCH, DELETE)
   - Respuestas con código de estado en body (status)
```

[back to README](README.md)
