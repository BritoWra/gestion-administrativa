# Sistema de Gestión Administrativa

Un sistema web para la gestión administrativa, enfocado en el manejo de recursos humanos, cargos y pagos en pequeñas y medianas empresas.

## Descripción

Este proyecto implementa un sistema de gestión administrativa con arquitectura cliente-servidor. Permite administrar información de empleados, cargos y realizar seguimiento de pagos a través de una interfaz web moderna y fácil de usar.

## Características

### Gestión de Empleados
- Registro completo de datos personales
- Visualización con filtrado y ordenamiento multiatributo
- Edición de información
- Eliminación lógica (mantiene historial)

### Gestión de Cargos
- Configuración de niveles salariales
- Administración de sueldos base
- Asignación a empleados

### Gestión de Pagos
- Registro de pagos y nómina
- Historial de transacciones

## Tecnologías Utilizadas

### Backend
- Python 3.x
- Flask (Framework web)
- SQLite (Base de datos)
- Blueprint (Estructura modular)

### Frontend
- React
- TypeScript
- React Router (Navegación)
- Bulma CSS (Estilos)
- React Icons

## Instalación y Configuración

### Requisitos Previos
- Python 3.8 o superior
- Node.js 14.x o superior
- npm o pnpm

### Configuración del Backend

1. Navegar al directorio del backend:
```bash
cd backend
```

2. Crear y activar un entorno virtual:
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

3. Instalar dependencias:
```bash
pip install -r requirements.txt
```

4. Inicializar la base de datos:
```bash
python init_db.py
```

5. Iniciar el servidor de desarrollo:
```bash
python app.py
```

El servidor backend estará disponible en: http://localhost:5001

### Configuración del Frontend

1. Navegar al directorio del frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install  # o pnpm install
```

3. Iniciar el servidor de desarrollo:
```bash
npm run dev  # o pnpm dev
```

El servidor frontend estará disponible en: http://localhost:5173

## Uso

1. Acceder a la aplicación en el navegador: http://localhost:5173
2. Iniciar sesión con las credenciales por defecto:
   - Usuario: admin
   - Contraseña: admin123
3. Utilizar el menú de navegación para acceder a los diferentes módulos:
   - Dashboard
   - Gestión de Empleados
   - Gestión de Cargos
   - Gestión de Pagos

## Estructura del Proyecto

```
gestion-administrativa/
├── backend/
│   ├── routes/           # Endpoints de la API
│   ├── services/         # Lógica de negocio
│   ├── utils/            # Utilidades
│   ├── logs/             # Registros del sistema
│   ├── app.py            # Punto de entrada del backend
│   ├── init_db.py        # Inicialización de la base de datos
│   ├── logger.py         # Configuración de logs
│   └── requirements.txt  # Dependencias del backend
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── assets/       # Recursos estáticos
│   │   ├── App.tsx       # Componente principal
│   │   └── main.tsx      # Punto de entrada
│   ├── public/           # Archivos públicos
│   └── package.json      # Dependencias del frontend
│
└── README.md             # Este archivo
```

## Contribución

Si deseas contribuir a este proyecto, por favor:

1. Haz un fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/nueva-caracteristica`)
3. Haz commit de tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Haz push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo [Licencia MIT](https://opensource.org/licenses/MIT)
