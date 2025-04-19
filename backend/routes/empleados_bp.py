from flask import Blueprint, request, jsonify
from services.empleado_service import (
    get_all_active_empleados_service, 
    add_empleado_service, 
    update_empleado_service, 
    delete_empleado_logico_service
)
from logger import logger as log

# Crear Blueprint
empleados_bp = Blueprint('empleados_bp', __name__, url_prefix='/api')

# --- Rutas API para Empleados --- 

# GET /api/get/empleados - Obtener todos los empleados activos
@empleados_bp.route('/get/empleados', methods=['GET'])
def get_all_empleados():
    """Obtiene todos los empleados activos."""
    log.debug("GET /get/empleados")
    try:
        empleados_list = get_all_active_empleados_service()
        log.debug(f"Empleados obtenidos del servicio: {len(empleados_list)} registros")
        return jsonify(empleados_list), 200
    except Exception as e:
        log.error(f"Error inesperado al obtener empleados: {e}", exc_info=True)
        return jsonify({"error": "Error interno del servidor al obtener empleados", "details": str(e)}), 500

# POST /api/add/empleados - Crear un nuevo empleado
@empleados_bp.route('/add/empleados', methods=['POST'])
def add_empleado():
    """Añade un nuevo empleado."""
    log.debug("POST /api/add/empleados")
    data = request.get_json()
    log.debug(f"Datos recibidos para añadir empleado: {data}")

    # Validación básica de datos requeridos
    if not data or not data.get('cedula') or not data.get('nombre'):
        log.warning("Intento de añadir empleado con datos faltantes")
        return jsonify({"error": "Datos incompletos", "message": "La Cédula y el Nombre son campos obligatorios."}), 400

    try:
        nuevo_empleado = add_empleado_service(data)
        if nuevo_empleado:
            log.info(f"Empleado añadido: {nuevo_empleado.get('cedula')}")
            return jsonify(nuevo_empleado), 201 # Código 201 para creación exitosa
        else:
            log.error("add_empleado_service retornó None")
            # Esto podría indicar un error lógico no capturado como excepción
            return jsonify({"error": "Error al crear empleado", "message": "El servicio no pudo completar la creación."}), 500
    except ValueError as e:
        log.warning(f"Error de validación al añadir empleado: {e}")
        return jsonify({"error": "Conflicto de datos", "message": str(e)}), 409 # Código 409 para conflicto (ej. duplicado)
    except Exception as e:
        log.error(f"Error al añadir empleado: {e}", exc_info=True)
        return jsonify({"error": "Error interno del servidor al añadir empleado", "details": str(e)}), 500

# PUT /api/put/empleados/<cedula> - Actualizar un empleado existente
@empleados_bp.route('/put/empleados/<int:cedula>', methods=['PUT'])
def update_empleado(cedula):
    """Actualiza un empleado existente por su cédula."""
    log.debug(f"PUT /put/empleados/{cedula}")
    data = request.get_json()
    log.debug(f"Datos recibidos para actualizar empleado {cedula}: {data}")

    if not data:
        log.warning(f"Actualización de {cedula} sin datos")
        return jsonify({"error": "Datos incompletos", "message": "No se proporcionaron datos para la actualización."}), 400

    try:
        empleado_actualizado = update_empleado_service(cedula, data)
        if empleado_actualizado:
            log.info(f"Empleado {cedula} actualizado")
            return jsonify(empleado_actualizado), 200
        else:
            log.warning(f"Empleado {cedula} no encontrado/inactivo")
            return jsonify({"error": "No encontrado", "message": f"Empleado con cédula {cedula} no encontrado o está inactivo."}), 404
    except ValueError as e:
        log.warning(f"Error de validación al actualizar {cedula}: {e}")
        return jsonify({"error": "Conflicto de datos", "message": str(e)}), 409 # Conflicto
    except Exception as e:
        log.error(f"Error al actualizar {cedula}: {e}", exc_info=True)
        return jsonify({"error": "Error interno del servidor al actualizar empleado", "details": str(e)}), 500

# DELETE /api/delete/empleados/<cedula> - Eliminar lógicamente un empleado (establecer estatus = 0)
@empleados_bp.route('/delete/empleados/<int:cedula>', methods=['DELETE'])
def delete_empleado_logico(cedula):
    """Elimina lógicamente un empleado por su cédula."""
    log.debug(f"DELETE /delete/empleados/{cedula}")
    try:
        success = delete_empleado_logico_service(cedula)
        if success:
            log.info(f"Empleado {cedula} eliminado")
            return jsonify({"message": f"Empleado con cédula {cedula} eliminado lógicamente."}), 200
        else:
            log.warning(f"Empleado {cedula} no encontrado/ya inactivo")
            return jsonify({"error": "No encontrado", "message": f"Empleado con cédula {cedula} no encontrado o ya estaba inactivo."}), 404
    except Exception as e:
        log.error(f"Error al eliminar {cedula}: {e}", exc_info=True)
        return jsonify({"error": "Error interno del servidor al eliminar empleado", "details": str(e)}), 500
