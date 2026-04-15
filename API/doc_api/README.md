# UPGI API - Documentación Técnica

## Descripción

API REST para el sistema de gestión de reservas de canchas deportivas UPGI. Proporciona servicios de autenticación, gestión de usuarios, reservas, canchas y reportes.

## Stack Tecnológico

- **Framework**: FastAPI (Python 3.11+)
- **Base de datos**: PostgreSQL
- **ORM**: SQLAlchemy 2.0
- **Autenticación**: JWT (python-jose) + bcrypt
- **Validación**: Pydantic v2
- **Migraciones**: Alembic

## Arquitectura por Dominios

```
API/
├── app/
│   ├── main.py                    # Punto de entrada
│   ├── config.py                 # Configuración
│   ├── database.py               # Conexión BD
│   ├── dependencies.py           # Inyección de dependencias
│   │
│   ├── domains/                   # DOMINIOS
│   │   ├── auth/                 # Autenticación
│   │   │   ├── router.py
│   │   │   ├── schemas.py
│   │   │   ├── service.py
│   │   │   └── utils.py
│   │   │
│   │   ├── users/                # Gestión de usuarios
│   │   │   ├── router.py
│   │   │   ├── schemas.py
│   │   │   └── service.py
│   │   │
│   │   ├── reservas/              # Gestión de reservas
│   │   │   ├── router.py
│   │   │   ├── schemas.py
│   │   │   ├── service.py
│   │   │   └── models.py
│   │   │
│   │   ├── canchas/               # Gestión de canchas
│   │   │   ├── router.py
│   │   │   ├── schemas.py
│   │   │   └── service.py
│   │   │
│   │   └── reportes/              # Reportes y estadísticas
│   │       ├── router.py
│   │       ├── schemas.py
│   │       └── service.py
│   │
│   ├── core/                      # Núcleo compartido
│   │   ├── models.py             # Modelos base
│   │   ├── exceptions.py          # Excepciones custom
│   │   └── security.py            # Utilidades de seguridad
│   │
│   └── db/                        # Base de datos
│       ├── base.py
│       └── session.py
│
├── tests/
├── doc_api/                       # Esta documentación
└── requirements.txt
```

## Dominios

### 1. Auth (Autenticación)
- Registro de usuarios
- Inicio/cierre de sesión
- Verificación de tokens

### 2. Users (Usuarios)
- Perfil de usuario
- Actualización de datos

### 3. Reservas
- Crear reserva (autenticado — usuario con cuenta)
- Crear reserva pública (sin auth — consumidor reserva directo)
- Consultar reservas
- Cancelar reserva (baja lógica — no borra registros)
- Estados de pago (Libre, Abonado, Sin pagar, Pagado)

### 4. Canchas
- Listado de canchas
- Horarios disponibles
- Gestión de espacios
- Eliminar cancha (baja lógica — Admin)

### 5. Reportes
- Reservas por semana
- Estadísticas generales

## Navegación

- [Parafraseo](parafraseo.md) - Definición del objetivo
- [Casos de Uso](usecase.md) - Especificación de funcionalidades
- [Entidades y Reglas](entidades_reglas.md) - Modelo de datos
- [Contratos API](Contratos_API.md) - Endpoints y contratos
- [Requisitos No Funcionales](requisitos_no_funcionales.md) - Calidad
