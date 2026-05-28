"""
Migración SQLite: agrega columnas nuevas y crea tablas faltantes.
Ejecutar con: python -m API.migrate_db
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "upgi.db")


def column_exists(cursor, table, column):
    cursor.execute(f"PRAGMA table_info({table})")
    columns = [row[1] for row in cursor.fetchall()]
    return column in columns


def table_exists(cursor, table):
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,))
    return cursor.fetchone() is not None


def migrate():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # --- Columnas nuevas en equipos ---
    if not column_exists(c, "equipos", "maintenance_status"):
        c.execute("ALTER TABLE equipos ADD COLUMN maintenance_status VARCHAR(20) NOT NULL DEFAULT 'Disponible'")
        print("  + equipos.maintenance_status")

    if not column_exists(c, "equipos", "maintenance_notes"):
        c.execute("ALTER TABLE equipos ADD COLUMN maintenance_notes TEXT")
        print("  + equipos.maintenance_notes")

    # --- Columnas nuevas en reservas ---
    if not column_exists(c, "reservas", "serie_id"):
        c.execute("ALTER TABLE reservas ADD COLUMN serie_id INTEGER REFERENCES series_reserva(id)")
        print("  + reservas.serie_id")

    if not column_exists(c, "reservas", "precio_base"):
        c.execute("ALTER TABLE reservas ADD COLUMN precio_base DECIMAL(10,2)")
        print("  + reservas.precio_base")

    if not column_exists(c, "reservas", "descuento_monto"):
        c.execute("ALTER TABLE reservas ADD COLUMN descuento_monto DECIMAL(10,2) DEFAULT 0")
        print("  + reservas.descuento_monto")

    # --- Tablas nuevas ---
    if not table_exists(c, "comunicaciones_reserva"):
        c.execute("""
            CREATE TABLE comunicaciones_reserva (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                reserva_id INTEGER NOT NULL REFERENCES reservas(id),
                autor_usuario_id INTEGER NOT NULL REFERENCES users(id),
                autor_nombre VARCHAR(200) NOT NULL,
                contenido TEXT NOT NULL,
                tipo VARCHAR(20) NOT NULL DEFAULT 'NOTE',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("  + tabla comunicaciones_reserva")

    if not table_exists(c, "reglas_precio"):
        c.execute("""
            CREATE TABLE reglas_precio (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre VARCHAR(100) NOT NULL,
                tipo VARCHAR(30) NOT NULL,
                valor DECIMAL(10,2) NOT NULL,
                hora_inicio TIME,
                hora_fin TIME,
                es_socio BOOLEAN DEFAULT 0,
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("  + tabla reglas_precio")

    if not table_exists(c, "lista_espera"):
        c.execute("""
            CREATE TABLE lista_espera (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cancha_id INTEGER NOT NULL REFERENCES canchas(id),
                usuario_id INTEGER REFERENCES users(id),
                cliente_nombre VARCHAR(200) NOT NULL,
                cliente_email VARCHAR(200),
                cliente_telefono VARCHAR(50),
                fecha DATE NOT NULL,
                hora_inicio TIME NOT NULL,
                hora_fin TIME NOT NULL,
                posicion INTEGER NOT NULL DEFAULT 1,
                estado VARCHAR(20) NOT NULL DEFAULT 'ESPERANDO',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                promoted_at DATETIME
            )
        """)
        print("  + tabla lista_espera")

    if not table_exists(c, "series_reserva"):
        c.execute("""
            CREATE TABLE series_reserva (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL REFERENCES users(id),
                cancha_id INTEGER NOT NULL REFERENCES canchas(id),
                fecha_inicio DATE NOT NULL,
                fecha_fin DATE,
                hora_inicio TIME NOT NULL,
                hora_fin TIME NOT NULL,
                jugadores INTEGER NOT NULL,
                frecuencia VARCHAR(20) NOT NULL,
                intervalo INTEGER NOT NULL DEFAULT 1,
                dias_semana VARCHAR(50),
                observaciones TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("  + tabla series_reserva")

    conn.commit()
    conn.close()
    print("Migración completada.")


if __name__ == "__main__":
    print(f"Migrando DB: {DB_PATH}")
    migrate()
