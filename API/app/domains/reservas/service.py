from datetime import datetime, date, time, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, extract
from app.domains.reservas.models import Reserva, EstadoPago, ComunicacionReserva, ReglaPrecio
from app.domains.canchas.models import Cancha
from app.domains.inventario.models import AlquilerEquipo, Equipo
from app.domains.users.models import User
from app.core.exceptions import NotFoundException, ConflictException, ValidationException, ForbiddenException


class ReservaService:
    def __init__(self, db: Session):
        self.db = db

    def crear_publico(
        self,
        cancha_id: int,
        fecha: date,
        hora_inicio: time,
        hora_fin: time,
        jugadores: int,
        nombre: str,
        email: str,
        telefono: str | None = None,
        observaciones: str | None = None
    ) -> dict:
        if hora_fin <= hora_inicio:
            raise ValidationException("La hora de fin debe ser posterior a la hora de inicio")

        from app.domains.auth.models import Auth
        from app.core.security import hash_password

        email_normalizado = email.lower().strip()

        # Buscar auth existente por email.
        auth = self.db.query(Auth).filter(Auth.email == email_normalizado).first()
        if not auth:
            # Crear Auth y User juntos.
            auth = Auth(
                email=email_normalizado,
                password_hash=hash_password("RESERVA-SIN-ACCESO-2026")
            )
            self.db.add(auth)
            self.db.flush()  # para obtener auth.id antes de crear User.

            usuario = User(
                auth_id=auth.id,
                nombre=nombre.strip(),
                telefono=telefono.strip() if telefono else None,
                is_admin=False
            )
            self.db.add(usuario)
            self.db.commit()
            self.db.refresh(usuario)
        else:
            usuario = self.db.query(User).filter(User.auth_id == auth.id).first()
            if not usuario:
                raise NotFoundException("Usuario no encontrado para este correo")
            # Actualizar datos por si cambiaron.
            usuario.nombre = nombre.strip()
            if telefono:
                usuario.telefono = telefono.strip()
            self.db.commit()

        return self.crear(
            usuario_id=usuario.id,
            cancha_id=cancha_id,
            fecha=fecha,
            hora_inicio=hora_inicio,
            hora_fin=hora_fin,
            jugadores=jugadores,
            observaciones=observaciones
        )

    def crear(
        self,
        usuario_id: int,
        cancha_id: int,
        fecha: date,
        hora_inicio: time,
        hora_fin: time,
        jugadores: int,
        observaciones: str | None = None
    ) -> dict:
        if hora_fin <= hora_inicio:
            raise ValidationException("La hora de fin debe ser posterior a la hora de inicio")

        cancha = self.db.query(Cancha).filter(Cancha.id == cancha_id).first()
        if not cancha:
            raise NotFoundException("Cancha no encontrada")

        if not cancha.is_active:
            raise ValidationException("La cancha no está disponible")

        if jugadores > cancha.capacidad:
            raise ValidationException(f"La cantidad de jugadores excede la capacidad de la cancha ({cancha.capacidad})")

        reservas_conflictivas = self.db.query(Reserva).filter(
            Reserva.cancha_id == cancha_id,
            Reserva.fecha == fecha,
            Reserva.estado_pago != EstadoPago.LIBRE,
            or_(
                and_(Reserva.hora_inicio < hora_fin, Reserva.hora_fin > hora_inicio)
            )
        ).first()

        if reservas_conflictivas:
            raise ConflictException("El horario seleccionado ya está reservado")

        inicio_dt = datetime.combine(fecha, hora_inicio)
        fin_dt = datetime.combine(fecha, hora_fin)
        duracion_horas = (fin_dt - inicio_dt).seconds / 3600
        precio_total = float(cancha.precio_hora) * duracion_horas

        reserva = Reserva(
            usuario_id=usuario_id,
            cancha_id=cancha_id,
            fecha=fecha,
            hora_inicio=hora_inicio,
            hora_fin=hora_fin,
            jugadores=jugadores,
            estado_pago=EstadoPago.SIN_PAGAR,
            precio_total=precio_total,
            observaciones=observaciones
        )
        self.db.add(reserva)
        self.db.commit()
        self.db.refresh(reserva)

        return {
            "status": 201,
            "message": "Reserva creada exitosamente",
            "reserva": {
                "id": reserva.id,
                "cancha": {"id": cancha.id, "nombre": cancha.nombre},
                "fecha": reserva.fecha,
                "hora_inicio": reserva.hora_inicio.strftime("%H:%M"),
                "hora_fin": reserva.hora_fin.strftime("%H:%M"),
                "jugadores": reserva.jugadores,
                "estado_pago": reserva.estado_pago.value,
                "precio_total": float(reserva.precio_total),
                "observaciones": reserva.observaciones
            }
        }

    def listar_usuario(
        self,
        usuario_id: int,
        fecha_desde: date | None = None,
        fecha_hasta: date | None = None,
        estado_pago: str | None = None,
        page: int = 1,
        limit: int = 20
    ) -> dict:
        query = self.db.query(Reserva).filter(Reserva.usuario_id == usuario_id)

        if fecha_desde:
            query = query.filter(Reserva.fecha >= fecha_desde)
        if fecha_hasta:
            query = query.filter(Reserva.fecha <= fecha_hasta)
        if estado_pago:
            query = query.filter(Reserva.estado_pago == EstadoPago(estado_pago))
        else:
            query = query.filter(Reserva.estado_pago != EstadoPago.LIBRE)

        total = query.count()
        reservas = query.order_by(Reserva.fecha.desc()).offset((page - 1) * limit).limit(limit).all()

        return {
            "status": 200,
            "reservas": [self._format_reserva(r) for r in reservas],
            "total": total,
            "page": page,
            "limit": limit
        }

    def get_detalle(self, reserva_id: int, usuario_id: int, is_admin: bool = False) -> dict:
        reserva = self.db.query(Reserva).filter(Reserva.id == reserva_id).first()
        if not reserva:
            raise NotFoundException("Reserva no encontrada")

        if not is_admin and reserva.usuario_id != usuario_id:
            raise ForbiddenException("No tienes acceso a esta reserva")

        usuario = self.db.query(User).filter(User.id == reserva.usuario_id).first()
        cancha = self.db.query(Cancha).filter(Cancha.id == reserva.cancha_id).first()

        return {
            "status": 200,
            "reserva": {
                "id": reserva.id,
                "usuario": {
                    "id": usuario.id,
                    "nombre": usuario.nombre,
                    "email": getattr(usuario, 'email', 'N/A'),
                    "telefono": usuario.telefono
                },
                "cancha": {
                    "id": cancha.id,
                    "nombre": cancha.nombre,
                    "tipo": cancha.tipo
                },
                "fecha": reserva.fecha,
                "hora_inicio": reserva.hora_inicio.strftime("%H:%M"),
                "hora_fin": reserva.hora_fin.strftime("%H:%M"),
                "jugadores": reserva.jugadores,
                "estado_pago": reserva.estado_pago.value,
                "precio_total": float(reserva.precio_total),
                "observaciones": reserva.observaciones,
                "created_at": reserva.created_at.isoformat() if reserva.created_at else None
            }
        }

    def cancelar(self, reserva_id: int, usuario_id: int, is_admin: bool = False) -> dict:
        reserva = self.db.query(Reserva).filter(Reserva.id == reserva_id).first()
        if not reserva:
            raise NotFoundException("Reserva no encontrada")

        if not is_admin and reserva.usuario_id != usuario_id:
            raise ForbiddenException("No tienes permiso para cancelar esta reserva")

        if reserva.estado_pago == EstadoPago.LIBRE:
            return {"status": 200, "message": "La reserva ya estaba cancelada"}

        if reserva.estado_pago == EstadoPago.PAGADO:
            raise ValidationException("No se puede cancelar una reserva pagada")

        reserva.estado_pago = EstadoPago.LIBRE
        reserva.observaciones = self._append_cancel_note(
            reserva.observaciones,
            actor_usuario_id=usuario_id,
            is_admin=is_admin
        )
        self.db.commit()

        return {"status": 200, "message": "Reserva cancelada exitosamente"}

    def actualizar_pago(self, reserva_id: int, estado_pago: EstadoPago) -> dict:
        reserva = self.db.query(Reserva).filter(Reserva.id == reserva_id).first()
        if not reserva:
            raise NotFoundException("Reserva no encontrada")

        if reserva.estado_pago == EstadoPago.LIBRE:
            raise ValidationException("No se puede actualizar el pago de una reserva cancelada")

        reserva.estado_pago = estado_pago
        self.db.commit()
        self.db.refresh(reserva)

        return {
            "status": 200,
            "message": "Estado de pago actualizado",
            "reserva": {"id": reserva.id, "estado_pago": estado_pago.value}
        }

    def listar_todas(
        self,
        fecha: date | None = None,
        cancha_id: int | None = None,
        estado_pago: str | None = None,
        usuario_id: int | None = None,
        page: int = 1,
        limit: int = 50
    ) -> dict:
        query = self.db.query(Reserva)

        if fecha:
            query = query.filter(Reserva.fecha == fecha)
        if cancha_id:
            query = query.filter(Reserva.cancha_id == cancha_id)
        if estado_pago:
            query = query.filter(Reserva.estado_pago == EstadoPago(estado_pago))
        else:
            query = query.filter(Reserva.estado_pago != EstadoPago.LIBRE)
        if usuario_id:
            query = query.filter(Reserva.usuario_id == usuario_id)

        total = query.count()
        reservas = query.order_by(Reserva.fecha.desc()).offset((page - 1) * limit).limit(limit).all()

        return {
            "status": 200,
            "reservas": [self._format_reserva_admin(r) for r in reservas],
            "total": total,
            "page": page,
            "limit": limit
        }

    def _format_reserva(self, reserva: Reserva) -> dict:
        cancha = self.db.query(Cancha).filter(Cancha.id == reserva.cancha_id).first()
        return {
            "id": reserva.id,
            "cancha": {"id": cancha.id, "nombre": cancha.nombre, "tipo": cancha.tipo},
            "fecha": reserva.fecha,
            "hora_inicio": reserva.hora_inicio.strftime("%H:%M"),
            "hora_fin": reserva.hora_fin.strftime("%H:%M"),
            "jugadores": reserva.jugadores,
            "estado_pago": reserva.estado_pago.value,
            "precio_total": float(reserva.precio_total)
        }

    def _format_reserva_admin(self, reserva: Reserva) -> dict:
        usuario = self.db.query(User).filter(User.id == reserva.usuario_id).first()
        cancha = self.db.query(Cancha).filter(Cancha.id == reserva.cancha_id).first()
        alquileres = self.db.query(AlquilerEquipo).filter(AlquilerEquipo.reserva_id == reserva.id).all()
        return {
            "id": reserva.id,
            "usuario": {
                "id": usuario.id,
                "nombre": usuario.nombre,
                "email": usuario.auth.email if usuario and usuario.auth else None,
                "telefono": usuario.telefono if usuario else None,
            },
            "cancha": {"id": cancha.id, "nombre": cancha.nombre},
            "fecha": reserva.fecha,
            "hora_inicio": reserva.hora_inicio.strftime("%H:%M"),
            "hora_fin": reserva.hora_fin.strftime("%H:%M"),
            "estado_pago": reserva.estado_pago.value,
            "precio_total": float(reserva.precio_total),
            "observaciones": reserva.observaciones,
            "created_at": reserva.created_at.isoformat() if reserva.created_at else None,
            "alquileres": [self._format_alquiler(alquiler) for alquiler in alquileres],
        }

    def _format_alquiler(self, alquiler: AlquilerEquipo) -> dict:
        equipo = self.db.query(Equipo).filter(Equipo.id == alquiler.equipo_id).first()
        return {
            "id": alquiler.id,
            "equipo_id": alquiler.equipo_id,
            "equipo_nombre": equipo.nombre if equipo else "Equipo",
            "categoria": equipo.categoria if equipo else "Sin categoria",
            "cantidad": alquiler.cantidad,
            "precio_alquiler": float(alquiler.precio_alquiler),
            "subtotal": float(alquiler.precio_alquiler) * alquiler.cantidad,
        }

    def _append_cancel_note(self, observaciones: str | None, actor_usuario_id: int, is_admin: bool) -> str:
        actor = "admin" if is_admin else "usuario"
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        note = f"[CANCELADA por {actor} {actor_usuario_id} - {timestamp}]"

        if observaciones:
            return f"{observaciones}\n{note}"

        return note

    def listar_comunicaciones(self, reserva_id: int, is_admin: bool = False) -> dict:
        reserva = self.db.query(Reserva).filter(Reserva.id == reserva_id).first()
        if not reserva:
            raise NotFoundException("Reserva no encontrada")

        comunicaciones = (
            self.db.query(ComunicacionReserva)
            .filter(ComunicacionReserva.reserva_id == reserva_id)
            .order_by(ComunicacionReserva.created_at.asc())
            .all()
        )

        return {
            "status": 200,
            "comunicaciones": [self._format_comunicacion(c) for c in comunicaciones],
        }

    def crear_comunicacion(
        self,
        reserva_id: int,
        autor_usuario_id: int,
        autor_nombre: str,
        contenido: str,
        is_admin: bool = False,
    ) -> dict:
        reserva = self.db.query(Reserva).filter(Reserva.id == reserva_id).first()
        if not reserva:
            raise NotFoundException("Reserva no encontrada")

        if reserva.estado_pago == EstadoPago.LIBRE and not is_admin:
            raise ValidationException("No se pueden agregar notas a una reserva cancelada")

        comunicacion = ComunicacionReserva(
            reserva_id=reserva_id,
            autor_usuario_id=autor_usuario_id,
            autor_nombre=autor_nombre,
            contenido=contenido,
            tipo="NOTE",
        )
        self.db.add(comunicacion)
        self.db.commit()
        self.db.refresh(comunicacion)

        return {
            "status": 201,
            "message": "Nota agregada",
            "comunicacion": self._format_comunicacion(comunicacion),
        }

    def _format_comunicacion(self, c: ComunicacionReserva) -> dict:
        return {
            "id": c.id,
            "reserva_id": c.reserva_id,
            "autor_usuario_id": c.autor_usuario_id,
            "autor_nombre": c.autor_nombre,
            "contenido": c.contenido,
            "tipo": c.tipo,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }

    def listar_reglas_precio(self) -> dict:
        reglas = (
            self.db.query(ReglaPrecio)
            .filter(ReglaPrecio.is_active == True)
            .order_by(ReglaPrecio.id)
            .all()
        )
        return {
            "status": 200,
            "reglas": [self._format_regla(r) for r in reglas],
        }

    def crear_regla_precio(self, data) -> dict:
        regla = ReglaPrecio(
            nombre=data.nombre,
            tipo=data.tipo,
            valor=data.valor,
            es_socio=data.es_socio,
        )
        if data.hora_inicio:
            regla.hora_inicio = datetime.strptime(data.hora_inicio, "%H:%M").time()
        if data.hora_fin:
            regla.hora_fin = datetime.strptime(data.hora_fin, "%H:%M").time()

        self.db.add(regla)
        self.db.commit()
        self.db.refresh(regla)

        return {
            "status": 201,
            "message": "Regla de precio creada",
            "regla": self._format_regla(regla),
        }

    def preview_precio(self, data) -> dict:
        cancha = self.db.query(Cancha).filter(Cancha.id == data.cancha_id).first()
        if not cancha:
            raise NotFoundException("Cancha no encontrada")

        hora_inicio = datetime.strptime(data.hora_inicio, "%H:%M").time()
        hora_fin = datetime.strptime(data.hora_fin, "%H:%M").time()

        inicio_dt = datetime.combine(date.today(), hora_inicio)
        fin_dt = datetime.combine(date.today(), hora_fin)
        duracion_horas = (fin_dt - inicio_dt).seconds / 3600
        precio_base = float(cancha.precio_hora) * duracion_horas

        reglas = self.db.query(ReglaPrecio).filter(ReglaPrecio.is_active == True).all()
        descuento_total = 0.0
        desglose = []

        for regla in reglas:
            aplicable = False
            if regla.tipo == "horario_pico" and regla.hora_inicio and regla.hora_fin:
                if hora_inicio >= regla.hora_inicio and hora_fin <= regla.hora_fin:
                    aplicable = True
            elif regla.tipo == "descuento_socio" and data.es_socio and regla.es_socio:
                aplicable = True

            if aplicable:
                desc = precio_base * float(regla.valor) / 100
                descuento_total += desc
                desglose.append({
                    "regla": regla.nombre,
                    "tipo": regla.tipo,
                    "descuento": round(desc, 2),
                })

        precio_final = max(0, precio_base - descuento_total)

        return {
            "status": 200,
            "precio_base": round(precio_base, 2),
            "descuento": round(descuento_total, 2),
            "precio_final": round(precio_final, 2),
            "desglose": desglose,
        }

    def _format_regla(self, regla: ReglaPrecio) -> dict:
        return {
            "id": regla.id,
            "nombre": regla.nombre,
            "tipo": regla.tipo,
            "valor": float(regla.valor),
            "hora_inicio": regla.hora_inicio.strftime("%H:%M") if regla.hora_inicio else None,
            "hora_fin": regla.hora_fin.strftime("%H:%M") if regla.hora_fin else None,
            "es_socio": regla.es_socio,
            "is_active": regla.is_active,
        }
