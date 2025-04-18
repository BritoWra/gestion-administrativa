# Importar todos los modelos
from models.empleado import Empleado
from models.cargo import Cargo

# Exportar todos los modelos para que puedan ser importados desde 'models'
__all__ = ['Empleado', 'Cargo'] 