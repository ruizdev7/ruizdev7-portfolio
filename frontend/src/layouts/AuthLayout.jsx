import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="h-full bg-gray-100">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
