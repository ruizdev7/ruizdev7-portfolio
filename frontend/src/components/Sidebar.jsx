import { Link } from "react-router-dom";
import React from "react";
import { useDispatch } from "react-redux";
import { cleanCredentials } from "../RTK_Query_app/state_slices/auth/authSlice";
import { SlLogin } from "react-icons/sl";
import PropTypes from "prop-types";

const Sidebar = ({ isOpen }) => {
  const dispatch = useDispatch();
  if (!isOpen) return null;
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
      <ul className="flex flex-col gap-y-4 w-full">
        <li className="w-full">
          <Link
            onClick={() => {
              // closeMenu(); // This function is removed, so this line is removed.
            }}
            to="/"
            className="text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_blue dark:hover:text-do_blue_light hover:bg-do_border_light dark:hover:bg-do_bg_dark transition-colors rounded py-2 px-4"
          >
            Know me!!!
          </Link>
        </li>
        <li>
          <Link
            onClick={() => {
              // closeMenu(); // This function is removed, so this line is removed.
            }}
            to="/"
            className="text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_blue dark:hover:text-do_blue_light hover:bg-do_border_light dark:hover:bg-do_bg_dark transition-colors h-[40px] w-[40px] rounded py-2 px-4"
          >
            Messages
          </Link>
        </li>
        <li>
          <Link
            onClick={() => {
              // closeMenu(); // This function is removed, so this line is removed.
            }}
            to="/home-blog"
            className="text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_blue dark:hover:text-do_blue_light hover:bg-do_border_light dark:hover:bg-do_bg_dark transition-colors w-full rounded py-2 px-4"
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
          className="flex items-center gap-4 py-2 px-4 rounded-lg text-do_text_light dark:text-do_text_dark hover:text-do_blue dark:hover:text-do_blue_light hover:bg-do_border_light dark:hover:bg-do_bg_dark transition-colors"
        >
          <SlLogin className="font-sans text-primary" />
          Log Out
        </Link>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
};

export default Sidebar;
