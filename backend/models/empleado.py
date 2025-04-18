from database import db
from datetime import datetime

class Empleado(db.Model):
    """Modelo para la tabla 'empleados'."""
    __tablename__ = 'empleados'
    
    cedula = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    cargo = db.Column(db.String(100))
    fecha_nacimiento = db.Column(db.Date)
    sexo = db.Column(db.String(1))
    fecha_ingreso = db.Column(db.Date)
    telefono = db.Column(db.Integer)
    correo = db.Column(db.String(100), unique=True)
    estatus = db.Column(db.Integer, default=1)
    
    def __init__(self, cedula, nombre, cargo=None, fecha_nacimiento=None, 
                 sexo=None, fecha_ingreso=None, telefono=None, correo=None):
        self.cedula = cedula
        self.nombre = nombre
        self.cargo = cargo
        self.fecha_nacimiento = fecha_nacimiento
        self.sexo = sexo
        self.fecha_ingreso = fecha_ingreso
        self.telefono = telefono
        self.correo = correo
        self.estatus = 1
    
    def to_dict(self):
        """Convierte el modelo a un diccionario para serialización JSON."""
        return {
            'cedula': self.cedula,
            'nombre': self.nombre,
            'cargo': self.cargo,
            'fecha_nacimiento': self.fecha_nacimiento.strftime('%Y-%m-%d') if self.fecha_nacimiento else None,
            'sexo': self.sexo,
            'fecha_ingreso': self.fecha_ingreso.strftime('%Y-%m-%d') if self.fecha_ingreso else None,
            'telefono': self.telefono,
            'correo': self.correo,
            'estatus': self.estatus
        } 