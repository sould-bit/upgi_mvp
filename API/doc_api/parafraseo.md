***Sistema de gestión de reservas de canchas deportivas UPGI***

## Definición del Proyecto

UPGI es una plataforma web que permite a usuarios reservar canchas deportivas de manera online. El sistema gestiona:

1. **Autenticación de Usuarios**
   - Registro con email y contraseña
   - Inicio y cierre de sesión
   - Gestión de tokens JWT para sesiones seguras

2. **Gestión de Reservas**
   - Crear reservas seleccionando: cancha, fecha, horario (inicio/fin)
   - Especificar cantidad de jugadores
   - Verificar disponibilidad de horarios
   - Estados de pago: Libre, Abonado, Sin pagar, Pagado
   - Mostrar resumen de reserva (disponibilidad, duración, precio)

3. **Administración de Canchas**
   - Listado de canchas disponibles
   - Horarios por cancha
   - Vista de cuadrícula (horarios × canchas)
   - Estados: ocupado (con jugador), libre

4. **Panel Administrativo**
   - Dashboard con estadísticas (reservas totales, ingresos, etc.)
   - Gestión de reservas
   - Reportes semanales (gráfico de barras)
   - Inventario de canchas
   - Configuraciones del sistema

5. **Reportes**
   - Estadísticas de reservas por semana
   - Visualización de datos en gráficos

## Objetivos del Negocio

- Facilitar la reserva online de canchas deportivas las 24/7
- Reducir tiempos de gestión telefónica
- Proporcionar visibilidad de disponibilidad en tiempo real
- Permitir gestión administrativa centralizada
- Generar reportes para toma de decisiones

## Funcionalidades Principales

| Funcionalidad | Descripción |
|---------------|-------------|
| Login | Autenticación de usuarios con email/password |
| Registro | Creación de nuevas cuentas de usuario |
| Reserva | Selección de cancha, fecha y horario |
| Dashboard | Panel con métricas y estadísticas |
| Reportes | Visualización de datos de reservas |

[back to README](README.md)
