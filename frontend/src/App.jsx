import React, { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import NotFound from "./pages/NotFound/NotFound";
// Removida importação do SearchPage se ela não for usada diretamente como rota independente fora do Dashboard
// Se for usar dentro do Dashboard, o Dashboard que deve gerenciar.

const ProtectedRoute = ({ children, user }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppRoutes = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Erro ao parsear usuário", e);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    // Navegação é feita dentro do componente Login, mas o estado atualiza aqui
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const ProtectedDashboard = () => (
    <Dashboard onLogout={handleLogout} user={user} />
  );

  // Verifica se existe QUALQUER usuário logado (Guest ou Real)
  const isAuthenticated = !!user;

  return (
    <Routes>
      {/* Redireciona raiz para Dashboard se logado, ou Login se não */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Rota de Login: Se já logado, manda pro Dashboard */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login onLogin={handleLogin} />
          )
        }
      />

      {/* Rota de Registro: Se já logado, manda pro Dashboard */}
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Register onRegister={handleLogin} />
          )
        }
      />

      {/* Rotas Protegidas - Todas renderizam o Dashboard */}
      {/* O Dashboard interno deve lidar com o conteúdo baseado na URL ou Abas */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute user={user}>
            <ProtectedDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/searchpage"
        element={
          <ProtectedRoute user={user}>
            <ProtectedDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/binders/*"
        element={
          <ProtectedRoute user={user}>
            <ProtectedDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payments"
        element={
          <ProtectedRoute user={user}>
            <ProtectedDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/section/*"
        element={
          <ProtectedRoute user={user}>
            <ProtectedDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
