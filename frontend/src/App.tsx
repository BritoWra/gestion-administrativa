import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'; 
import './App.css' 
import Dashboard from './components/Dashboard';
import GestionEmpleados from './components/GestionEmpleados';
import GestionCargos from './components/GestionCargos'; 
import GestionPagos from './components/GestionPagos'; 

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const navigate = useNavigate(); 

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    
    if (username === 'admin' && password === 'admin123') {
      console.log('Inicio de sesión exitoso!');
      setIsLoggedIn(true);
      navigate('/dashboard'); 
    } else {
      console.error('Credenciales incorrectas');
      alert('Usuario o contraseña incorrectos.');
    }
  }

  const handleLogout = () => {
    console.log('Cerrando sesión...');
    setIsLoggedIn(false);
    navigate('/'); 
  };

  return (
    <Routes>
      <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : 
        <section className="section is-flex is-justify-content-center is-align-items-center full-height-section">
          <div className="container is-max-desktop">
            <div className="box">
              <h1 className="title has-text-centered">Iniciar Sesión</h1>
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label className="label">Usuario</label>
                  <div className="control">
                    <input 
                      className="input"
                      type="text" 
                      placeholder="Nombre de usuario" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Contraseña</label>
                  <div className="control">
                    <input 
                      className="input"
                      type="password" 
                      placeholder="********" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <div className="control">
                    <button className="button is-primary is-fullwidth" type="submit">
                      Ingresar
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>
      } />

      <Route path="/dashboard" element={isLoggedIn ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/" />} />
      <Route path="/gestion-empleados" element={isLoggedIn ? <GestionEmpleados onLogout={handleLogout} /> : <Navigate to="/" />} />
      <Route path="/gestion-cargos" element={isLoggedIn ? <GestionCargos onLogout={handleLogout} /> : <Navigate to="/" />} />
      <Route path="/gestion-pagos" element={isLoggedIn ? <GestionPagos onLogout={handleLogout} /> : <Navigate to="/" />} />
    </Routes>
  );
}

export default App