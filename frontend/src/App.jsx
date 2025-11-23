// Importaciones
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Theme Provider
import { ThemeProvider } from "./contexts/ThemeContext";
// Language Provider
import { LanguageProvider } from "./contexts/LanguageContext";

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
import ModernHome from "./pages/ModernHome";
import RolesManagement from "./pages/admin/RolesManagement";
import UserManagement from "./pages/admin/UserManagement";

// Pages Projects systems
import Projects from "./pages/projects/Projects";
import PumpCRUD from "./pages/projects/PumpCRUD";
import PumpDetails from "./pages/projects/PumpDetails";
import AIFinantialCalculator from "./pages/AI-finantial-calculator/AIFinantialCalculator";

// Pages AI Governance
import AIGovernanceDashboard from "./pages/ai-governance/AIGovernanceDashboard";
import AgentsManagement from "./pages/ai-governance/AgentsManagement";
import TasksManagement from "./pages/ai-governance/TasksManagement";
import ApprovalsManagement from "./pages/ai-governance/ApprovalsManagement";
import PoliciesManagement from "./pages/ai-governance/PoliciesManagement";
import BlockchainAudit from "./pages/ai-governance/BlockchainAudit";
import ApprovalSettings from "./pages/ai-governance/ApprovalSettings";

// Pages Blog
import HomeBlog from "./pages/home_blog/HomeBlog";

// Pages Contact
import Contact from "./pages/Contact";
import ContactMessages from "./pages/ContactMessages";

// Pages Error
import Error404 from "./pages/Error404";

// Auth Initializer
import AuthInitializer from "./components/auth/AuthInitializer";
import AuthDebugger from "./components/auth/AuthDebugger";
import ThemeDebugger from "./components/ThemeDebugger";

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <AuthInitializer />
          <AuthDebugger />
          <ThemeDebugger />
          <Routes>
            {/* Rutas de autenticación */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route index element={<Login />} />
              <Route path="login" element={<Login />} />
              <Route path="sign-up" element={<SignUp />} />
              <Route path="forget-password" element={<ForgetPassword />} />
              <Route
                path="terms-and-conditions"
                element={<TermsAndConditions />}
              />
            </Route>

            {/* Rutas principales con AdminLayout */}
            <Route path="/" element={<ModernHome />}>
              <Route index element={<Home />} />
            </Route>

            {/* Nueva página moderna sin AdminLayout */}
            <Route path="/modern" element={<ModernHome />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="roles" element={<RolesManagement />} />
              <Route path="users" element={<UserManagement />} />
            </Route>
            <Route path="/projects" element={<AdminLayout />}>
              <Route index element={<Projects />} />
              <Route path="pump-crud" element={<PumpCRUD />} />
              <Route path="pump-details/:ccn_pump" element={<PumpDetails />} />
              <Route
                path="ai-financial-calculator"
                element={<AIFinantialCalculator />}
              />
            </Route>

            {/* AI Governance Platform */}
            <Route path="/ai-governance" element={<AdminLayout />}>
              <Route index element={<AIGovernanceDashboard />} />
              <Route path="agents" element={<AgentsManagement />} />
              <Route path="tasks" element={<TasksManagement />} />
              <Route path="approvals" element={<ApprovalsManagement />} />
              <Route path="policies" element={<PoliciesManagement />} />
              <Route path="approval-settings" element={<ApprovalSettings />} />
              <Route path="blockchain" element={<BlockchainAudit />} />
            </Route>

            {/* Rutas de blog */}
            <Route path="/home-blog" element={<HomeBlog />} />

            {/* Rutas de contacto */}
            <Route path="/contact" element={<ContactLayout />}>
              <Route index element={<Contact />} />
            </Route>
            <Route path="/admin/contact-messages" element={<AdminLayout />}>
              <Route index element={<ContactMessages />} />
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
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
