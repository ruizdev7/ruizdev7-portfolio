import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../RTK_Query_app/state_slices/authSlice";
import { usePermissions } from "../hooks/usePermissions";
import { SlLogin } from "react-icons/sl";
import {
  UserGroupIcon,
  ShieldCheckIcon,
  HomeIcon,
  DocumentTextIcon,
  CogIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import PropTypes from "prop-types";

const Sidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { canRead, isAdmin, isGuest } = usePermissions();
  const user = useSelector((state) => state.auth.user);

  if (!isOpen) return null;

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-do_card_light dark:bg-do_card_dark p-6 flex flex-col justify-between z-40 transition-all duration-300">
      <div className="flex items-center justify-around p-2">
        <div>
          <div className="flex items-center justify-center ml-[10px]">
            <div className="group flex items-center space-x-3 hover:scale-105 transition-transform">
              {/* Texto con gradiente */}
              <h1 className="text-xl md:text-2xl font-normal bg-gradient-to-r from-do_blue to-do_blue_light bg-clip-text text-transparent">
                ruizdev7 Portfolio
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Información del usuario */}
      {user && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Bienvenido, {user.first_name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            {user.email}
          </div>
          {/* Mostrar rol del usuario */}
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            {isAdmin() && "👑 Administrador"}
            {isGuest() && "👁️ Usuario Guest (Solo Lectura)"}
            {!isAdmin() && !isGuest() && "👤 Usuario"}
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-y-4 w-full">
        <li className="w-full">
          <Link
            to="/"
            onClick={handleLinkClick}
            className="flex items-center gap-3 text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_blue dark:hover:text-do_blue_light hover:bg-do_border_light dark:hover:bg-do_bg_dark transition-colors rounded py-2 px-4"
          >
            <HomeIcon className="h-5 w-5" />
            Inicio
          </Link>
        </li>

        {/* Blog - Accesible para todos */}
        <li>
          <Link
            to="/home-blog"
            onClick={handleLinkClick}
            className="flex items-center gap-3 text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_blue dark:hover:text-do_blue_light hover:bg-do_border_light dark:hover:bg-do_bg_dark transition-colors w-full rounded py-2 px-4"
          >
            <DocumentTextIcon className="h-5 w-5" />
            Blog
          </Link>
        </li>

        {/* Proyectos - Solo lectura para guest, completo para otros */}
        <li>
          <Link
            to="/projects"
            onClick={handleLinkClick}
            className="flex items-center gap-3 text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_blue dark:hover:text-do_blue_light hover:bg-do_border_light dark:hover:bg-do_bg_dark transition-colors w-full rounded py-2 px-4"
          >
            <CogIcon className="h-5 w-5" />
            Proyectos
            {isGuest() && (
              <span className="text-xs text-gray-500 ml-auto">(Solo ver)</span>
            )}
          </Link>
        </li>

        {/* Gestión de Roles - Solo para usuarios con permisos */}
        {canRead("roles") && (
          <li>
            <Link
              to="/admin/roles"
              onClick={handleLinkClick}
              className="flex items-center gap-3 text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_blue dark:hover:text-do_blue_light hover:bg-do_border_light dark:hover:bg-do_bg_dark transition-colors w-full rounded py-2 px-4"
            >
              <ShieldCheckIcon className="h-5 w-5" />
              Gestión de Roles
            </Link>
          </li>
        )}

        {/* Gestión de Usuarios - Solo para administradores */}
        {isAdmin() && (
          <li>
            <Link
              to="/user-management/users/view"
              onClick={handleLinkClick}
              className="flex items-center gap-3 text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_blue dark:hover:text-do_blue_light hover:bg-do_border_light dark:hover:bg-do_bg_dark transition-colors w-full rounded py-2 px-4"
            >
              <UserGroupIcon className="h-5 w-5" />
              Usuarios
            </Link>
          </li>
        )}

        {/* Información adicional para usuarios guest */}
        {isGuest() && (
          <li className="mt-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <EyeIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Modo Solo Lectura</span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Puedes ver contenido pero no realizar modificaciones
              </p>
            </div>
          </li>
        )}
      </ul>

      <div className="mt-8">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 py-2 px-4 rounded-lg text-do_text_light dark:text-do_text_dark hover:text-do_blue dark:hover:text-do_blue_light hover:bg-do_border_light dark:hover:bg-do_bg_dark transition-colors w-full"
        >
          <SlLogin className="font-sans text-primary" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

export default Sidebar;
