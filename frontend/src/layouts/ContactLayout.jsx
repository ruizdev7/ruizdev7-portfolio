import { Outlet } from "react-router-dom";

const ContactLayout = () => {
  return (
    <div className="min-h-screen bg-do_bg_light dark:bg-do_bg_dark">
      <Outlet />
    </div>
  );
};

export default ContactLayout;
