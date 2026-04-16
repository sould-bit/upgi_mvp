# VERIFICACIÓN DE REQUISITOS GFPI-F-135
## Proyecto UPGI — Sistema de Gestión de Reservas Deportivas

**Fecha de verificación:** Abril 2026

---

## REQUISITO 1: Conocer los requerimientos del sistema

| Estado | ✅ CUMPLIDO |
|--------|-------------|
| **Evidencia** | `README.md` — Sección 2: Requerimientos del Sistema |
| **Detalle** | Lista completa de RF-01 a RF-12 y RNF-01 a RNF-05 |

**Ubicación:** `README.md` líneas 38-66

---

## REQUISITO 2: Contar con documentos o actas de aprobación de los requerimientos

| Estado | ✅ CUMPLIDO |
|--------|-------------|
| **Evidencia** | `README.md` — Sección 3: Casos de Uso |
| **Detalle** | Diagramas de casos de uso, actores, historias de usuario con criterios de aceptación |

**Ubicación:** `README.md` líneas 69-106

---

## REQUISITO 3: Manejar un repositorio de control de versiones (GIT, SVN, Otros)

| Estado | ✅ CUMPLIDO |
|--------|-------------|
| **Evidencia** | Repositorio Git activo |
| **Detalle** | Rama `main`, 8 commits locales, historial de cambios documentado |

**Comandos de verificación:**
```bash
git status
git log --oneline -10
```

**Ubicación:** Raíz del proyecto (`upgi_mvp/`)

---

## REQUISITO 4: Entregar los archivos ejecutables

| Estado | ℹ️ NO APLICA |
|--------|--------------|
| **Razón** | Es una aplicación web (no escritorio). Los "ejecutables" son: |
| **Frontend** | `npm run dev` → Servidor de desarrollo en puerto 5173 |
| **Backend** | `uvicorn app.main:app` → Servidor API en puerto 8000 |

**Nota:** Para producción se utilizarían archivos buildados (dist/ para frontend) pero el proyecto aún está en fase MVP.

---

## REQUISITO 5: Entregar las urls en donde se han desplegado los módulos

| Estado | ⚠️ PENDIENTE |
|--------|--------------|
| **Razón** | El proyecto no ha sido desplegado a producción todavía |

**Ambientes disponibles actualmente:**

| Ambiente | URL | Estado |
|----------|-----|--------|
| **Desarrollo Frontend** | `http://localhost:5173` | ✅ Activo |
| **Desarrollo Backend** | `http://localhost:8000` | ✅ Activo |
| **Swagger Docs** | `http://localhost:8000/docs` | ✅ Activo |
| **Producción** | Por definir | ⏳ Pendiente despliegue |

**Para desplegar (opciones gratuitas):**
- **Frontend:** Vercel, Netlify
- **Backend:** Railway, Render, Fly.io
- **Base de datos:** SQLite → migrar a PostgreSQL

---

## REQUISITO 6: Documentación por módulo y componente donde se registren datos de entrada y salida

| Estado | ✅ CUMPLIDO |
|--------|-------------|
| **Evidencia** | `documentacion/MANUAL_TECNICO.md` |
| **Detalle** | Documentación completa de todos los módulos con endpoints, datos de entrada y salida |

**Módulos documentados:**

| Módulo | Secciones en Manual Técnico |
|--------|---------------------------|
| Autenticación | A01-A04 (registro, login, logout, perfil) |
| Canchas | C01-C06 (listar, crear, editar, disponibilidad, eliminar) |
| Reservas | R01-R05 (crear pública, crear auth, listar, cancelar, pagar) |
| Reportes | RP01-RP03 (dashboard, semanal, ingresos) |
| Inventario | Equipos (listar, crear) |

**Ubicación:** `documentacion/MANUAL_TECNICO.md`

---

## REQUISITO 7: Informar acerca de las pruebas realizadas de cada módulo y su resultado

| Estado | ✅ CUMPLIDO |
|--------|-------------|
| **Evidencia** | `documentacion/INFORME_PRUEBAS.md` |
| **Detalle** | 24 casos de prueba ejecutados con Postman, 100% aprobados |

**Resumen:**
- Módulo Auth: 5 pruebas ✅
- Módulo Canchas: 5 pruebas ✅
- Módulo Reservas: 4 pruebas ✅
- Módulo Admin: 4 pruebas ✅
- Módulo Users: 2 pruebas ✅
- Módulo System: 2 pruebas ✅
- Módulo Inventario: 2 pruebas ✅

**Ubicación:** `documentacion/INFORME_PRUEBAS.md`

---

## REQUISITO 8: Documentar las configuraciones de servidores y de bases de datos y documentar los ambientes de desarrollo y pruebas

| Estado | ✅ CUMPLIDO |
|--------|-------------|
| **Evidencia** | `INFORME_PRUEBAS.md` — Sección 3 y 8 |

### Configuración de Servidor (Backend)

| Parámetro | Valor |
|-----------|-------|
| **Framework** | FastAPI + Python 3.10+ |
| **Puerto** | 8000 |
| **Servidor** | uvicorn |
| **Debug** | `--reload` habilitado |

### Configuración de Base de Datos

| Parámetro | Valor |
|-----------|-------|
| **Motor** | SQLite 3 |
| **Archivo** | `API/upgi.db` |
| **ORM** | SQLAlchemy 2 |
| **Ubicación** | Ignorada en Git (`.gitignore`) |

### Variables de Entorno

| Variable | Valor por Defecto |
|----------|-------------------|
| `DATABASE_URL` | `sqlite:///./upgi.db` |
| `SECRET_KEY` | (generada dinámicamente) |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` (24h) |

### Ambientes Documentados

| Ambiente | Descripción |
|----------|-------------|
| **Desarrollo** | localhost:8000 + localhost:5173 |
| **Pruebas** | Misma URL, base de datos SQLite |
| **Producción** | Pendiente despliegue |

---

## REQUISITO 9: Entregar manuales técnicos

| Estado | ✅ CUMPLIDO |
|--------|-------------|
| **Evidencia** | `documentacion/MANUAL_TECNICO.md` |

**Contenido del Manual Técnico:**

1. Introducción y propósito
2. Arquitectura del sistema (diagrama)
3. Módulo: Autenticación (datos entrada/salida)
4. Módulo: Canchas (datos entrada/salida)
5. Módulo: Reservas (datos entrada/salida)
6. Módulo: Reportes (datos entrada/salida)
7. Módulo: Inventario (datos entrada/salida)
8. Configuración de ambientes
9. Base de datos (esquema)
10. Seguridad

---

## RESUMEN DE CUMPLIMIENTO

| # | Requisito | Estado |
|---|-----------|--------|
| 1 | Conocer los requerimientos del sistema | ✅ |
| 2 | Actas de aprobación de requerimientos | ✅ |
| 3 | Repositorio de control de versiones | ✅ |
| 4 | Archivos ejecutables | ℹ️ N/A |
| 5 | URLs de despliegue | ⚠️ Pendiente |
| 6 | Documentación por módulo (entrada/salida) | ✅ |
| 7 | Informe de pruebas | ✅ |
| 8 | Configuraciones de servidores y BD | ✅ |
| 9 | Manuales técnicos | ✅ |

**Cumplimiento total:** 7/7 aplicables ✅  
**Pendiente:** 1 (despliegue a producción)

---

## DOCUMENTOS GENERADOS

| Documento | Ubicación | Propósito |
|-----------|-----------|-----------|
| **Manual Técnico** | `documentacion/MANUAL_TECNICO.md` | Datos de entrada/salida por módulo |
| **Informe de Pruebas** | `documentacion/INFORME_PRUEBAS.md` | Resultados de pruebas y configuraciones |
| **Verificación GFPI-F-135** | `documentacion/VERIFICACION_REQUISITOS.md` | Este documento |

---

## PRÓXIMOS PASOS

Para cumplir al 100% con GFPI-F-135, se recomienda:

1. **Desplegar el sistema** a producción (Vercel + Railway/Render)
2. **Actualizar este documento** con las URLs de producción una vez desplegado
3. **Opcional:** Implementar tests automatizados con pytest

---

**Documento elaborado para cumplimiento GFPI-F-135**  
**Proyecto UPGI — MVP**
