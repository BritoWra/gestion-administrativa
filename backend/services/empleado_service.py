from datetime import datetime
from logger import logger as log
from database import db
from models import Empleado
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

def calcular_edad(fecha_nacimiento):
    if not fecha_nacimiento:
        return None
    hoy = datetime.now()
    edad = hoy.year - fecha_nacimiento.year
    if (hoy.month, hoy.day) < (fecha_nacimiento.month, fecha_nacimiento.day):
        edad -= 1
    return edad

def get_all_active_empleados_service():
    """Obtiene todos los empleados activos de la base de datos."""
    try:
        empleados = Empleado.query.filter_by(estatus=1).order_by(Empleado.nombre).all()
        return [empleado.to_dict() for empleado in empleados]
    except SQLAlchemyError as e:
        log.error(f"Error de base de datos en get_all_active_empleados_service: {e}")
        raise

def add_empleado_service(data):
    """Añade un nuevo empleado a la base de datos."""
    try:
        # Convertir fechas de string a objetos Date si existen
        fecha_nacimiento = None
        if data.get('fecha_nacimiento'):
            fecha_nacimiento = datetime.strptime(data['fecha_nacimiento'], '%Y-%m-%d').date()
            
        fecha_ingreso = None
        if data.get('fecha_ingreso'):
            fecha_ingreso = datetime.strptime(data['fecha_ingreso'], '%Y-%m-%d').date()
        
        # Crear nuevo empleado
        nuevo_empleado = Empleado(
            cedula=data['cedula'],
            nombre=data['nombre'],
            cargo=data.get('cargo'),
            fecha_nacimiento=fecha_nacimiento,
            sexo=data.get('sexo'),
            fecha_ingreso=fecha_ingreso,
            telefono=data.get('telefono'),
            correo=data.get('correo')
        )
        
        # Añadir a la sesión y guardar
        db.session.add(nuevo_empleado)
        db.session.commit()
        
        # Convertir a diccionario para la respuesta
        return nuevo_empleado.to_dict()
    except IntegrityError as e:
        db.session.rollback()
        log.error(f"Error de integridad en add_empleado_service: {e}")
        raise ValueError("La Cédula o el Correo ya existen")
    except SQLAlchemyError as e:
        db.session.rollback()
        log.error(f"Error de base de datos en add_empleado_service: {e}")
        raise

def update_empleado_service(cedula, data):
    """Actualiza un empleado activo existente."""
    try:
        # Buscar empleado por cédula y estatus activo
        empleado = Empleado.query.filter_by(cedula=cedula, estatus=1).first()
        if not empleado:
            return None  # Empleado no encontrado o inactivo
        
        # Actualizar campos si están presentes
        if 'nombre' in data:
            empleado.nombre = data['nombre']
        if 'cargo' in data:
            empleado.cargo = data['cargo']
        if 'fecha_nacimiento' in data and data['fecha_nacimiento']:
            empleado.fecha_nacimiento = datetime.strptime(data['fecha_nacimiento'], '%Y-%m-%d').date()
        if 'sexo' in data:
            empleado.sexo = data['sexo']
        if 'fecha_ingreso' in data and data['fecha_ingreso']:
            empleado.fecha_ingreso = datetime.strptime(data['fecha_ingreso'], '%Y-%m-%d').date()
        if 'telefono' in data:
            empleado.telefono = data['telefono']
        if 'correo' in data:
            empleado.correo = data['correo']
        
        # Guardar cambios
        db.session.commit()
        
        return empleado.to_dict()
    except IntegrityError as e:
        db.session.rollback()
        log.error(f"Error de integridad en update_empleado_service: {e}")
        raise ValueError("Falló la actualización, posible Correo duplicado")
    except SQLAlchemyError as e:
        db.session.rollback()
        log.error(f"Error de base de datos en update_empleado_service: {e}")
        raise

def delete_empleado_logico_service(cedula):
    """Elimina lógicamente un empleado estableciendo estatus a 0."""
    try:
        # Buscar empleado por cédula y estatus activo
        empleado = Empleado.query.filter_by(cedula=cedula, estatus=1).first()
        if not empleado:
            return False  # Empleado no encontrado o ya inactivo
        
        # Cambiar estatus a inactivo
        empleado.estatus = 0
        db.session.commit()
        
        return True
    except SQLAlchemyError as e:
        db.session.rollback()
        log.error(f"Error de base de datos en delete_empleado_logico_service: {e}")
        raise
