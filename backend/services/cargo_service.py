from logger import logger as log
from database import db
from models import Cargo
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

def get_all_active_cargos_service():
    """Obtiene todos los cargos activos de la base de datos."""
    try:
        cargos = Cargo.query.filter_by(estatus=1).order_by(Cargo.nivel).all()
        return [cargo.to_dict() for cargo in cargos]
    except SQLAlchemyError as e:
        log.error(f"Error de base de datos en get_all_active_cargos_service: {e}")
        raise

def add_cargo_service(data):
    """Añade un nuevo cargo a la base de datos."""
    try:
        # Crear nuevo cargo
        nuevo_cargo = Cargo(
            nombre=data['nombre'],
            nivel=data['nivel'],
            sueldo_base=data['sueldo_base']
        )
        
        # Añadir a la sesión y guardar
        db.session.add(nuevo_cargo)
        db.session.commit()
        
        # Convertir a diccionario para la respuesta
        return nuevo_cargo.to_dict()
    except IntegrityError as e:
        db.session.rollback()
        log.error(f"Error de integridad en add_cargo_service: {e}")
        raise ValueError("Es posible que ya exista un cargo con ese nivel")
    except SQLAlchemyError as e:
        db.session.rollback()
        log.error(f"Error de base de datos en add_cargo_service: {e}")
        raise

def update_cargo_service(id, data):
    """Actualiza un cargo activo existente."""
    try:
        # Buscar cargo por ID y estatus activo
        cargo = Cargo.query.filter_by(id=id, estatus=1).first()
        if not cargo:
            return None  # Cargo no encontrado o inactivo
        
        # Actualizar campos si están presentes
        if 'nombre' in data:
            cargo.nombre = data['nombre']
        if 'nivel' in data:
            cargo.nivel = data['nivel']
        if 'sueldo_base' in data:
            cargo.sueldo_base = data['sueldo_base']
        
        # Guardar cambios
        db.session.commit()
        
        return cargo.to_dict()
    except IntegrityError as e:
        db.session.rollback()
        log.error(f"Error de integridad en update_cargo_service: {e}")
        raise ValueError("Falló la actualización, es posible que ya exista un cargo con ese nivel")
    except SQLAlchemyError as e:
        db.session.rollback()
        log.error(f"Error de base de datos en update_cargo_service: {e}")
        raise

def delete_cargo_logico_service(id):
    """Elimina lógicamente un cargo estableciendo estatus a 0."""
    try:
        # Buscar cargo por ID y estatus activo
        cargo = Cargo.query.filter_by(id=id, estatus=1).first()
        if not cargo:
            return False  # Cargo no encontrado o ya inactivo
        
        # Cambiar estatus a inactivo
        cargo.estatus = 0
        db.session.commit()
        
        return True
    except SQLAlchemyError as e:
        db.session.rollback()
        log.error(f"Error de base de datos en delete_cargo_logico_service: {e}")
        raise 