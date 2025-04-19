import React from 'react';
import './Sidebar.css'; // We'll create this CSS file next
import { FaCog, FaUserShield, FaSignOutAlt } from 'react-icons/fa';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onLogout }) => {
  const handleNavigation = (path: string) => {
    console.log(`Navigating to ${path}`);
    // Add actual navigation logic here (e.g., using react-router-dom)
    onClose(); // Close sidebar after clicking an option
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay to close sidebar when clicked */}
      <div className={`sidebar-overlay ${isOpen ? 'is-active' : ''}`} onClick={onClose}></div>
      {/* Sidebar content */}
      <aside className={`menu sidebar-menu is-hidden-touch ${isOpen ? 'is-active' : ''}`}>
        <button 
          className="delete is-large sidebar-close-button" 
          aria-label="close" 
          onClick={onClose}
        ></button>
        <p className="menu-label">General</p>
        <ul className="menu-list">
          <li>
            <a onClick={() => handleNavigation('/configuraciones')}> 
              <span className="icon-text">
                <span className="icon"><FaCog /></span>
                <span>Configuraciones</span>
              </span>
            </a>
          </li>
          <li>
            <a onClick={() => handleNavigation('/gestion-usuario')}>
              <span className="icon-text">
                 <span className="icon"><FaUserShield /></span>
                 <span>Gestión de Usuario</span>
              </span>
            </a>
          </li>
        </ul>
        <p className="menu-label">Cuenta</p>
        <ul className="menu-list">
          <li>
            <a onClick={onLogout}>
              <span className="icon-text has-text-danger">
                 <span className="icon"><FaSignOutAlt /></span>
                 <span>Cerrar Sesión</span>
              </span>
            </a>
          </li>
        </ul>
      </aside>
    </>
  );
};

export default Sidebar;
