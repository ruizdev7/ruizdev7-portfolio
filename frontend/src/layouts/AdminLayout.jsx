import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useState } from "react";
import { RiMenu3Line, RiCloseLine } from "react-icons/ri";
import Header from "../components/Header";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen flex w-full relative">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
      {/* Botón de menú flotante */}
      <button
        onClick={() => setSidebarOpen((open) => !open)}
        className="fixed bottom-4 right-4 bg-do_blue text-white dark:bg-do_blue_light dark:text-do_bg_dark p-3 rounded-full z-50 shadow-lg md:block lg:hidden"
      >
        {sidebarOpen ? <RiCloseLine size={24} /> : <RiMenu3Line size={24} />}
      </button>
    </div>
  );
};

export default AdminLayout;
