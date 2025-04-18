import sqlite3
import os
from logger import logger as log
from flask import g

def get_db():
    """Obtiene una conexión a la base de datos, creándola si no existe."""
    # Verificar si ya hay una conexión activa en el contexto de la aplicación
    if hasattr(g, '_database'):
        return g._database

    db_path = os.path.join(os.path.dirname(__file__), '..', 'gestionAdministrativa.db')
    
    # Verificar si la base de datos existe
    if not os.path.exists(db_path):
        from init_db import init_db
        init_db()
    
    # Aumentar el timeout y configurar para que espere si la BD está bloqueada
    conn = sqlite3.connect(db_path, timeout=30.0, isolation_level=None)
    conn.execute("PRAGMA journal_mode=WAL")  # Usar Write-Ahead Logging para mejor concurrencia
    conn.row_factory = sqlite3.Row  # Para obtener resultados como diccionarios
    
    # Almacenar la conexión en el contexto de la aplicación
    g._database = conn
    return conn

def close_db():
    """Cierra la conexión a la base de datos si está abierta."""
    if hasattr(g, '_database'):
        g._database.close()
        log.debug("Conexión a la base de datos cerrada explícitamente")
