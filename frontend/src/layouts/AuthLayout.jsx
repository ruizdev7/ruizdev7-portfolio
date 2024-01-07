import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="h-full flex items-center justify-center bg-gray-100">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
