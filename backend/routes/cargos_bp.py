from flask import Blueprint, request, jsonify
from services.cargo_service import (
    get_all_active_cargos_service, 
    add_cargo_service, 
    update_cargo_service, 
    delete_cargo_logico_service
)
from logger import logger as log

# Crear Blueprint
cargos_bp = Blueprint('cargos_bp', __name__, url_prefix='/api')

# --- Rutas API para Cargos --- 

# GET /api/get/cargos - Obtener todos los cargos activos
@cargos_bp.route('/get/cargos', methods=['GET'])
def get_all_cargos():
    """Obtiene todos los cargos activos."""
    log.debug("GET /get/cargos")
    try:
        cargos_list = get_all_active_cargos_service()
        log.debug(f"Cargos obtenidos del servicio: {len(cargos_list)} registros")
        return jsonify(cargos_list), 200
    except Exception as e:
        log.error(f"Error inesperado al obtener cargos: {e}", exc_info=True)
        return jsonify({"error": "Error interno del servidor al obtener cargos", "details": str(e)}), 500

# POST /api/add/cargos - Crear un nuevo cargo
@cargos_bp.route('/add/cargos', methods=['POST'])
def add_cargo():
    """Añade un nuevo cargo."""
    log.debug("POST /api/add/cargos")
    data = request.get_json()
    log.debug(f"Datos recibidos para añadir cargo: {data}")

    # Validación básica de datos requeridos
    if not data or not data.get('nombre') or not isinstance(data.get('nivel'), (int, float)) or not data.get('sueldo_base'):
        log.warning("Intento de añadir cargo con datos faltantes")
        return jsonify({"error": "Datos incompletos", "message": "El Nombre, Nivel y Sueldo Base son campos obligatorios."}), 400

    try:
        # Asegurar que nivel y sueldo_base sean numéricos
        data['nivel'] = int(data['nivel'])
        data['sueldo_base'] = float(data['sueldo_base'])
        
        nuevo_cargo = add_cargo_service(data)
        if nuevo_cargo:
            log.info(f"Cargo añadido: {nuevo_cargo.get('nombre')} (nivel {nuevo_cargo.get('nivel')})")
            return jsonify(nuevo_cargo), 201 # Código 201 para creación exitosa
        else:
            log.error("add_cargo_service retornó None")
            # Esto podría indicar un error lógico no capturado como excepción
            return jsonify({"error": "Error al crear cargo", "message": "El servicio no pudo completar la creación."}), 500
    except ValueError as e:
        log.warning(f"Error de validación al añadir cargo: {e}")
        return jsonify({"error": "Conflicto de datos", "message": str(e)}), 409 # Código 409 para conflicto (ej. duplicado)
    except Exception as e:
        log.error(f"Error al añadir cargo: {e}", exc_info=True)
        return jsonify({"error": "Error interno del servidor al añadir cargo", "details": str(e)}), 500

# PUT /api/put/cargos/<id> - Actualizar un cargo existente
@cargos_bp.route('/put/cargos/<int:id>', methods=['PUT'])
def update_cargo(id):
    """Actualiza un cargo existente por su ID."""
    log.debug(f"PUT /put/cargos/{id}")
    data = request.get_json()
    log.debug(f"Datos recibidos para actualizar cargo {id}: {data}")

    if not data:
        log.warning(f"Actualización de cargo {id} sin datos")
        return jsonify({"error": "Datos incompletos", "message": "No se proporcionaron datos para la actualización."}), 400

    try:
        # Convertir datos numéricos si están presentes
        if 'nivel' in data:
            data['nivel'] = int(data['nivel'])
        if 'sueldo_base' in data:
            data['sueldo_base'] = float(data['sueldo_base'])
            
        cargo_actualizado = update_cargo_service(id, data)
        if cargo_actualizado:
            log.info(f"Cargo {id} actualizado: {cargo_actualizado.get('nombre')}")
            return jsonify(cargo_actualizado), 200
        else:
            log.warning(f"Cargo {id} no encontrado/inactivo")
            return jsonify({"error": "No encontrado", "message": f"Cargo con ID {id} no encontrado o está inactivo."}), 404
    except ValueError as e:
        log.warning(f"Error de validación al actualizar cargo {id}: {e}")
        return jsonify({"error": "Conflicto de datos", "message": str(e)}), 409 # Conflicto
    except Exception as e:
        log.error(f"Error al actualizar cargo {id}: {e}", exc_info=True)
        return jsonify({"error": "Error interno del servidor al actualizar cargo", "details": str(e)}), 500

# DELETE /api/delete/cargos/<id> - Eliminar lógicamente un cargo (establecer estatus = 0)
@cargos_bp.route('/delete/cargos/<int:id>', methods=['DELETE'])
def delete_cargo_logico(id):
    """Elimina lógicamente un cargo por su ID."""
    log.debug(f"DELETE /delete/cargos/{id}")
    try:
        success = delete_cargo_logico_service(id)
        if success:
            log.info(f"Cargo {id} eliminado")
            return jsonify({"message": f"Cargo con ID {id} eliminado lógicamente."}), 200
        else:
            log.warning(f"Cargo {id} no encontrado/ya inactivo")
            return jsonify({"error": "No encontrado", "message": f"Cargo con ID {id} no encontrado o ya estaba inactivo."}), 404
    except Exception as e:
        log.error(f"Error al eliminar cargo {id}: {e}", exc_info=True)
        return jsonify({"error": "Error interno del servidor al eliminar cargo", "details": str(e)}), 500 