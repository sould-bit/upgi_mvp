# UPGI React + TSX

Evidencia academica del proyecto UPGI migrado a una estructura de componentes en React con TypeScript.

## Rutas

- `/` HomePage
- `/reservas` flujo de reservas
- `/login` autenticacion
- `/admin/dashboard` panel administrativo
- `/admin/reservas`, `/admin/reportes`, `/admin/inventario`, `/admin/configuracion`

## Checklist cubierto

- Layout global: `MainLayout`, `Navbar`, `Footer`
- Admin layout: `AdminSidebar`, `AdminTopbar`, `AdminSearchBox`, `NotificationsMenu`
- Home: `HeroSection`, `WelcomeCtaSection`, `FeatureCard`
- Reservas: `ReservasHeaderSection`, `ReservaFormSection`, `ReservaDetailsSection`
- Auth: `LoginHeaderSection`, `LoginFormSection`, `LoginForm`
- Admin: `DashboardWelcomeAlert`, `StatsSection`, `StatCard`
- Operacion de canchas: `HorariosCanchasSection`, `HorariosTable`, `ReservaCell`, `PaymentStatusBadge`, `StatusLegend`
- Reportes: `ReservasPorSemanaSection`, `BarChartPlaceholder`

## Comandos

```bash
npm install
npm run dev
```
