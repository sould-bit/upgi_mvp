# API - UPGI MVP

## Descripción General

API REST desarrollada con FastAPI para el proyecto UPGI MVP. Proporciona servicios de autenticación y gestión de sesiones para los usuarios de la aplicación.

## Stack Tecnológico

- **Framework**: FastAPI (Python 3.11+)
- **Base de datos**: SQLite (desarrollo) / PostgreSQL (producción)
- **ORM**: SQLAlchemy
- **Autenticación**: JWT con bcrypt para hashing de contraseñas
- **Validación**: Pydantic

## Estructura del Proyecto

```
API/
├── app/
│   ├── main.py           # Punto de entrada de la aplicación
│   ├── config.py         # Configuración del entorno
│   ├── database.py       # Conexión a base de datos
│   ├── models/           # Modelos SQLAlchemy
│   ├── schemas/          # Schemas Pydantic
│   ├── routers/          # Endpoints de la API
│   ├── services/         # Lógica de negocio
│   └── utils/            # Utilidades (auth, helpers)
├── tests/                # Pruebas unitarias
├── doc_api/              # Documentación de la API
└── requirements.txt      # Dependencias Python
```

## Módulos

### Módulo Session
Gestión de autenticación y sesiones de usuarios.

- Registro de usuarios
- Inicio de sesión
- Gestión de tokens JWT

## Navegación

- [Parafraseo](parafraseo.md) - Definición del objetivo del sistema
- [Casos de Uso](usecase.md) - Especificación de funcionalidades
- [Entidades y Reglas](entidades_reglas.md) - Modelo de datos y validaciones
- [Contratos API](Contratos_API.md) - Especificación de endpoints
- [Requisitos No Funcionales](requisitos_no_funcionales.md) - Atributos de calidad
