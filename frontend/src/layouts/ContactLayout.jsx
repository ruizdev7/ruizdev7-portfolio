import { Outlet } from "react-router-dom";
import Header from "../components/Header";

const ContactLayout = () => {
  return (
    <div className="min-h-screen bg-do_bg_light dark:bg-do_bg_dark">
      <Header />
      <Outlet />
    </div>
  );
};

export default ContactLayout;
