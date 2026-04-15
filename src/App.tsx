/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Library from './pages/Library';
import Reader from './pages/Reader';
import LessonPrep from './pages/LessonPrep';
import ClassAssistant from './pages/ClassAssistant';
import TeachingLoop from './pages/TeachingLoop';
import Community from './pages/Community';
import Store from './pages/Store';
import Login from './pages/Login';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <BrowserRouter>
      {!isAuthenticated ? (
        <Routes>
          <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <Layout onLogout={() => setIsAuthenticated(false)}>
          <Routes>
            <Route path="/" element={<Library />} />
            <Route path="/reader/:id" element={<Reader />} />
            <Route path="/prep" element={<LessonPrep />} />
            <Route path="/assistant" element={<ClassAssistant />} />
            <Route path="/loop" element={<TeachingLoop />} />
            <Route path="/community" element={<Community />} />
            <Route path="/store" element={<Store />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      )}
    </BrowserRouter>
  );
}
