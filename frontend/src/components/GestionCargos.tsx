import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaArrowLeft, FaBars, FaEdit, FaTrashAlt, FaPlus, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa'; // Add sort icons

// Define props including the onLogout function
interface GestionCargosProps {
  onLogout: () => void;
}

// Define Cargo type
interface Cargo {
  id: string; // Add an ID for key prop and editing/deleting
  cargo: string;
  nivel: string; // Can be string like 'Junior', 'Senior' or number
  sueldoBase: number;
  cantidad: number; // Number of employees in this position
}

// Define sort direction and criteria structure (can be reused)
type SortDirection = 'asc' | 'desc';
interface SortCriterion<T> {
  key: keyof T;
  direction: SortDirection;
}

// Default empty state for the form
const defaultFormState: Partial<Cargo> = {
  id: '',
  cargo: '',
  nivel: '',
  sueldoBase: undefined,
  cantidad: undefined,
};

// Dummy data for the table
const dummyCargos: Cargo[] = [
  { id: 'c1', cargo: 'Desarrollador Frontend', nivel: 'Junior', sueldoBase: 900, cantidad: 5 },
  { id: 'c2', cargo: 'Desarrollador Backend', nivel: 'Senior', sueldoBase: 1180, cantidad: 3 },
  { id: 'c3', cargo: 'Diseñador UX/UI', nivel: 'Semi-Senior', sueldoBase: 600, cantidad: 2 },
  { id: 'c4', cargo: 'Gerente de Proyecto', nivel: 'N/A', sueldoBase: 800, cantidad: 1 },
];

// Define columns for filtering
const filterableColumns: { key: keyof Cargo; label: string }[] = [
  { key: 'cargo', label: 'Cargo' },
  { key: 'nivel', label: 'Nivel' },
  { key: 'sueldoBase', label: 'Sueldo Base' },
  { key: 'cantidad', label: 'Cantidad' },
];

const GestionCargos: React.FC<GestionCargosProps> = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filterColumn, setFilterColumn] = useState<keyof Cargo>(filterableColumns[0].key);
  const [filterValue, setFilterValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState<Cargo | null>(null);
  const [formData, setFormData] = useState<Partial<Cargo>>(defaultFormState);
  const [sortCriteria, setSortCriteria] = useState<SortCriterion<Cargo>[]>([]); // State for sorting

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

  const handleEdit = (id: string) => {
    const cargoToEdit = dummyCargos.find(cargo => cargo.id === id);
    if (cargoToEdit) {
      setEditingCargo(cargoToEdit);
      setFormData(cargoToEdit);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    console.log(`Eliminar cargo con ID: ${id}`);
    // Add actual delete logic later
  };

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    const processedValue = type === 'number' ? parseFloat(value) || 0 : value;

    setFormData(prevData => ({
      ...prevData,
      [name]: processedValue
    }));
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (editingCargo) {
      console.log("Actualizando cargo:", formData);
      // Later: Update dummyCargos state, call API
    } else {
      // Generate a temporary ID for the new cargo (replace with real ID from backend later)
      const newCargo = { ...formData, id: `temp_${Date.now()}` }; 
      console.log("Añadiendo nuevo cargo:", newCargo);
      // Later: Add to dummyCargos state, call API
    }
    closeModal();
  };

  // Function to handle clicking on table headers for sorting (similar to GestionEmpleados)
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

  const filteredCargos = useMemo(() => {
    // 1. Filtering
    let filtered = dummyCargos;
    if (!filterValue) {
      // Skip filtering if value is empty
    } else {
      filtered = dummyCargos.filter(cargo => {
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
  }, [filterColumn, filterValue, sortCriteria]); // Add sortCriteria dependency

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

        {/* Table */}
        <div className="table-container">
          <table className="table is-fullwidth is-striped is-hoverable">
            <thead>
              <tr>
                {/* Make headers clickable for sorting */}
                <th onClick={() => handleSort('cargo')} style={{ cursor: 'pointer' }}>
                  Cargo <span className="icon is-small">{getSortIcon('cargo')}</span>
                </th>
                <th onClick={() => handleSort('nivel')} style={{ cursor: 'pointer' }}>
                  Nivel <span className="icon is-small">{getSortIcon('nivel')}</span>
                </th>
                <th onClick={() => handleSort('sueldoBase')} style={{ cursor: 'pointer' }}>
                  Sueldo Base (USD) <span className="icon is-small">{getSortIcon('sueldoBase')}</span>
                </th>
                <th onClick={() => handleSort('cantidad')} style={{ cursor: 'pointer' }}>
                  Cantidad <span className="icon is-small">{getSortIcon('cantidad')}</span>
                </th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCargos.length > 0 ? (
                filteredCargos.map((cargo) => (
                  <tr key={cargo.id}>
                    <td>{cargo.cargo}</td>
                    <td>{cargo.nivel}</td>
                    {/* Format currency */} 
                    <td>{cargo.sueldoBase.toLocaleString('es-ES', { style: 'currency', currency: 'USD' })}</td>
                    <td>{cargo.cantidad}</td>
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
                  <td colSpan={5} className="has-text-centered">No se encontraron cargos con los filtros aplicados.</td>
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
              {/* Cargo */} 
              <div className="field">
                <label className="label">Cargo</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    name="cargo"
                    placeholder="Nombre del cargo"
                    value={formData.cargo || ''}
                    onChange={handleFormChange}
                    required
                    disabled={!!editingCargo} // Disable cargo name when editing?
                  />
                </div>
                 {/* Consider if Cargo name should be editable */} 
                 {editingCargo && <p className="help is-info">El nombre del cargo no se puede modificar una vez creado.</p>}
              </div>
              {/* Nivel */} 
              <div className="field">
                <label className="label">Nivel</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    name="nivel"
                    placeholder="Junior, Senior, N/A..."
                    value={formData.nivel || ''}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>
               {/* Sueldo Base */} 
              <div className="field">
                <label className="label">Sueldo Base (USD)</label>
                <div className="control">
                  <input
                    className="input"
                    type="number"
                    name="sueldoBase"
                    placeholder="1500"
                    value={formData.sueldoBase ?? ''} // Handle undefined for number input
                    onChange={handleFormChange}
                    required
                    step="0.01" // Allow decimals for currency
                    min="0"
                  />
                </div>
              </div>
               {/* Cantidad */} 
              <div className="field">
                <label className="label">Cantidad</label>
                <div className="control">
                  <input
                    className="input"
                    type="number"
                    name="cantidad"
                    placeholder="5"
                    value={formData.cantidad ?? ''} // Handle undefined for number input
                    onChange={handleFormChange}
                    required
                    min="0"
                  />
                </div>
              </div>
            </form>
          </section>
          <footer className="modal-card-foot is-justify-content-flex-end">
            <button className="button is-success mr-2" type="submit" form="cargo-form">Guardar</button>
            <button className="button" onClick={closeModal}>Cancelar</button>
          </footer>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onLogout={onLogout} />
    </section>
  );
};

export default GestionCargos;
