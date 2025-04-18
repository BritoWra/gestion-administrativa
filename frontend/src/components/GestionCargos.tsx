import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaArrowLeft, FaBars, FaEdit, FaTrashAlt, FaPlus, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa'; // Add sort icons

// Define props including the onLogout function
interface GestionCargosProps {
  onLogout: () => void;
}

// Define Cargo type to match backend model
interface Cargo {
  id: number;
  nombre: string;
  nivel: number;
  sueldo_base: number;
  estatus: number;
}

// Define sort direction and criteria structure
type SortDirection = 'asc' | 'desc';
interface SortCriterion<T> {
  key: keyof T;
  direction: SortDirection;
}

// Default empty state for the form
const defaultFormState: Partial<Cargo> = {
  nombre: '',
  nivel: undefined,
  sueldo_base: undefined,
};

// API Base URL
const API_BASE_URL = 'http://127.0.0.1:5001/api';

// Define columns for filtering
const filterableColumns: { key: keyof Cargo; label: string }[] = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'nivel', label: 'Nivel' },
  { key: 'sueldo_base', label: 'Sueldo Base' },
];

const GestionCargos: React.FC<GestionCargosProps> = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filterColumn, setFilterColumn] = useState<keyof Cargo>(filterableColumns[0].key);
  const [filterValue, setFilterValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState<Cargo | null>(null);
  const [formData, setFormData] = useState<Partial<Cargo>>(defaultFormState);
  const [sortCriteria, setSortCriteria] = useState<SortCriterion<Cargo>[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Efecto para cargar los cargos al montar el componente
  useEffect(() => {
    fetchCargos();
  }, []);

  // Función para obtener todos los cargos
  const fetchCargos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/get/cargos`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCargos(data);
    } catch (error) {
      console.error("Error fetching cargos:", error);
      setError('Error al cargar los datos de los cargos. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Effect to reset form when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      setFormData(defaultFormState);
      setEditingCargo(null);
    }
  }, [isModalOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const openAddModal = () => {
    setEditingCargo(null);
    setFormData(defaultFormState);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleEdit = (id: number) => {
    const cargoToEdit = cargos.find(cargo => cargo.id === id);
    if (cargoToEdit) {
      setEditingCargo(cargoToEdit);
      setFormData({
        nombre: cargoToEdit.nombre,
        nivel: cargoToEdit.nivel,
        sueldo_base: cargoToEdit.sueldo_base
      });
      setIsModalOpen(true);
    }
  };

  // Función para eliminar un cargo
  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este cargo?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/delete/cargos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al eliminar el cargo. Estado: ${response.status}`);
      }

      // Actualizar la lista de cargos eliminando el cargo
      setCargos(prevCargos => prevCargos.filter(cargo => cargo.id !== id));
    } catch (error: any) {
      console.error("Error deleting cargo:", error);
      setError(`Error al eliminar el cargo: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    // Convertir a número si es un campo numérico
    const processedValue = type === 'number' ? parseFloat(value) || 0 : value;

    setFormData(prevData => ({
      ...prevData,
      [name]: processedValue
    }));
  };

  // Función para enviar el formulario (crear/actualizar cargo)
  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    // Convertir nivel y sueldo_base a números si son string
    const dataToSend = {
      ...formData,
      nivel: Number(formData.nivel),
      sueldo_base: Number(formData.sueldo_base)
    };

    try {
      let response;
      
      if (editingCargo) {
        // Actualizar cargo existente
        response = await fetch(`${API_BASE_URL}/put/cargos/${editingCargo.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });
      } else {
        // Crear nuevo cargo
        response = await fetch(`${API_BASE_URL}/add/cargos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const savedCargo = await response.json();

      // Actualizar la lista de cargos
      if (editingCargo) {
        setCargos(prevCargos => prevCargos.map(cargo => 
          cargo.id === savedCargo.id ? savedCargo : cargo
        ));
      } else {
        setCargos(prevCargos => [...prevCargos, savedCargo]);
      }

      // Cerrar el modal y resetear el formulario
      closeModal();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle clicking on table headers for sorting
  const handleSort = (key: keyof Cargo) => {
    setSortCriteria(prevCriteria => {
      const existingIndex = prevCriteria.findIndex(c => c.key === key);
      let newCriteria = [...prevCriteria];

      if (existingIndex !== -1) {
        const currentCriterion = newCriteria[existingIndex];
        if (currentCriterion.direction === 'asc') {
          newCriteria[existingIndex] = { ...currentCriterion, direction: 'desc' };
        } else {
          newCriteria.splice(existingIndex, 1);
        }
      } else {
        if (newCriteria.length < 2) {
          newCriteria.push({ key, direction: 'asc' });
        } else {
          newCriteria[1] = { key, direction: 'asc' };
        }
      }
      return newCriteria;
    });
  };

  // Helper function to get sort icon
  const getSortIcon = (key: keyof Cargo) => {
    const criterion = sortCriteria.find(c => c.key === key);
    if (!criterion) return <FaSort />;
    return criterion.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  // Filtrado y ordenamiento de cargos
  const filteredCargos = useMemo(() => {
    // 1. Filtering
    let filtered = [...cargos];
    
    if (filterValue.trim() !== '') {
      filtered = filtered.filter(cargo => {
        const value = cargo[filterColumn];
        const valueString = String(value).toLowerCase();
        return valueString.includes(filterValue.toLowerCase());
      });
    }

    // 2. Sorting
    if (sortCriteria.length > 0) {
      filtered.sort((a, b) => {
        for (let i = 0; i < sortCriteria.length; i++) {
          const { key, direction } = sortCriteria[i];
          const valA = a[key];
          const valB = b[key];

          let comparison = 0;
          if (typeof valA === 'number' && typeof valB === 'number') {
            comparison = valA - valB;
          } else if (valA && valB) {
            comparison = String(valA).toLowerCase().localeCompare(String(valB).toLowerCase());
          } else if (valA) {
            comparison = 1;
          } else if (valB) {
            comparison = -1;
          }

          if (comparison !== 0) {
            return direction === 'asc' ? comparison : -comparison;
          }
        }
        return 0;
      });
    }

    return filtered;
  }, [cargos, filterColumn, filterValue, sortCriteria]);

  return (
    <section className="section" style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Top Bar Buttons */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 50 }}>
        <Link to="/dashboard" className="button is-primary is-rounded">
          <span className="icon"><FaArrowLeft /></span>
        </Link>
      </div>
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 50 }}>
        <button className="button is-primary is-rounded" onClick={toggleSidebar}>
          <span className="icon"><FaBars /></span>
        </button>
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="notification is-danger" style={{ position: 'fixed', top: '70px', right: '20px', zIndex: 50 }}>
          <button className="delete" onClick={() => setError(null)}></button>
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="container mt-6 pt-5">
        {/* Title with Add Button */}
        <div className="is-flex is-justify-content-space-between is-align-items-center mb-5">
          <h1 className="title is-2">Gestión de Cargos</h1>
          <button className="button is-success is-rounded" onClick={openAddModal} title="Añadir Cargo">
            <span className="icon"><FaPlus /></span>
            <span>Añadir</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="columns is-vcentered mb-4">
          <div className="column is-narrow">
            <label className="label" htmlFor="filter-column-cargo">Filtrar por:</label>
            <div className="control">
              <div className="select">
                <select
                  id="filter-column-cargo"
                  value={filterColumn}
                  onChange={(e) => setFilterColumn(e.target.value as keyof Cargo)}
                >
                  {filterableColumns.map(col => (
                    <option key={col.key} value={col.key}>{col.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="column">
            <label className="label" htmlFor="filter-value-cargo">Valor:</label>
            <div className="control">
              <input
                id="filter-value-cargo"
                className="input"
                type="text"
                placeholder="Escribe para filtrar..."
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="has-text-centered my-4">
            <span className="icon is-large has-text-primary">
              <i className="fas fa-spinner fa-pulse fa-2x"></i>
            </span>
          </div>
        )}

        {/* Table */}
        <div className="table-container">
          <table className="table is-fullwidth is-striped is-hoverable">
            <thead>
              <tr>
                {/* Make headers clickable for sorting */}
                <th onClick={() => handleSort('nombre')} style={{ cursor: 'pointer' }}>
                  Nombre <span className="icon is-small">{getSortIcon('nombre')}</span>
                </th>
                <th onClick={() => handleSort('nivel')} style={{ cursor: 'pointer' }}>
                  Nivel <span className="icon is-small">{getSortIcon('nivel')}</span>
                </th>
                <th onClick={() => handleSort('sueldo_base')} style={{ cursor: 'pointer' }}>
                  Sueldo Base (USD) <span className="icon is-small">{getSortIcon('sueldo_base')}</span>
                </th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCargos.length > 0 ? (
                filteredCargos.map((cargo) => (
                  <tr key={cargo.id}>
                    <td>{cargo.nombre}</td>
                    <td>{cargo.nivel}</td>
                    {/* Format currency */} 
                    <td>{cargo.sueldo_base.toLocaleString('es-ES', { style: 'currency', currency: 'USD' })}</td>
                    <td>
                      <button
                        className="button is-small is-info mr-1"
                        title="Editar"
                        onClick={() => handleEdit(cargo.id)} >
                        <span className="icon"><FaEdit /></span>
                      </button>
                      <button
                        className="button is-small is-danger"
                        title="Eliminar"
                        onClick={() => handleDelete(cargo.id)}>
                        <span className="icon"><FaTrashAlt /></span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="has-text-centered">
                    {loading 
                      ? 'Cargando...'
                      : filteredCargos.length === 0 && cargos.length > 0 
                        ? 'No se encontraron cargos con los filtros aplicados.'
                        : 'No hay cargos registrados.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Cargo Modal */}
      <div className={`modal ${isModalOpen ? 'is-active' : ''}`}>
        <div className="modal-background" onClick={closeModal}></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">{editingCargo ? 'Editar Cargo' : 'Añadir Nuevo Cargo'}</p>
            <button className="delete" aria-label="close" onClick={closeModal}></button>
          </header>
          <section className="modal-card-body">
            <form id="cargo-form" onSubmit={handleFormSubmit}>
              {/* Nombre del Cargo */} 
              <div className="field">
                <label className="label">Nombre</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    name="nombre"
                    placeholder="Nombre del cargo"
                    value={formData.nombre || ''}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>
              {/* Nivel */} 
              <div className="field">
                <label className="label">Nivel</label>
                <div className="control">
                  <input
                    className="input"
                    type="number"
                    name="nivel"
                    placeholder="0, 1, 2, 3..."
                    value={formData.nivel ?? ''}
                    onChange={handleFormChange}
                    required
                    min="0"
                  />
                </div>
                <p className="help">Nivel jerárquico del cargo (0 a N, donde 0 es sin nivel)</p>
              </div>
               {/* Sueldo Base */} 
              <div className="field">
                <label className="label">Sueldo Base (USD)</label>
                <div className="control">
                  <input
                    className="input"
                    type="number"
                    name="sueldo_base"
                    placeholder="1500"
                    value={formData.sueldo_base ?? ''}
                    onChange={handleFormChange}
                    required
                    step="0.01" // Allow decimals for currency
                    min="0"
                  />
                </div>
              </div>
            </form>
          </section>
          <footer className="modal-card-foot is-justify-content-flex-end">
            <button 
              className={`button is-success mr-2 ${loading ? 'is-loading' : ''}`} 
              type="submit" 
              form="cargo-form"
              disabled={loading}
            >
              Guardar
            </button>
            <button className="button" onClick={closeModal} disabled={loading}>Cancelar</button>
          </footer>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onLogout={onLogout} />
    </section>
  );
};

export default GestionCargos;
