from flask import Flask, jsonify, request, g
from flask_cors import CORS
import os
from logger import logger as log
from utils.db_utils import get_db
from init_db import init_db

# Import Blueprints
from routes.empleados_bp import empleados_bp

# Configuración Flask
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

# Inicializar la base de datos
db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'gestionAdministrativa.db')

@app.route('/')
def index():
    log.info('Acceso a ruta raíz')
    return jsonify({"message": "Bienvenido a la API de Gestión Administrativa"})

# Registrar los blueprints
app.register_blueprint(empleados_bp)
log.info("Blueprints registrados")

# Hook para cerrar la conexión a la BD al finalizar la petición
@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()
        log.debug("Conexión a la base de datos cerrada")

if __name__ == '__main__':
    # Asegurar que la base de datos esté lista ANTES de iniciar el servidor
    try:
        log.info("Inicializando base de datos")
        init_db()
        print("Base de datos inicializada")
    except Exception as e:
        log.critical(f"Fallo al inicializar la base de datos: {e}", exc_info=True)
        exit(1) # Salir si la BD no puede ser inicializada
        
    log.info("Iniciando servidor Flask en modo DEBUG")
    app.run(debug=True, port=5001) # Runs the Flask development server on port 5001
