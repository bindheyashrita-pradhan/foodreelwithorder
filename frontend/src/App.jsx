import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';

function App() {
  return (
    <Router>
      <Navbar />
      <AppRoutes />
      <BottomNav />
    </Router>
  );
}

export default App;