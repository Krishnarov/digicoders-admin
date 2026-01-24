
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import MainLayout from "./layout/MainLayout";
import routes from "./routes/Routes.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Receipt from "./components/Receipt.jsx";
import PaymentSuccess from "./components/PaymentSuccess.jsx";
import Unauthorized from "./pages/Unauthorized";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/receipt/:id" element={<Receipt />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                {routes.map((route, index) => (
                  <Route
                    path={route.path}
                    element={
                      <ProtectedRoute
                        roles={route.roles}
                        requiredPermission={route.requiredPermission}
                      >
                        <route.component />
                      </ProtectedRoute>
                    }
                    key={index}
                  />
                ))}
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;