import sqlite3
import os
from logger import logger as log

def init_db():
    """Inicializa la base de datos y crea las tablas necesarias."""
    db_path = os.path.join(os.path.dirname(__file__), 'gestionAdministrativa.db')
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Crear tabla empleados
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS empleados (
            cedula INTEGER PRIMARY KEY,
            nombre TEXT NOT NULL,
            cargo TEXT,
            fecha_nacimiento TIMESTAMP,
            sexo CHAR(1),
            fecha_ingreso TIMESTAMP,
            telefono INTEGER,
            correo TEXT,
            estatus INTEGER DEFAULT 1
        )
        """)
        
        # Crear tabla cargos
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS cargos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nivel INTEGER NOT NULL,
            sueldo_base REAL NOT NULL,
            estatus INTEGER DEFAULT 1
        )
        """)
        
        conn.commit()
        log.info("Tablas creadas exitosamente")
    except Exception as e:
        log.error(f"Error al inicializar la base de datos: {e}", exc_info=True)
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    init_db()
