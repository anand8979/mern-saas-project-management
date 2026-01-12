import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './utils/PrivateRoute';
import AdminRoute from './utils/AdminRoute';
import ManagerRoute from './utils/ManagerRoute';
import Header from './components/Layout/Header';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import KanbanBoard from './pages/KanbanBoard';
import UserManagement from './pages/UserManagement';
import CreateProject from './pages/CreateProject';
import CreateTask from './pages/CreateTask';
import EditTask from './pages/EditTask';
import EditProject from './pages/EditProject';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/projects/:id"
                element={
                  <PrivateRoute>
                    <ProjectDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="/projects/:id/kanban"
                element={
                  <PrivateRoute>
                    <KanbanBoard />
                  </PrivateRoute>
                }
              />

              {/* Admin/Manager routes */}
              <Route
                path="/projects/new"
                element={
                  <ManagerRoute>
                    <CreateProject />
                  </ManagerRoute>
                }
              />
              <Route
                path="/projects/:id/edit"
                element={
                  <ManagerRoute>
                    <EditProject />
                  </ManagerRoute>
                }
              />
              <Route
                path="/tasks/new"
                element={
                  <ManagerRoute>
                    <CreateTask />
                  </ManagerRoute>
                }
              />
              <Route
                path="/tasks/:id/edit"
                element={
                  <ManagerRoute>
                    <EditTask />
                  </ManagerRoute>
                }
              />

              {/* Admin routes */}
              <Route
                path="/users"
                element={
                  <AdminRoute>
                    <UserManagement />
                  </AdminRoute>
                }
              />

              {/* Default route */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
