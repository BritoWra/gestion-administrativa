from flask import Flask, jsonify
from flask_cors import CORS
import os
from logger import logger as log
import database

# Importar Blueprints
from routes.empleados_bp import empleados_bp
from routes.cargos_bp import cargos_bp

# Configuración Flask
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

# Inicializar la base de datos
database.init_app(app)

@app.route('/')
def index():
    log.info('Acceso a ruta raíz')
    return jsonify({"message": "Bienvenido a la API de Gestión Administrativa"})

# Registrar los blueprints
app.register_blueprint(empleados_bp)
app.register_blueprint(cargos_bp)
log.info("Blueprints registrados")

if __name__ == '__main__':
    log.info("Iniciando servidor Flask en modo DEBUG")
    app.run(debug=True, port=5001) # Ejecuta el servidor de desarrollo Flask en el puerto 5001
