import sqlite3
import os
from logger import logger as log

def get_db():
    """Obtiene una conexión a la base de datos, creándola si no existe."""
    db_path = os.path.join(os.path.dirname(__file__), '..', 'gestionAdministrativa.db')
    
    # Verificar si la base de datos existe
    if not os.path.exists(db_path):
        from init_db import init_db
        init_db()
        
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row  # Para obtener resultados como diccionarios
    return conn

def close_db():
    """Cierra la conexión a la base de datos si está abierta."""
    if hasattr(g, '_database'):
        g._database.close()
