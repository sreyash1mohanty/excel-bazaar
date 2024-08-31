import React, { useState } from 'react';
import { Route, Routes, Link, useNavigate, Navigate } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Home from './components/Home';
import Sheeteditor from './components/Sheeteditor';
function ProtectedRoute({ element: Element, isAuthenticated }) {
  return isAuthenticated ? Element : <Navigate to="/" />;
}
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <div className="App">
      <nav className="bg-gray-800 p-4 flex items-center justify-between">
        <ul className="flex space-x-4">
          {!isAuthenticated ? (
            <>
              <li>
                <Link to="/" className="text-white">Login</Link>
              </li>
              <li>
                <Link to="/signup" className="text-white">Sign Up</Link>
              </li>
            </>
          ) : null}
        </ul>
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="text-white bg-black p-2 rounded"
          >
            Logout
          </button>
        )}
      </nav>
      <main className="p-4">
        <Routes>
          <Route path="/" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
          <Route path="/signup" element={<SignUp onSignUp={() => setIsAuthenticated(true)} />} />
          <Route path="/home" element={<ProtectedRoute element={<Home />} isAuthenticated={isAuthenticated} />} />
          <Route path="/sheet/:id" element={<ProtectedRoute element={<Sheeteditor />} isAuthenticated={isAuthenticated} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;


