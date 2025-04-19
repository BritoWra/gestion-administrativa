import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaUserPlus, FaEdit, FaTrash, FaBars, FaSort, FaSortUp, FaSortDown, FaArrowLeft } from 'react-icons/fa';
import Sidebar from './Sidebar';

// Define props including the onLogout function
interface GestionEmpleadosProps {
  onLogout: () => void;
}

// Define Employee type for better type safety
interface Empleado {
  cedula: number;
  nombre: string;  // Ahora contendrá "Nombre Apellido"
  cargo: string;
  edad?: number;
  sexo?: string;
  fecha_ingreso?: string;
  telefono?: number;
  correo?: string;
  fecha_nacimiento?: string;
}

// Define sort direction and criteria structure
type SortDirection = 'asc' | 'desc';
interface SortCriterion<T> {
  key: keyof T;
  direction: SortDirection;
}

// Default empty state for the form
const defaultFormState = {
  cedula: '',
  nombre: '',
  cargo: '',
  fecha_nacimiento: '',
  sexo: '',
  fecha_ingreso: '',
  telefono: '',
  correo: ''
};

// API Base URL (ensure backend server is running on this address)
const API_BASE_URL = 'http://127.0.0.1:5001/api'; // URL base para todas las llamadas API

const GestionEmpleados: React.FC<GestionEmpleadosProps> = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filterColumn, setFilterColumn] = useState<keyof Empleado>('cedula');
  const [filterValue, setFilterValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Empleado | null>(null); // Rastrea si se está editando
  const [formData, setFormData] = useState(defaultFormState); // Estado para los campos del formulario
  const [sortCriteria, setSortCriteria] = useState<SortCriterion<Empleado>[]>([]); // Estado para el ordenamiento (máx 2 criterios)
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Definir columnas para filtrar
  const filterableColumns: { key: keyof Empleado; label: string }[] = [
    { key: 'cedula', label: 'Cédula' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'cargo', label: 'Cargo' },
    { key: 'sexo', label: 'Sexo' },
    { key: 'fecha_ingreso', label: 'Fecha Ingreso' },
  ];

  // Efecto para resetear el formulario cuando el modal se cierra
  useEffect(() => {
    if (!isModalOpen) {
      setFormData(defaultFormState);
      setEditingEmployee(null);
    }
  }, [isModalOpen]);

  // Obtener empleados al montar el componente
  useEffect(() => {
    const fetchEmpleados = async () => {
      setLoading(true);
      setError(null);
      try {
        // Usar el nuevo endpoint GET
        const response = await fetch(`${API_BASE_URL}/get/empleados`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Empleado[] = await response.json();
        setEmpleados(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setError('Error al cargar los datos de los empleados. Por favor, inténtelo de nuevo.'); // Establecer error amigable para el usuario
      } finally {
        setLoading(false);
      }
    };
    fetchEmpleados();
  }, []); // El array de dependencias vacío asegura que esto se ejecute solo una vez al montar

  // Lógica de Filtrado y Ordenamiento
  const filteredAndSortedEmpleados = useMemo(() => {
    let result = [...empleados];

    // Aplicar filtrado
    if (filterValue) {
      result = result.filter(emp =>
        String(emp[filterColumn]).toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    // Aplicar ordenamiento
    if (sortCriteria.length > 0) {
      result.sort((a, b) => {
        for (const criterion of sortCriteria) {
          const { key, direction } = criterion;
          const valA = a[key];
          const valB = b[key];

          let comparison = 0;
          // Basic comparison (can be enhanced for specific types)
          if (typeof valA === 'number' && typeof valB === 'number') {
            comparison = valA - valB;
          } else if (valA && valB) { // Check if values exist before comparing as strings
            // Handle date strings specifically for fecha_ingreso
            if (key === 'fecha_ingreso') {
              comparison = new Date(valA).getTime() - new Date(valB).getTime();
            } else {
              comparison = String(valA).toLowerCase().localeCompare(String(valB).toLowerCase());
            }
          } else if (valA) {
            comparison = 1; // Place items with value after those without
          } else if (valB) {
            comparison = -1; // Place items without value before those with
          }

          if (comparison !== 0) {
            return direction === 'asc' ? comparison : -comparison;
          }
        }
        return 0; // Equal according to all criteria
      });
    }

    return result;
  }, [empleados, filterColumn, filterValue, sortCriteria]);

  // Helper function to format date string (YYYY-MM-DD) for display
  const formatDateForDisplay = (dateString: string | undefined | null): string => {
    if (!dateString) {
      return '-';
    }
    try {
      // Assuming dateString is in 'YYYY-MM-DD' format
      const date = new Date(`${dateString}T00:00:00`); // Add time part to avoid timezone issues
      return date.toLocaleDateString('es-VE'); // Adjust locale as needed ('es-VE' for Venezuela)
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString; // Return original string if formatting fails
    }
  };

  // Manejador para abrir el modal para añadir/editar
  const handleOpenModal = (employee: Empleado | null = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        cedula: String(employee.cedula),
        nombre: employee.nombre,
        cargo: employee.cargo,
        fecha_nacimiento: employee.fecha_nacimiento || '',
        sexo: employee.sexo || '',
        fecha_ingreso: employee.fecha_ingreso || '',
        telefono: employee.telefono !== undefined ? String(employee.telefono) : '',
        correo: employee.correo || ''
      });
    } else {
      setEditingEmployee(null);
      setFormData(defaultFormState);
    }
    setIsModalOpen(true);
  };

  // Manejador para cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Manejador para cambios en los inputs del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Keep all form data as strings for input consistency
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear specific field errors when user types
    if (error) {
      setError(null);
    }
  };

  // Manejador para eliminar un empleado
  const handleDelete = async (cedula: number) => {
    if (!window.confirm(`¿Está seguro de que desea eliminar al empleado con cédula ${cedula}?`)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Usar el nuevo endpoint DELETE
      const response = await fetch(`${API_BASE_URL}/delete/empleados/${cedula}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Falló la eliminación del empleado. Estado: ${response.status}`);
      }

      // Refresh list
      setEmpleados(prev => prev.filter(emp => emp.cedula !== cedula));
    } catch (error: any) {
      console.error("Error deleting employee:", error);
      setError(`Error al eliminar el empleado: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Manejador para el envío del formulario (añadir/editar)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic Frontend Validation (Example)
    const errors: Record<string, string> = {};
    if (!formData.cedula) errors.cedula = 'La cédula es requerida.';
    else if (isNaN(Number(formData.cedula))) errors.cedula = 'La cédula debe ser un número.';
    if (!formData.nombre) errors.nombre = 'El nombre es requerido.';
    if (formData.fecha_ingreso && !/\d{4}-\d{2}-\d{2}/.test(formData.fecha_ingreso)) errors.fecha_ingreso = 'Formato de fecha inválido (YYYY-MM-DD).';

    if (Object.keys(errors).length > 0) {
      setError('Por favor, corrija los errores en el formulario.');
      setLoading(false);
      return;
    }

    // Determine method and URL based on editing or adding
    const method = editingEmployee ? 'PUT' : 'POST';
    const url = editingEmployee
      ? `${API_BASE_URL}/put/empleados/${formData.cedula}` // Usar el nuevo endpoint PUT
      : `${API_BASE_URL}/add/empleados`; // Usar el nuevo endpoint POST

    // Prepare data for API: Parse numeric fields
    const dataToSend = {
      ...formData, // Spread string values
      cedula: Number(formData.cedula), // Convert string to number
      // Only include optional fields if they have a value and are valid numbers
      telefono: formData.telefono ? Number(formData.telefono) : undefined,
      // fecha_ingreso is already a string in YYYY-MM-DD format
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        // Handle non-JSON error responses gracefully
        const errorText = await response.text();
        console.error("API Error Response Text:", errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${response.statusText || 'Error al procesar la solicitud'}`);
      }

      // Assuming success
      // Get the saved/updated employee data
      const savedEmployee = await response.json();

      if (editingEmployee) {
        setEmpleados(prev => prev.map(emp => emp.cedula === savedEmployee.cedula ? savedEmployee : emp));
      } else {
        setEmpleados(prev => [...prev, savedEmployee]);
      }

      // Refresh form and modal state
      setFormData(defaultFormState);
      setIsModalOpen(false);
      setEditingEmployee(null);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setLoading(false);
      // Display a more specific error if possible
      setError(`Error: ${error instanceof Error ? error.message : 'No se pudo completar la operación.'}`);
    }
  };

  // Manejador para cambiar los criterios de ordenamiento
  const handleSort = (key: keyof Empleado) => {
    setSortCriteria(prevCriteria => {
      const existingIndex = prevCriteria.findIndex(c => c.key === key);
      let newCriteria = [...prevCriteria];

      if (existingIndex !== -1) {
        // Column already in sort criteria
        const currentCriterion = newCriteria[existingIndex];
        if (currentCriterion.direction === 'asc') {
          // Change to desc
          newCriteria[existingIndex] = { ...currentCriterion, direction: 'desc' };
        } else {
          // Remove from criteria
          newCriteria.splice(existingIndex, 1);
        }
      } else {
        // Add new column to sort criteria
        if (newCriteria.length < 2) {
          newCriteria.push({ key, direction: 'asc' });
        } else {
          // Replace the second criterion if max is reached
          newCriteria[1] = { key, direction: 'asc' };
        }
      }
      return newCriteria;
    });
  };

  // Helper function to get sort icon for a column header
  const getSortIcon = (key: keyof Empleado) => {
    const criterion = sortCriteria.find(c => c.key === key);
    if (!criterion) return <FaSort />; // Default icon
    return criterion.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  // Función para calcular edad desde fecha de nacimiento
  const calcularEdad = (fechaNacimiento: string): number => {
    if (!fechaNacimiento) return 0;
    
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  };

  return (
    <section className="section" style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Top Bar Buttons */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 50 }}>
        <button 
          className="button is-success is-rounded" 
          onClick={() => window.history.back()}
        >
          <span className="icon">
            <FaArrowLeft />
          </span>
        </button>
      </div>
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 50 }}>
        <button className="button is-primary is-rounded" onClick={() => setIsSidebarOpen(true)}>
          <span className="icon">
            <FaBars />
          </span>
        </button>
      </div>

      {/* Loading Indicator */}
      {loading && <div className="loading-indicator">Cargando...</div>}

      {/* Error Message Display */}
      {error && <div className="error-message-global">Error: {error}</div>}

      {/* Main Content */}
      <div className="container mt-6 pt-5">
        {/* Title with Add Button */}
        <div className="is-flex is-justify-content-space-between is-align-items-center mb-5">
          <h1 className="title is-2">Gestión de Empleados</h1>
          <button className="button is-success is-rounded" onClick={() => handleOpenModal()} title="Añadir Empleado">
            <span className="icon">
              <FaUserPlus />
            </span>
            <span>Añadir</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="columns is-vcentered mb-4">
          <div className="column is-narrow">
            <label className="label" htmlFor="filter-column">Filtrar por:</label>
            <div className="control has-icons-left">
              <div className="select">
                <select 
                  id="filter-column" 
                  value={filterColumn}
                  onChange={(e) => setFilterColumn(e.target.value as keyof Empleado)}
                >
                  {filterableColumns.map(col => (
                    <option key={col.key} value={col.key}>{col.label}</option>
                  ))}
                </select>
              </div>
              <div className="icon is-small is-left">
                {/* <i className="fas fa-filter"></i> */}
              </div>
            </div>
          </div>
          <div className="column">
            <label className="label" htmlFor="filter-value">Valor:</label>
            <div className="control">
              <input 
                id="filter-value"
                className="input" 
                type="text" 
                placeholder="Escribe para filtrar..." 
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="table is-fullwidth is-striped is-hoverable">
            <thead>
              <tr>
                {/* Make headers clickable for sorting */}
                <th onClick={() => handleSort('cedula')} style={{ cursor: 'pointer' }}>
                  Cédula <span className="icon is-small">{getSortIcon('cedula')}</span>
                </th>
                <th onClick={() => handleSort('nombre')} style={{ cursor: 'pointer' }}>
                  Nombre <span className="icon is-small">{getSortIcon('nombre')}</span>
                </th>
                <th onClick={() => handleSort('cargo')} style={{ cursor: 'pointer' }}>
                  Cargo <span className="icon is-small">{getSortIcon('cargo')}</span>
                </th>
                <th onClick={() => handleSort('edad')} style={{ cursor: 'pointer' }}>
                  Edad <span className="icon is-small">{getSortIcon('edad')}</span>
                </th>
                <th onClick={() => handleSort('sexo')} style={{ cursor: 'pointer' }}>
                  Sexo <span className="icon is-small">{getSortIcon('sexo')}</span>
                </th>
                <th onClick={() => handleSort('fecha_ingreso')} style={{ cursor: 'pointer' }}>
                  Fecha Ingreso <span className="icon is-small">{getSortIcon('fecha_ingreso')}</span>
                </th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedEmpleados.length > 0 ? (
                filteredAndSortedEmpleados.map((emp) => (
                  <tr key={emp.cedula}>
                    <td>{emp.cedula}</td>
                    <td>{emp.nombre}</td>
                    <td>{emp.cargo}</td>
                    <td>{emp.fecha_nacimiento ? calcularEdad(emp.fecha_nacimiento) : '-'}</td>
                    <td>{emp.sexo || '-'}</td>
                    <td>{formatDateForDisplay(emp.fecha_ingreso)}</td>
                    <td>
                      <button 
                        className="button is-small is-info mr-1" 
                        title="Editar"
                        onClick={() => handleOpenModal(emp)} >
                        <span className="icon"><FaEdit /></span>
                      </button>
                      <button 
                        className="button is-small is-danger" 
                        title="Eliminar"
                        onClick={() => handleDelete(emp.cedula)}>
                         <span className="icon"><FaTrash /></span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="has-text-centered">No se encontraron empleados que coincidan con los criterios de búsqueda o no hay empleados registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Employee Modal */}
      <div className={`modal ${isModalOpen ? 'is-active' : ''}`}>
        <div className="modal-background" onClick={handleCloseModal}></div>
        <div className="modal-card">
          <header className="modal-card-head">
            {/* Dynamic title */}
            <p className="modal-card-title">{editingEmployee ? 'Editar Empleado' : 'Añadir Nuevo Empleado'}</p>
            <button className="delete" aria-label="close" onClick={handleCloseModal}></button>
          </header>
          <section className="modal-card-body">
            {/* Use handleFormSubmit */}
            <form id="employee-form" onSubmit={handleFormSubmit}>
              {/* Cedula - Disable if editing */}
              <div className="field">
                <label className="label">Cédula</label>
                <div className="control">
                  <input 
                    className="input" 
                    type="text" 
                    name="cedula" 
                    placeholder="12345678" 
                    value={formData.cedula || ''} 
                    onChange={handleInputChange} 
                    required 
                    disabled={!!editingEmployee} // Disable cedula field when editing
                  />
                </div>
              </div>
              {/* Nombre */} 
              <div className="field">
                <label className="label">Nombre</label>
                <div className="control">
                  <input 
                    className="input" 
                    type="text" 
                    name="nombre" 
                    placeholder="Juan Perez" 
                    value={formData.nombre || ''} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
              </div>
              {/* Cargo */} 
               <div className="field">
                <label className="label">Cargo</label>
                <div className="control">
                  <input 
                    className="input" 
                    type="text" 
                    name="cargo" 
                    placeholder="Desarrollador" 
                    value={formData.cargo || ''} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
              </div>
               {/* Fecha de Nacimiento */}
              <div className="field">
                <label className="label">Fecha de Nacimiento</label>
                <div className="control">
                  <input 
                    className="input" 
                    type="date" 
                    name="fecha_nacimiento" 
                    value={formData.fecha_nacimiento || ''} 
                    onChange={handleInputChange} 
                    required
                  />
                </div>
              </div>
              {/* Sexo */}
              <div className="field">
                <label className="label">Sexo</label>
                <div className="control">
                  <input 
                    className="input" 
                    type="text" 
                    name="sexo" 
                    placeholder="Masculino/Femenino" 
                    value={formData.sexo || ''} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
              {/* Fecha de Ingreso */}
              <div className="field">
                <label className="label">Fecha de Ingreso</label>
                <div className="control">
                  <input 
                    className="input" 
                    type="date" 
                    name="fecha_ingreso" 
                    value={formData.fecha_ingreso || ''} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
              {/* Teléfono */}
              <div className="field">
                <label className="label">Teléfono</label>
                <div className="control">
                  <input 
                    className="input" 
                    type="text" 
                    name="telefono" 
                    placeholder="04141234567" 
                    value={formData.telefono || ''} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
              {/* Correo */}
              <div className="field">
                <label className="label">Correo</label>
                <div className="control">
                  <input 
                    className="input" 
                    type="email" 
                    name="correo" 
                    placeholder="juanperez@example.com" 
                    value={formData.correo || ''} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
            </form>
          </section>
          <footer className="modal-card-foot is-justify-content-flex-end">
            {/* Submit button links to the new form id */}
            <button className="button is-success mr-2" type="submit" form="employee-form">Guardar</button> 
            <button className="button" onClick={handleCloseModal}>Cancelar</button>
          </footer>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={onLogout} />
    </section>
  );
};

export default GestionEmpleados;
