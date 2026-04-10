# ENTIDADES

## Entidad: Usuario

| ATRIBUTO | TIPO | DESCRIPCIÓN |
|----------|------|-------------|
| id | INT (PK, AUTO) | Identificador único del usuario |
| username | VARCHAR(50) UNIQUE | Nombre de usuario único en el sistema |
| password_hash | VARCHAR(255) | Hash de la contraseña con salt |
| salt | VARCHAR(32) | Salt aleatorio para cada usuario |
| created_at | DATETIME | Timestamp de creación del registro |
| updated_at | DATETIME | Timestamp de última modificación |

## Entidad: Sesión

| ATRIBUTO | TIPO | DESCRIPCIÓN |
|----------|------|-------------|
| id | INT (PK, AUTO) | Identificador único de la sesión |
| user_id | INT (FK) | Referencia al usuario |
| token | VARCHAR(500) | Token JWT de la sesión |
| created_at | DATETIME | Timestamp de inicio de sesión |
| expires_at | DATETIME | Timestamp de expiración del token |
| is_active | BOOLEAN | Indica si la sesión está activa |

---

# REGLAS DE NEGOCIO

## Reglas: USUARIO

```
1. No puede existir usuarios duplicados (username único)
2. El username debe tener entre 3 y 50 caracteres
3. El username solo puede contener letras, números y guiones bajos
4. La contraseña debe tener mínimo 8 caracteres
5. La contraseña debe contener al menos:
   - 1 letra mayúscula
   - 1 letra minúscula
   - 1 número
   - 1 carácter especial (@$!%*?&)
6. Las contraseñas se almacenan usando bcrypt con salt único por usuario
```

## Reglas: SESIÓN

```
1. Un usuario no puede iniciar sesión sin antes registrarse
2. Cada sesión genera un token JWT único
3. Los tokens tienen vigencia de 1 hora (3600 segundos)
4. Solo se permite una sesión activa por usuario (configurable)
5. Al cerrar sesión, el token queda invalidado
6. Sesiones expiradas son marcadas como inactivas automáticamente
```

---

# VALIDACIONES DE DATOS

## Validación: username

| Regla | Descripción |
|-------|-------------|
| Longitud mínima | 3 caracteres |
| Longitud máxima | 50 caracteres |
| Caracteres permitidos | Letras (a-z, A-Z), números (0-9), underscore (_) |
| Caso | Case-insensitive para duplicados (convertir a lowercase) |
| Unicidad | El sistema debe validar si el username ya existe antes del registro |

## Validación: password

| Regla | Descripción |
|-------|-------------|
| Longitud mínima | 8 caracteres |
| Longitud máxima | 128 caracteres |
| Requerimientos | Al menos 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial |
| Almacenamiento | Nunca almacenar en texto plano |
| Hash | bcrypt con cost factor de 12 |

[back to README](README.md)
