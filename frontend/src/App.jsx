// Importaciones
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { useState } from "react";

// Layouts imports
import AuthLayout from "./layouts/AuthLayout";
import AdminLayout from "./layouts/AdminLayout";

// Components imports
import Navbar from "./components/Navbar";

// Pages Auth system
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import ForgetPassword from "./pages/auth/ForgetPassword";

// Pages Admin
import Home from "./pages/admin/Home";

// Pages Poriject systms
import Projects from "./pages/projects/Projects";

// Pages Blog
import HomeBlog from "./pages/home_blog/HomeBlog";

// Error 404
import Error404 from "./pages/Error404";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthLayout />}>
          <Route index element={<Login />} />
          <Route path="sign-up" element={<SignUp />} />
          <Route path="forget-password" element={<ForgetPassword />} />
        </Route>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Home />} />
        </Route>
        <Route path="/projects" element={<AdminLayout />}>
          <Route index element={<Projects />} />
        </Route>
        <Route path="/home_blog" element={<AdminLayout />}>
          <Route index element={<HomeBlog />} />
        </Route>
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Router>
  );
}

export default App;
