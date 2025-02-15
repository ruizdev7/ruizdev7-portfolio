import { Link } from "react-router-dom";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cleanCredentials } from "../RTK_Query_app/state_slices/auth/authSlice";
import { SlLogin, SlSocialLinkedin, SlSocialGithub } from "react-icons/sl";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCloseLine,
  RiMenu3Line,
} from "react-icons/ri";

const Sidebar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const dispatch = useDispatch();

  // Función para cerrar el menú
  const closeMenu = () => {
    setShowMenu(false);
  };

  return (
    <>
      <div
        className={`fixed inset-0 h-full w-[80%] md:w-[40%] lg:w-[30%] xl:w-[299px] bg-dark_mode_sidebar p-6 flex flex-col justify-between z-50 ${
          showMenu ? "left-0" : "-left-full"
        } transition-all`}
      >
        <div className="flex items-center justify-around p-2">
          <div>
            <div className="flex items-center justify-center ml-[10px]">
              <div className="group flex items-center space-x-3 hover:scale-105 transition-transform">
                {/* Texto con gradiente */}
                <h1 className="text-xl md:text-2xl font-normal bg-gradient-to-r from-[#B3C7FF] to-[#B3C7FF] bg-clip-text text-transparent">
                  ruizdev7 Portfolio
                </h1>
              </div>
            </div>
          </div>
        </div>
        <ul className="flex flex-col gap-y-4 w-full">
          <li className="w-full">
            <Link
              onClick={closeMenu}
              to="/"
              className="text-[#B5B7C8] hover:text-light_mode_text_hover hover:bg-[#17181C] transition-colors rounded py-2 px-4"
            >
              Know me!!!
            </Link>
          </li>
          <li>
            <Link
              onClick={closeMenu}
              to="/projects"
              className="text-[#B5B7C8] hover:text-light_mode_text_hover hover:bg-[#17181C] transition-colors h-[40px] w-[40px] rounded py-2 px-4"
            >
              Projects
            </Link>
          </li>
          <li>
            <Link
              onClick={closeMenu}
              to="/"
              className="text-[#B5B7C8] hover:text-light_mode_text_hover hover:bg-[#17181C] transition-colors h-[40px] w-[40px] rounded py-2 px-4"
            >
              Messages
            </Link>
          </li>
          <li>
            <Link
              onClick={closeMenu}
              to="/home-blog"
              className="text-[#B5B7C8] hover:text-light_mode_text_hover hover:bg-[#17181C] transition-colors w-full rounded py-2 px-4"
            >
              Knowledge Base
            </Link>
          </li>
        </ul>

        <div className="mt-8">
          <Link
            onClick={() => {
              dispatch(cleanCredentials());
            }}
            to="/auth"
            className="flex items-center gap-4 py-2 px-4 rounded-lg hover:text-light_mode_text_hover hover:bg-[#17181C] transition-colors text-white"
          >
            <SlLogin className="font-sans text-primary" />
            Log Out
          </Link>
        </div>
      </div>

      <button
        onClick={() => setShowMenu(!showMenu)}
        className="fixed bottom-4 right-4 bg-light_mode_text_hover text-light_mode_2 dark:bg-dark_mode_sidebar p-3 rounded-full z-50"
      >
        {showMenu ? <RiCloseLine /> : <RiMenu3Line />}
      </button>
    </>
  );
};

export default Sidebar;
