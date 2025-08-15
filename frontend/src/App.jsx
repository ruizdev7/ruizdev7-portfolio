// Importaciones
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import AuthLayout from "./layouts/AuthLayout";
import ContactLayout from "./layouts/ContactLayout";

// Pages Auth
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import ForgetPassword from "./pages/auth/ForgetPassword";
import TermsAndConditions from "./pages/auth/TermsAndConditions";
import UserView from "./pages/auth/UserView";

// Pages Admin
import Home from "./pages/admin/Home";
import RolesManagement from "./pages/admin/RolesManagement";

// Pages Poriject systms
import Projects from "./pages/projects/Projects";
import PumpCRUD from "./pages/projects/PumpCRUD";

// Pages Blog
import HomeBlog from "./pages/home_blog/HomeBlog";

// Pages Contact
import Contact from "./pages/Contact";

// Pages Error
import Error404 from "./pages/Error404";

// Auth Initializer
import AuthInitializer from "./components/auth/AuthInitializer";

function App() {
  return (
    <Router>
      <AuthInitializer />
      <Routes>
        {/* Rutas de autenticación */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route index element={<Login />} />
          <Route path="login" element={<Login />} />
          <Route path="sign-up" element={<SignUp />} />
          <Route path="forget-password" element={<ForgetPassword />} />
          <Route path="terms-and-conditions" element={<TermsAndConditions />} />
        </Route>

        {/* Rutas principales con AdminLayout */}
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Home />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="roles" element={<RolesManagement />} />
        </Route>
        <Route path="/projects" element={<AdminLayout />}>
          <Route index element={<Projects />} />
          <Route path="pump-crud" element={<PumpCRUD />} />
        </Route>

        {/* Rutas de blog */}
        <Route path="/home-blog" element={<HomeBlog />} />

        {/* Rutas de contacto */}
        <Route path="/contact" element={<ContactLayout />}>
          <Route index element={<Contact />} />
        </Route>

        {/* Ruta de gestión de usuarios */}
        <Route path="/user-management/users/view" element={<AdminLayout />}>
          <Route index element={<UserView />} />
        </Route>

        {/* Ruta 404 */}
        <Route path="*" element={<Error404 />} />
      </Routes>

      <ToastContainer />
    </Router>
  );
}

export default App;
