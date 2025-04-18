from flask_sqlalchemy import SQLAlchemy
import os
from logger import logger as log

# Crear la instancia de SQLAlchemy
db = SQLAlchemy()

def init_app(app):
    """
    Inicializa la instancia de SQLAlchemy con la aplicación Flask.
    Configura la base de datos y registra los eventos.
    """
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'gestionAdministrativa.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Inicializar la aplicación con SQLAlchemy
    db.init_app(app)
    
    # Registrar evento para crear tablas
    with app.app_context():
        try:
            # Importar los modelos para que SQLAlchemy los conozca
            import models
            
            # Crear todas las tablas
            db.create_all()
            log.info("Base de datos inicializada correctamente con SQLAlchemy")
        except Exception as e:
            log.error(f"Error al inicializar la base de datos: {e}", exc_info=True)
            raise
    
    log.info("Configuración de SQLAlchemy completada") 