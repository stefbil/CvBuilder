import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Editor from './pages/Editor'
import PrintView from './pages/PrintView'
import Login from './pages/Login'
import Register from './pages/Register'
import { AuthProvider, useAuth } from './context/AuthContext'
import './index.css'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/editor/:id" element={
            <PrivateRoute>
              <Editor />
            </PrivateRoute>
          } />
          <Route path="/print/:id" element={<PrintView />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
