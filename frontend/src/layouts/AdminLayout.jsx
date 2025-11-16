import { Outlet } from "react-router-dom";
import Header from "../components/Header";

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex w-full relative">
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
