import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children,roles }) => {
  const { isLoggedIn, loading ,user} = useSelector((state) => state.auth);
    const location = useLocation();
// console.log(roles)

  if (loading) {
    return <div>Loading...</div>; // Add your loading component
  }
// ✅ Agar login hi nahi hai
  if (!isLoggedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
 // ✅ Agar roles diye gaye hain aur user.role allowed nahi hai
  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return isLoggedIn ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
