import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaBriefcase, FaMoneyBillWave, FaChartBar, FaBars } from 'react-icons/fa';
import DashboardCard from './DashboardCard';
import Sidebar from './Sidebar';
import './Sidebar.css';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCardClick = (path: string) => {
    console.log(`Navegando a: ${path}`);
    navigate(path);
  };

  return (
    <section className="section is-flex is-justify-content-center is-align-items-center" style={{ minHeight: '100vh', position: 'relative' }}>
      <button 
        className="button is-primary is-rounded" 
        style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 50 }} 
        onClick={toggleSidebar}
      >
        <span className="icon">
          <FaBars />
        </span>
      </button>
      
      <div className="container">
        {/* Cards Section */}
        <div className="columns is-multiline">
          {/* Gestion de Empleados Card */}
          <div className="column is-half">
            <DashboardCard 
              title="Gestión de Empleados"
              icon={FaUsers} 
              description="Administra altas, bajas y modificaciones de empleados."
              onClick={() => handleCardClick('/gestion-empleados')} 
            />
          </div>
          {/* Gestion de Pagos Card */}
          <div className="column is-half">
            <DashboardCard 
              title="Gestión de Pagos"
              icon={FaMoneyBillWave} 
              description="Realiza y consulta el historial de pagos a empleados."
              onClick={() => navigate('/gestion-pagos')} 
            />
          </div>
          {/* Gestion de Cargos Card */}
          <div className="column is-half">
            <DashboardCard 
              title="Gestión de Cargos"
              icon={FaBriefcase} 
              description="Define y asigna los diferentes cargos dentro de la empresa."
              onClick={() => handleCardClick('/gestion-cargos')} 
            />
          </div>
          {/* Generar Reportes Card */}
          <div className="column is-half">
            <DashboardCard 
              title="Generar Reportes"
              icon={FaChartBar} 
              description="Crea reportes personalizados sobre empleados, pagos y más."
              onClick={() => handleCardClick('/reportes')} 
            />
          </div>
        </div>
      </div>
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onLogout={onLogout} />
    </section>
  );
};

export default Dashboard;
