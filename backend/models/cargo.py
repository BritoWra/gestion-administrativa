from database import db

class Cargo(db.Model):
    """Modelo para la tabla 'cargos'."""
    __tablename__ = 'cargos'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False)
    nivel = db.Column(db.Integer, nullable=False)
    sueldo_base = db.Column(db.Float, nullable=False)
    estatus = db.Column(db.Integer, default=1)
    
    def __init__(self, nombre, nivel, sueldo_base):
        self.nombre = nombre
        self.nivel = nivel
        self.sueldo_base = sueldo_base
        self.estatus = 1
    
    def to_dict(self):
        """Convierte el modelo a un diccionario para serialización JSON."""
        return {
            'id': self.id,
            'nombre': self.nombre,
            'nivel': self.nivel,
            'sueldo_base': self.sueldo_base,
            'estatus': self.estatus
        } 