import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import AdminEvent from './pages/AdminEvent';
import CheckIn from './pages/CheckIn';
import Monitor from './pages/Monitor';

import PublicFaceRegister from './pages/PublicFaceRegister';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/face-checkin/:eventId" element={<PublicFaceRegister />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="admin/events/:id" element={<AdminEvent />} />
          <Route path="checkin/:id" element={<CheckIn />} />
        </Route>
        <Route path="/monitor/:id" element={<Monitor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
