# VIDEO DEMOSTRATIVO
[![Video en Vimeo](https://i.vimeocdn.com/video/default.jpg)](https://vimeo.com/1183625952?share=copy&fl=sv&fe=ci)

# UPGI — Sistema de Gestión de Reservas Deportivas

> **Evidencia académica** del proyecto UPGI. Sistema web para la gestión integral de reservas de canchas deportivas, administración de pistas, inventario de equipos y reportes analíticos.

---

## Tabla de Contenidos

1. [Descripción del Sistema](#1-descripción-del-sistema)
2. [Requerimientos del Sistema](#2-requerimientos-del-sistema)
3. [Casos de Uso](#3-casos-de-uso)
4. [Arquitectura del Software](#4-arquitectura-del-software)
5. [Diagrama de Clases](#5-diagrama-de-clases)
6. [Diagrama de Paquetes](#6-diagrama-de-paquetes)
7. [Diagrama de Componentes](#7-diagrama-de-componentes)
8. [Mecanismos de Seguridad](#8-mecanismos-de-seguridad)
9. [Capas de la Aplicación](#9-capas-de-la-aplicación)
10. [Metodología de Desarrollo](#10-metodología-de-desarrollo)
11. [Mapa de Navegación](#11-mapa-de-navegación)
12. [Stack Tecnológico por Capa](#12-stack-tecnológico-por-capa)
13. [Patrones de Diseño](#13-patrones-de-diseño)
14. [Configuración de Ambientes](#14-configuración-de-ambientes)
15. [Control de Versiones](#15-control-de-versiones)
16. [Guía de Instalación y Ejecución](#16-guía-de-instalación-y-ejecución)
17. [Componentes Construidos](#17-componentes-construidos)

---

## 1. Descripción del Sistema

**UPGI** es una aplicación web que permite a un complejo deportivo gestionar sus canchas, reservas de clientes y operaciones administrativas. El sistema separa dos flujos:

- **Flujo consumidor**: cualquier persona puede reservar una cancha sin necesidad de cuenta.
- **Flujo administrador**: el personal del complejo gestiona canchas, reservas, inventario y reportes desde un panel privado.

---

## 2. Requerimientos del Sistema

### Requerimientos Funcionales

| ID    | Requerimiento                                                                                     | Prioridad |
| ----- | ------------------------------------------------------------------------------------------------- | --------- |
| RF-01 | El consumidor puede reservar una cancha seleccionando fecha, hora y cantidad de jugadores         | Alta      |
| RF-02 | El administrador puede crear, editar y eliminar canchas                                           | Alta      |
| RF-03 | El administrador puede gestionar el estado de pago de cada reserva (Sin pagar / Abonado / Pagado) | Alta      |
| RF-04 | El administrador puede cancelar reservas (baja lógica)                                            | Alta      |
| RF-05 | El administrador puede visualizar la ocupación por hora y cancha en una grilla interactiva        | Alta      |
| RF-06 | El administrador puede filtrar la grilla por fecha seleccionada                                   | Alta      |
| RF-07 | El administrador puede crear reservas directamente para clientes                                  | Media     |
| RF-08 | El administrador puede gestionar un inventario de equipos para alquiler (CRUD)                    | Media     |
| RF-09 | El administrador puede visualizar reportes analíticos con gráficos interactivos                   | Media     |
| RF-10 | El administrador puede exportar reportes a formato Excel (.xlsx)                                  | Media     |
| RF-11 | El sistema envía notificaciones de disponibilidad cuando se libera un horario                     | Baja      |
| RF-12 | El administrador puede gestionar horarios de atención por cancha y día                            | Baja      |

### Requerimientos No Funcionales

| ID     | Requerimiento            | Descripción                                                               |
| ------ | ------------------------ | ------------------------------------------------------------------------- |
| RNF-01 | Tiempo de respuesta < 2s | Para todas las operaciones principales                                    |
| RNF-02 | Disponibilidad           | El sistema debe funcionar en navegadores modernos (Chrome, Firefox, Edge) |
| RNF-03 | Escalabilidad            | La arquitectura permite agregar módulos sin modificar los existentes      |
| RNF-04 | Seguridad                | JWT para autenticación, contraseñas hasheadas, validación de inputs       |
| RNF-05 | Trazabilidad             | Las reservas canceladas se marcan lógicamente para mantener historial     |

---

## 3. Casos de Uso

### Actores

- **Consumidor**: persona sin cuenta que reserva una cancha.
- **Administrador**: personal del complejo con acceso al panel de gestión.

### Diagramas de Casos de Uso

```
+---------------------------+     +------------------------+
|      CONSUMIDOR          |     |    ADMINISTRADOR       |
+---------------------------+     +------------------------+
| + Reservar cancha         |     | + Crear cancha         |
| + Consultar disponibilidad|    | + Editar cancha        |
| + Ingresar datos cliente  |     | + Eliminar cancha       |
| + Confirmar reserva       |     | + Ver grilla de ocupación|
| + Cancelar mi reserva     |     | + Filtrar por fecha     |
+---------------------------+     | + Gestionar pago       |
                                  | + Cancelar reserva      |
                                  | + Quick-reserve        |
                                  | + Gestionar inventario  |
                                  | + Ver reportes         |
                                  | + Exportar a Excel    |
                                  | + Ver estadísticas     |
                                  +------------------------+
```

### Historias de Usuario

| #     | Historia de Usuario                                                                     | Criterio de Aceptación                                    |
| ----- | --------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| HU-01 | Como consumidor, quiero reservar una cancha sin registrarme para simplificar el proceso | Puedo reservar en 3 pasos sin cuenta                      |
| HU-02 | Como admin, quiero ver la ocupación día a día para planificar la operación              | La grilla muestra todas las reservas del día seleccionado |
| HU-03 | Como admin, quiero cambiar el estado de pago inline para no perder tiempo               | El selector de pago actualiza la DB inmediatamente        |
| HU-04 | Como admin, quiero exportar reportes a Excel para presentar a contabilidad              | El botón descarga un .xlsx con los 4 reportes             |
| HU-05 | Como admin, quiero gestionar equipos de alquiler para ofrecer un servicio adicional     | CRUD completo de equipos con stock visible                |

---

## 4. Arquitectura del Software

### Visión General

El sistema sigue una **arquitectura por capas** con separación clara entre frontend y backend:

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (React)                  │
│  Pages → Components → Hooks → API Client (Axios)    │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP/REST
┌─────────────────────▼───────────────────────────────┐
│                   BACKEND (FastAPI)                 │
│  Routers → Services → Repositories → Database      │
└─────────────────────┬───────────────────────────────┘
                      │ SQLAlchemy ORM
┌─────────────────────▼───────────────────────────────┐
│              BASE DE DATOS (SQLite)                  │
│  Tablas: users, reservas, canchas, horarios, equipos  │
└─────────────────────────────────────────────────────┘
```

### Tecnologías Principales

| Capa          | Tecnología      | Lenguaje   | Propósito                    |
| ------------- | --------------- | ---------- | ---------------------------- |
| Frontend      | React 18 + Vite | TypeScript | Interfaz de usuario          |
| Backend       | FastAPI         | Python     | API REST                     |
| ORM           | SQLAlchemy      | Python     | Abstracción de base de datos |
| Base de datos | SQLite          | SQL        | Persistencia                 |
| Gráficos      | Recharts        | TypeScript | Visualización de reportes    |
| HTTP Client   | Axios           | TypeScript | Comunicación con API         |
| Pydantic      | Pydantic v2     | Python     | Validación de datos          |
| JWT           | python-jose     | Python     | Autenticación                |

---

## 5. Diagrama de Clases

### Backend (dominios principales)

```
┌──────────────────────┐
│        User          │
├──────────────────────┤
│ - id: int (PK)      │
│ - auth_id: int (FK) │
│ - nombre: str       │
│ - telefono: str?    │
│ - is_admin: bool    │
│ - created_at: datetime│
└──────────┬───────────┘
           │ 1:N
           ▼
┌──────────────────────┐       ┌──────────────────────┐
│       Reserva         │       │       Cancha         │
├──────────────────────┤       ├──────────────────────┤
│ - id: int (PK)      │ N:1  │ - id: int (PK)      │
│ - usuario_id: int   │──────▶│ - nombre: str        │
│ - cancha_id: int(FK)│       │ - tipo: str          │
│ - fecha: date       │       │ - precio_hora: float│
│ - hora_inicio: time  │       │ - capacidad: int    │
│ - hora_fin: time    │       │ - is_active: bool    │
│ - estado_pago: enum  │       │ - created_at: datetime│
│ - precio_total: dec  │       └──────────┬───────────┘
│ - created_at: datetime│                  │ 1:N
└──────────┬───────────┘                  ▼
           │                       ┌──────────────────────┐
           │ 1:N                  │      Horario           │
           ▼                      ├──────────────────────┤
┌──────────────────────┐         │ - id: int (PK)       │
│    AlquilerEquipo    │         │ - cancha_id: int (FK) │
├──────────────────────┤         │ - dia_semana: int     │
│ - id: int (PK)      │         │ - hora_inicio: time   │
│ - reserva_id: int(FK)│         │ - hora_fin: time      │
│ - equipo_id: int (FK)│         └──────────────────────┘
│ - cantidad: int      │
│ - precio_alquiler   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│       Equipo         │
├──────────────────────┤
│ - id: int (PK)      │
│ - nombre: str       │
│ - categoria: str    │
│ - precio_alquiler   │
│ - stock_total: int  │
│ - is_active: bool   │
│ - created_at: datetime│
└──────────────────────┘
```

### Frontend (tipos principales)

```typescript
// Reserva con datos relacionados
interface AdminReservation {
  id: number;
  usuario: { nombre: string; email: string };
  cancha: { nombre: string };
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado_pago: PaymentStatus;
  precio_total: number;
}

// Fila de la grilla de horarios
interface ScheduleRow {
  time: string;
  slots: ScheduleSlot[];
}

interface ScheduleSlot {
  reservationId?: number;
  court: string;
  player?: string;
  status: PaymentStatus;
  isRangeStart?: boolean;
  timeRangeLabel?: string;
  time: string;
}

// Equipo de alquiler
interface Equipo {
  id: number;
  nombre: string;
  categoria: EquipoCategoria;
  precio_alquiler: number;
  stock_total: number;
  is_active: boolean;
}
```

---

## 6. Diagrama de Paquetes

### Backend — `API/app/`

```
API/app/
├── main.py                    # Punto de entrada, configuración de la app
├── config.py                  # Configuración de ambiente (DATABASE_URL, SECRET_KEY, DEBUG)
├── database.py                # Motor SQLAlchemy, SessionLocal, get_db()
├── db/
│   └── base.py                # Base declarative para todos los modelos
├── core/
│   ├── security.py            # Hash de contraseñas, creación de tokens JWT
│   └── auth.py               # Lógica de autenticación
└── domains/
    ├── auth/                 # Autenticación y usuarios
    │   ├── models.py         # Auth (tabla de emails)
    │   ├── schemas.py        # LoginRequest, LoginResponse, RegisterRequest
    │   ├── service.py       # Lógica de auth
    │   └── utils.py         # Dependencias FastAPI (get_current_user, get_current_admin)
    ├── users/               # Perfiles de usuario
    │   ├── models.py         # User
    │   ├── schemas.py       # UserResponse
    │   ├── service.py       # Lógica de usuarios
    │   └── router.py        # Endpoints /users
    ├── canchas/             # Gestión de canchas
    │   ├── models.py         # Cancha, Horario
    │   ├── schemas.py        # CanchaCreate, CanchaResponse
    │   ├── service.py        # Lógica CRUD + horarios
    │   └── router.py        # Endpoints /canchas, /canchas/{id}/disponibilidad
    ├── reservas/            # Reservas de pistas
    │   ├── models.py         # Reserva, EstadoPago (enum)
    │   ├── schemas.py        # ReservaCreate, ReservaResponse, PagoUpdate
    │   ├── service.py        # crear, crear_publico, cancelar, actualizar_pago
    │   └── router.py        # Endpoints /reservas, /reservas/public
    ├── reportes/            # Reportes y estadísticas
    │   ├── models.py         # (usa modelos de otros domains)
    │   ├── schemas.py        # DashboardResponse, ReporteSemanaResponse, etc.
    │   ├── service.py        # get_stats, get_reservas_semana, get_ingresos,
    │   │                    #   get_ocupacion, get_horarios_pico,
    │   │                    #   get_clientes_frecuentes, get_daily
    │   └── router.py        # Endpoints /admin/dashboard, /admin/reportes/*
    └── inventario/         # Inventario de equipos (módulo nuevo)
        ├── models.py         # Equipo, AlquilerEquipo
        ├── schemas.py        # EquipoCreate, EquipoResponse, InventarioSummaryResponse
        ├── service.py        # CRUD + soft-delete + get_summary
        └── router.py        # Endpoints /admin/equipos, /admin/inventario
```

### Frontend — `src/`

```
src/
├── main.tsx                  # Entry point, Router setup
├── App.tsx                   # Componente raíz, layout principal
├── lib/
│   ├── api.ts               # Cliente HTTP (apiRequest), funciones por endpoint
│   ├── session.ts           # getStoredSession, clearSession, token management
│   └── types.ts             # TODOS los tipos TypeScript compartidos
├── pages/
│   ├── HomePage.tsx         # Landing page pública
│   ├── ReservasPage.tsx    # Flujo de reserva para consumidores
│   ├── LoginPage.tsx        # Login de admin
│   ├── AdminDashboardPage.tsx # Panel admin con switch por sección
│   └── RegisterPage.tsx      # Registro de admin
├── components/
│   ├── layout/              # MainLayout, Navbar, Footer
│   ├── home/                # HeroSection, FeatureCard, etc.
│   ├── reservas/           # ReservaFormSection, etc.
│   ├── auth/                # LoginForm, RegisterForm, LoginHeaderSection
│   └── admin/
│       ├── AdminSidebar.tsx            # Navegación lateral
│       ├── AdminTopbar.tsx             # Barra superior
│       ├── StatsSection.tsx            # Cards de métricas
│       ├── HorariosCanchasSection.tsx  # Grilla de ocupación
│       ├── HorariosTable.tsx           # Tabla de horarios con cards
│       ├── ReservaCell.tsx             # Celda individual de reserva
│       ├── ReservationModal.tsx         # Modal de detalle de reserva
│       ├── PaymentStatusBadge.tsx      # Badge de estado de pago
│       ├── StatusLegend.tsx            # Leyenda de estados
│       ├── InventarioSection.tsx       # Gestión de inventario
│       ├── InventarioStats.tsx         # Stats de inventario
│       ├── EquipoForm.tsx              # Formulario CRUD de equipos
│       ├── reportes/                   # Módulo de reportes avanzados
│       │   ├── ReportesAvanzadosSection.tsx
│       │   ├── ReporteFiltros.tsx
│       │   ├── IngresosChart.tsx        # Recharts LineChart
│       │   ├── OcupacionChart.tsx       # Recharts BarChart
│       │   ├── HorariosPicoTable.tsx
│       │   ├── ClientesFrecuentesTable.tsx
│       │   └── ExportarExcelButton.tsx
│       └── canchas/                    # Gestión de canchas en admin
│           └── ...
└── styles.css               # Estilos globales (Bootstrap 5 + custom)
```

---

## 7. Diagrama de Componentes

### Arquitectura de Componentes Frontend

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    App.tsx                          │   │
│  │  ┌──────────────────┐  ┌─────────────────────────┐  │   │
│  │  │  Router (React)  │──▶│   Protected Routes    │  │   │
│  │  │  /login          │  │   (verifica JWT)      │  │   │
│  │  │  /reservas       │  └─────────────────────────┘  │   │
│  │  │  /admin/*        │                               │   │
│  │  └──────────────────┘                               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
          │
          │ useNavigate / Link
          ▼
┌─────────────────────────────────────────────────────────────┐
│              AdminDashboardPage (section routing)          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │dashboard │  │reservas  │  │reportes  │  │inventario│ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
│        │              │              │              │       │
│  ┌─────┴──────────────┴──────────────┴──────────────┴──┐   │
│  │              AdminSidebar (navegación)              │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
          │
          │ Props drilling / useState
          ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ StatsSection      │    │ HorariosCanchas   │    │ ReportesAvanzados│
│ ┌──────────────┐  │    │ ┌────────────┐  │    │ ┌──────────────┐ │
│ │  StatCard    │  │    │ │ Horarios   │  │    │ │IngresosChart│ │
│ │  StatCard    │  │    │ │Table       │  │    │ │(Recharts)   │ │
│ │  StatCard    │  │    │ │ ┌────────┐ │  │    │ │              │ │
│ │  StatCard    │  │    │ │ │Reserva │ │  │    │ │OcupacionChart│ │
│ └──────────────┘  │    │ │ │Cell    │ │  │    │ │(Recharts)   │ │
│                    │    │ │ └────────┘ │  │    │ │              │ │
│                    │    │ └────────────┘  │    │ │HorariosPico  │ │
│                    │    │                 │    │ │ClientesFrec. │ │
│                    │    │                 │    │ └──────────────┘ │
└────────────────────┘    └─────────────────┘    └────────────────┘
```

### Backend — Flujo de una Request

```
Cliente (navegador)
       │ HTTP POST /api/v1/reservas/public
       ▼
Router (FastAPI endpoint)
       │ valida cuerpo (Pydantic)
       ▼
Service (lógica de negocio)
       │ verifica disponibilidad, calcula precio
       ▼
Models (SQLAlchemy)
       │ inserta en DB
       ▼
Database (SQLite)
       │ commit
       ▼
Respuesta JSON al cliente
```

---

## 8. Mecanismos de Seguridad

### Backend

| Mecanismo                | Implementación                              | Propósito                               |
| ------------------------ | ------------------------------------------- | --------------------------------------- |
| **JWT Tokens**           | `python-jose` + `Auth.set_access_token()`   | Autenticación sin estado                |
| **Password Hashing**     | `passlib.context` con bcrypt                | No almacenar contraseñas en texto plano |
| **Dependencias FastAPI** | `get_current_user`, `get_current_admin`     | Autorización por rol                    |
| **Validación Pydantic**  | Schemas con tipos y validadores             | Sanitización de inputs en la API        |
| **CORS**                 | Configurado en FastAPI                      | Prevención de requests cruzados         |
| **Soft Delete**          | `is_active = false` en vez de DELETE físico | Preserva trazabilidad                   |

### Frontend

| Mecanismo              | Implementación                                    | Propósito                        |
| ---------------------- | ------------------------------------------------- | -------------------------------- |
| **JWT Storage**        | `sessionStorage` (no localStorage)                | Token no persiste entre sesiones |
| **Route Guards**       | Verificación de `is_admin` antes de mostrar panel | Restricción de acceso            |
| **Protected Routes**   | Componente que redirige si no hay sesión          | Redirección automática           |
| **Axios Interceptors** | Token inyectado en cada request                   | Autorización transparente        |

---

## 9. Capas de la Aplicación

### Capa de Presentación (Frontend)

> Responsable de la interfaz de usuario y la interacción con el usuario.

- **Componentes**: React con TypeScript, arquitectura átomica
- **Estado**: `useState`, `useEffect`, `useMemo` (sin estado global por ahora)
- **Comunicación**: API client que llama al backend

### Capa de Negocio (Services — Backend)

> Responsable de la lógica de aplicación, validaciones y reglas de negocio.

- **FastAPI Services**: clases que encapsulan la lógica (`ReservaService`, `ReporteService`, etc.)
- **Validaciones**: Pydantic schemas + validaciones de servicio
- **Precios**: cálculo dinámico de `precio_total = precio_hora × duración`

### Capa de Acceso a Datos (ORM — Backend)

> Responsable de la persistencia y consulta de datos.

- **SQLAlchemy ORM**: modelos declarativos que mapean a tablas
- **Sesiones**: `SessionLocal` con `get_db()` dependency injection
- **Consultas**: queries filtradas por `estado_pago != LIBRE` para excluir canceladas

### Capa de Datos (Base de Datos)

> Responsable del almacenamiento persistente.

- **SQLite**: base de datos liviana, sin servidor externo
- **Tablas**: `users`, `auth`, `reservas`, `canchas`, `horarios`, `equipos`, `alquileres_equipo`

---

## 10. Metodología de Desarrollo

### SDD — Spec-Driven Development

El proyecto utiliza **SDD** como metodología estructurada de desarrollo:

```
Exploración → Proposal → Spec → Design → Tasks → Apply → Verify → Archive
     │           │         │       │       │       │       │       │
  Investiga   Define     Especifica   Diseño    Checklist  Código   Valida   Limpia
  el dominio  el qué     el cómo      técnico   impl.     real     contra   artifacts
```

**Artefactos guardados en Engram (memoria persistente):**

| Artefacto                     | Descripción                                             |
| ----------------------------- | ------------------------------------------------------- |
| `sdd/{change}/proposal`       | Intención, alcance, riesgos, rollback                   |
| `sdd/{change}/spec`           | Requisitos formales con escenarios Given/When/Then      |
| `sdd/{change}/design`         | Decisiones técnicas, contratos de API, modelos de datos |
| `sdd/{change}/tasks`          | Checklist atómica de implementación                     |
| `sdd/{change}/apply-progress` | Progreso de la implementación                           |

### Prácticas de Código

- **Conventional Commits**: `feat/`, `fix/`, `chore/`, `docs/`
- **No build en desarrollo**: cambios validados con `tsc --noEmit` y tests manuales
- **Componentes reutilizables**: patrón container-presentational
- **Types en un solo lugar**: `src/types.ts` como fuente de verdad

---

## 11. Mapa de Navegación

```
/ (HomePage)
│
├── /reservas (ReservasPage)
│   └── Formulario de reserva sin auth
│
├── /login (LoginPage)
│   └── Login admin → redirige a /admin/dashboard
│
├── /register (RegisterPage)
│   └── Registro de admin
│
└── /admin/* (AdminDashboardPage — section routing)
    ├── ?section=dashboard   → Stats + ocupación + trazabilidad
    ├── ?section=reservas   → Formulario crear reserva + grilla
    ├── ?section=reportes   → ReportesAvanzadosSection (gráficos + Excel)
    ├── ?section=inventario → InventarioSection (CRUD equipos)
    └── ?section=canchas    → Gestión de canchas
```

---

## 12. Stack Tecnológico por Capa

### Frontend

| Dependencia          | Versión | Propósito                        |
| -------------------- | ------- | -------------------------------- |
| **react**            | ^18     | Framework UI                     |
| **react-dom**        | ^18     | Renderizado                      |
| **react-router-dom** | ^6      | Enrutamiento                     |
| **typescript**       | ^5      | Tipado estático                  |
| **vite**             | ^5      | Bundler y dev server             |
| **axios**            | ^1      | Cliente HTTP                     |
| **recharts**         | ^2      | Gráficos interactivos (Recharts) |
| **bootstrap**        | ^5      | Framework CSS                    |
| **react-icons**      | ^5      | Íconos SVG                       |

### Backend

| Dependencia          | Versión | Propósito                    |
| -------------------- | ------- | ---------------------------- |
| **fastapi**          | ^0.109  | Framework API                |
| **uvicorn**          | ^0.27   | Servidor ASGI                |
| **sqlalchemy**       | ^2      | ORM                          |
| **pydantic**         | ^2      | Validación de datos          |
| **python-jose**      | ^3.3    | Tokens JWT                   |
| **passlib**          | ^1.7    | Hashing de contraseñas       |
| **python-multipart** | ^0.0.6  | Parsing de formularios       |
| **openpyxl**         | ^3.1    | Generación de archivos Excel |
| **bcrypt**           | ^4.1    | Algoritmo de hashing         |

### Base de Datos

| Componente     | Tipo          | Propósito                |
| -------------- | ------------- | ------------------------ |
| **SQLite**     | Archivo local | Base de datos embebida   |
| **SQLAlchemy** | ORM           | Abstracción de consultas |

---

## 13. Patrones de Diseño

### Backend

| Patrón                   | Aplicación                                                        | Beneficio                                         |
| ------------------------ | ----------------------------------------------------------------- | ------------------------------------------------- |
| **Repository Pattern**   | `Service` actúa como repositorio, encapsulando queries SQLAlchemy | Separación de lógica de negocio de acceso a datos |
| **Dependency Injection** | `get_db()` como dependencia FastAPI                               | Gestión automática del ciclo de vida de sesiones  |
| **Enum Pattern**         | `EstadoPago` como Python enum                                     | Autocompletado, seguridad de tipos en switch/if   |
| **Value Object**         | Schemas Pydantic como DTOs                                        | Validación declarativa en la capa de entrada      |
| **Service Layer**        | Cada dominio tiene su `Service`                                   | Código organizado por dominio, fácil de testear   |

### Frontend

| Patrón                       | Aplicación                                                              | Beneficio                                      |
| ---------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------- |
| **Container-Presentational** | `HorariosCanchasSection` (container) → `HorariosTable` (presentational) | Separación de lógica de datos de renderizado   |
| **Custom Hooks**             | Lógica extraída a hooks cuando se reutiliza                             | DRY, componentes limpios                       |
| **Atomic Design**            | atoms → molecules → organisms → pages                                   | Consistencia visual, componentes reutilizables |
| **Optimistic Updates**       | Actualización de UI antes de confirmación del servidor                  | UX responsiva                                  |
| **State Colocation**         | Estado declarado en el componente que lo necesita                       | Menos prop drilling, mejor performance         |

---

## 14. Configuración de Ambientes

### Desarrollo

```bash
# Backend
cd API
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
npm install
npm run dev
```

### Variables de Entorno

**Backend** (`API/.env` o variables de sistema):

```
DATABASE_URL=sqlite:///./upgi.db
SECRET_KEY=tu-clave-secreta-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DEBUG=true
```

**Frontend** (`vite.config.ts`):

```typescript
// VITE_API_URL se configura para desarrollo:
// Desarrollo: http://localhost:8000
// Producción: URL del servidor de producción
```

### Base de Datos

- **Motor**: SQLite 3 (embebido, sin instalación de servidor)
- **Archivo**: `API/upgi.db` (en `.gitignore`)
- **Migraciones**: No se usa Alembic; las tablas se crean con `Base.metadata.create_all(engine)` al iniciar
- **Reset**: Eliminar `upgi.db` y reiniciar el servidor (recrea las tablas)

### Endpoints Principales

| Método | Endpoint                              | Descripción                      |
| ------ | ------------------------------------- | -------------------------------- |
| POST   | `/api/v1/auth/login`                  | Login, retorna JWT               |
| POST   | `/api/v1/auth/register`               | Registro de admin                |
| GET    | `/api/v1/canchas`                     | Listar canchas                   |
| GET    | `/api/v1/canchas/{id}/disponibilidad` | Verificar disponibilidad         |
| POST   | `/api/v1/reservas/public`             | Crear reserva pública (sin auth) |
| GET    | `/api/v1/admin/dashboard`             | Stats del dashboard              |
| GET    | `/api/v1/admin/reservas`              | Listar todas las reservas        |
| PATCH  | `/api/v1/admin/reservas/{id}/pago`    | Actualizar estado de pago        |
| GET    | `/api/v1/admin/reportes/ocupacion`    | Ocupación por cancha             |
| GET    | `/api/v1/admin/reportes/export/excel` | Exportar reportes a Excel        |
| GET    | `/api/v1/admin/equipos`               | Listar equipos                   |
| POST   | `/api/v1/admin/equipos`               | Crear equipo                     |

---

## 15. Control de Versiones

### Git — Commits

```
c2dbd54 fix(admin): filtrar grilla por fecha seleccionada y sincronizar quick-reserve
aa78a67 feat(inventario): modulo de gestion de equipos con CRUD y resumen de stock
cf5beab feat(reportes): dashboard analitico con graficos Recharts y exportacion Excel
25a62d3 chore: actualizar gitignore y documentacion de API
cc1b50a chore: agregar reglas gitignore para archivos db, caches python y static assets
```

### Convenciones de Commits (Conventional Commits)

| Prefijo     | Uso                                        |
| ----------- | ------------------------------------------ |
| `feat:`     | Nueva funcionalidad                        |
| `fix:`      | Corrección de bug                          |
| `chore:`    | Mantenimiento, configuración               |
| `docs:`     | Documentación                              |
| `refactor:` | Reestructuración sin cambiar funcionalidad |
| `test:`     | Tests agregados                            |

### Ramas

- `main` — Rama principal con código producción-ready
- Sin ramas de feature activas (desarrollo directo en main para este proyecto académico)

---

## 16. Guía de Instalación y Ejecución

### Prerrequisitos

- **Node.js** 18+ y npm
- **Python** 3.10+ y pip

### Paso 1 — Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd upgi_mvp
```

### Paso 2 — Backend

```bash
cd API
python -m venv venv
# Windows: .\venv\Scripts\activate
# Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

El backend estará disponible en `http://localhost:8000`

### Paso 3 — Frontend

```bash
# En otra terminal
cd upgi_mvp
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

### Paso 4 — Credenciales de Prueba

```bash
# Registrar un admin
POST /api/v1/auth/register
{
  "email": "admin@upgi.com",
  "password": "Admin123!",
  "nombre": "Administrador UPGI"
}

# Login
POST /api/v1/auth/login
{
  "email": "admin@upgi.com",
  "password": "Admin123!"
}
```

---

## 17. Documentación GFPI-F-135

| Documento                   | Ubicación                                  | Descripción                               |
| --------------------------- | ------------------------------------------ | ----------------------------------------- |
| **Manual Técnico**          | `documentacion/MANUAL_TECNICO.md`          | Datos de entrada/salida por módulo        |
| **Informe de Pruebas**      | `documentacion/INFORME_PRUEBAS.md`         | Resultados de pruebas manuales (Postman)  |
| **Verificación Requisitos** | `documentacion/VERIFICACION_REQUISITOS.md` | Cumplimiento de cada requisito GFPI-F-135 |

---

## 18. Componentes Construidos

### Flujo Consumidor

| Componente           | Ruta        | Descripción                                  |
| -------------------- | ----------- | -------------------------------------------- |
| `HomePage`           | `/`         | Landing page con hero, features, CTA         |
| `ReservasPage`       | `/reservas` | Formulario de reserva pública                |
| `ReservaFormSection` | —           | Formulario de selección de cancha/fecha/hora |

### Flujo Admin

| Componente               | Ruta                 | Descripción                                       |
| ------------------------ | -------------------- | ------------------------------------------------- |
| `AdminDashboardPage`     | `/admin/*`           | Shell principal con sidebar y routing por sección |
| `AdminSidebar`           | —                    | Navegación lateral del panel                      |
| `StatsSection`           | —                    | Cards de métricas (reservas, ingresos, canchas)   |
| `HorariosCanchasSection` | `?section=dashboard` | Grilla de ocupación con cards y DatePicker        |
| `HorariosTable`          | —                    | Tabla con columnas por cancha y filas por hora    |
| `ReservaCell`            | —                    | Celda individual con color por estado             |
| `ReservationModal`       | —                    | Modal de detalle con acciones (pago, cancelar)    |
| `PaymentStatusBadge`     | —                    | Badge visual de estado de pago                    |

### Módulo de Reportes Avanzados

| Componente                 | Descripción                                           |
| -------------------------- | ----------------------------------------------------- |
| `ReportesAvanzadosSection` | Página de reportes con filtros y gráficos             |
| `ReporteFiltros`           | Filtros de fecha y cancha con botón "Aplicar"         |
| `IngresosChart`            | Gráfico de línea (Recharts) — ingresos por día        |
| `OcupacionChart`           | Gráfico de barras (Recharts) — % ocupación por cancha |
| `HorariosPicoTable`        | Tabla top 10 horarios más reservados                  |
| `ClientesFrecuentesTable`  | Tabla top 10 clientes frecuentes                      |
| `ExportarExcelButton`      | Botón que descarga reporte en formato .xlsx           |

### Módulo de Inventario

| Componente          | Descripción                                    |
| ------------------- | ---------------------------------------------- |
| `InventarioSection` | Sección completa con tabla, formulario y stats |
| `InventarioStats`   | 3 mini-cards: total equipos, stock, valor      |
| `EquipoForm`        | Formulario crear/editar equipo inline          |

### Auth

| Componente     | Ruta        | Descripción               |
| -------------- | ----------- | ------------------------- |
| `LoginPage`    | `/login`    | Página de login           |
| `LoginForm`    | —           | Formulario con validación |
| `RegisterPage` | `/register` | Registro de admin         |
| `AdminSidebar` | —           | Link de logout            |

---

---

_Última actualización: Abril 2026_
