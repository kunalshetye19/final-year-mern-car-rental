import { useEffect, useState } from 'react';
import VendorLogin from './pages/VendorLogin';
import VendorDashboard from './pages/VendorDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [vendorId, setVendorId] = useState(null);
  const [vendorName, setVendorName] = useState('');

  useEffect(() => {
    // Check if vendor is logged in
    const storedVendorId = localStorage.getItem('vendorId');
    const storedVendorName = localStorage.getItem('vendorName');
    
    if (storedVendorId) {
      setIsAuthenticated(true);
      setVendorId(storedVendorId);
      setVendorName(storedVendorName || '');
    }
  }, []);

  const handleVendorLogin = (id, name) => {
    setIsAuthenticated(true);
    setVendorId(id);
    setVendorName(name);
    localStorage.setItem('vendorId', id);
    localStorage.setItem('vendorName', name);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setVendorId(null);
    setVendorName('');
    localStorage.removeItem('vendorId');
    localStorage.removeItem('vendorName');
  };

  return (
    <>
      {isAuthenticated ? (
        <VendorDashboard 
          vendorId={vendorId} 
          vendorName={vendorName}
          onLogout={handleLogout}
        />
      ) : (
        <VendorLogin onLogin={handleVendorLogin} />
      )}
    </>
  );
}

export default App;
