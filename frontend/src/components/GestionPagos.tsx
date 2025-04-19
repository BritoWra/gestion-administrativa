import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import PagoCard from './PagoCard'; // Import the new card component
import { FaArrowLeft, FaBars, FaUser, FaBriefcase } from 'react-icons/fa';

// Define props including the onLogout function
interface GestionPagosProps {
  onLogout: () => void;
}

const GestionPagos: React.FC<GestionPagosProps> = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Placeholder handlers for the buttons
  const handleCreditoEmpleado = () => {
    console.log("Crédito por Empleado clickeado");
    // navigate('/pagos/credito-empleado'); // Example navigation
  };

  const handleDebitoEmpleado = () => {
    console.log("Débito por Empleado clickeado");
    // navigate('/pagos/debito-empleado'); // Example navigation
  };

  const handleCreditoCargo = () => {
    console.log("Crédito por Cargo clickeado");
    // navigate('/pagos/credito-cargo'); // Example navigation
  };

  const handleDebitoCargo = () => {
    console.log("Débito por Cargo clickeado");
    // navigate('/pagos/debito-cargo'); // Example navigation
  };

  return (
    <section 
      className="section is-flex is-flex-direction-column" 
      style={{ minHeight: '100vh', position: 'relative' }} // Ensure flex column layout for section
    >
      {/* Sidebar Toggle Button (Top Right) */}
      <button 
        className="button is-primary is-rounded" 
        style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}
        onClick={toggleSidebar}
        aria-label="Abrir menú lateral"
      >
        <span className="icon"><FaBars /></span>
      </button>

      {/* Back Button (Top Left) */}
      <Link 
        to="/dashboard" 
        className="button is-primary is-rounded" 
        style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}
        aria-label="Volver al dashboard"
      >
        <span className="icon"><FaArrowLeft /></span>
      </Link>

      {/* Title */}
      <h1 className="title is-1 has-text-centered mt-6 pt-4 mb-6">Gestión de Pagos</h1>

      {/* Container takes remaining space */}
      <div className="container is-fluid" style={{ flexGrow: 1, display: 'flex', paddingBottom: '2rem', width: '100%' }}> 
        {/* Columns container fills the container and stretches children */}
        <div className="columns is-centered is-flex-grow-1 is-align-items-stretch is-variable is-2" style={{width: '100%'}}> 
          {/* Pagos por Empleado Card */}
          <div className="column is-half is-flex"> {/* is-flex allows card inside to stretch */}
            <PagoCard
              title="Pagos por Empleado"
              icon={FaUser}
              description="Gestionar créditos y débitos individuales por empleado."
              onCreditoClick={handleCreditoEmpleado}
              onDebitoClick={handleDebitoEmpleado}
            />
          </div>

          {/* Pagos por Cargo Card */}
          <div className="column is-half is-flex"> {/* is-flex allows card inside to stretch */}
            <PagoCard
              title="Pagos por Cargo"
              icon={FaBriefcase}
              description="Aplicar créditos y débitos masivos por cargo."
              onCreditoClick={handleCreditoCargo}
              onDebitoClick={handleDebitoCargo}
            />
          </div>
        </div>
      </div>

      {/* Sidebar */} 
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onLogout={onLogout} />
    </section>
  );
};

export default GestionPagos;
