"""
Módulo centralizado de logging para el backend.
Todos los módulos deben importar el logger desde aquí.
"""
import logging
import os
from logging.handlers import RotatingFileHandler

# Configuración básica
def setup_logging():
    # Crear carpeta logs si no existe
    log_dir = os.path.join(os.path.dirname(__file__), 'logs')
    os.makedirs(log_dir, exist_ok=True)
    
    # Formato común
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s [%(filename)s:%(lineno)d]'
    )
    
    # Handler para archivo (todos los niveles)
    log_file = os.path.join(log_dir, 'backend.log')
    file_handler = RotatingFileHandler(
        log_file, maxBytes=10*1024*1024, backupCount=5, encoding='utf-8'
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.DEBUG)
    
    # Configurar logger raíz
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)
    root_logger.addHandler(file_handler)
    
    return root_logger

# Inicializar logging al importar este módulo
logger = setup_logging()
