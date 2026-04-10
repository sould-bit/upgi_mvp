> GLOSARIO

----
- **SALT**: Valor aleatorio único que se asigna a cada usuario antes de aplicar el hash a la contraseña.
  - Previene ataques de *rainbow table*, obligando al atacante a recalcular tablas para cada salt.
  - Al tener un salt por usuario, evitamos que dos usuarios con la misma contraseña tengan el mismo hash.
  - Longitud recomendada: 32 caracteres aleatorios.
---
- **HASH**: Función unidireccional que transforma la contraseña + salt en una cadena irreconocible.
  - Algoritmo recomendado: bcrypt con cost factor 12.
  - No reversible: no se puede obtener la contraseña original desde el hash.
---
- **JWT (JSON Web Token)**: Token estándar para autenticación stateless.
  - Estructura: Header.Payload.Signature
  - Contiene: user_id, exp (expiración), iat (emisión)
---

# Seguridad

```
1. Las contraseñas deben ser manejadas con HASH + SALT usando bcrypt
2. El salt debe ser único por usuario y generado aleatoriamente
3. Los tokens JWT deben incluir expiración (máximo 1 hora)
4. Tokens expirados deben ser rechazados inmediatamente
5. Las contraseñas nunca deben ser almacenadas ni logueadas en texto plano
6. Usar HTTPS en producción para todas las comunicaciones
7. Implementar rate limiting para prevenir ataques de fuerza bruta
8. Validar y sanitizar todos los inputs del usuario
```

## Implementación de Hash con Salt

```
Para cada contraseña:
1. Generar salt aleatorio de 32 caracteres
2. Concatenar: hash_input = password + salt
3. Aplicar bcrypt con cost factor 12
4. Almacenar: {salt, password_hash}
```

---

# Consistencia

```
1. El username debe ser único en la base de datos (constraint UNIQUE)
2. Todas las operaciones de escritura deben ser transacciones atómicas
   - Si falla el registro, no se guarda nada parcial
3. Validaciones de negocio se ejecutan ANTES de escribir a la base de datos
4. Usar índices en campos de búsqueda frecuente (username)
5. Implementar control de concurrencia para evitar race conditions
```

## Transacciones Atómicas

```
Inicio de sesión:
1. BEGIN TRANSACTION
2. Validar que el usuario existe
3. Comparar hash de contraseña
4. Crear registro de sesión
5. COMMIT (si todo exitoso) o ROLLBACK (si falla)
```

---

# Manejo de Errores

```
1. Mensajes de error GENÉRICOS que no revelen datos sensibles ni detalles internos
2. NO exponer:
   - Stack traces
   - Estructura de la base de datos
   - Configuraciones internas
   - Queries SQL
3. Logs internos deben contenir detalles (para desarrolladores)
   pero las respuestas al cliente son sanitizadas
4. Implementar logging estructurado para auditoría
5. Manejar excepciones no controladas con respuesta genérica (500)
```

## Ejemplos de Mensajes

| Escenario | Mensaje al Cliente | Log Interno |
|-----------|-------------------|-------------|
| Usuario duplicado | "El usuario ya existe" | "Intentando registrar username existente" |
| Contraseña débil | "La contraseña no cumple requisitos" | "Password validation failed: missing special char" |
| DB connection error | "Error interno del servidor" | "psycopg2.OperationalError: connection refused" |

---

# Rendimiento

```
1. Tiempo de respuesta máximo: 500ms para endpoints simples
2. Conexiones a base de datos con pool de conexiones
3. Índices apropiados en campos de búsqueda
4. Cache de consultas frecuentes (opcional)
5. Lazy loading para relaciones no necesarias
```

---

# Escalabilidad

```
1. Arquitectura stateless (JWT para sesiones)
2. Preparado para containerización (Docker)
3. Configuración via variables de entorno
4. Separación de capas (routers, services, models)
```

[back to README](README.md)
