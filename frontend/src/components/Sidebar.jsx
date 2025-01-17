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
  const [showSubmenu, setShowSubmenu] = useState(false);
  const dispatch = useDispatch();
  return (
    <>
      <div
        className={`xl:h-[100vh] overflow-y-scroll fixed xl:static w-[80%] md:w-[40%] lg:w-[30%] xl:w-[299px] h-full top-0 bg-dark_mode_sidebar p-8 flex flex-col justify-between z-50 ${
          showMenu ? "left-0" : "-left-full"
        } transition-all`}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start justify-center p-2">
            <h1 className="text-[#B3C7FF] text-2xl font-sans text-center">
              ruizdev7
            </h1>
          </div>
        </div>
        <div>
          <ul className="flex flex-col gap-4">
            <li>
              <Link
                to="/"
                className="font-sans py-2 px-4 rounded-lg text-gray-400 hover:text-white hover:bg-secondary-900 transition-colors"
              >
                Know me!!!
              </Link>
            </li>
            <li>
              <Link
                to="/projects"
                className="font-sans py-2 px-4 rounded-lg text-gray-400 hover:text-white hover:bg-secondary-900 transition-colors"
              >
                Projects
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className="font-sans py-2 px-4 rounded-lg text-gray-400 hover:text-white hover:bg-secondary-900 transition-colors"
              >
                Messages
              </Link>
            </li>
            <li>
              <Link
                to="/home-blog"
                className="font-sans py-2 px-4 rounded-lg text-gray-400 hover:text-white hover:bg-secondary-900 transition-colors"
              >
                Knowledge Base
              </Link>
            </li>
          </ul>
        </div>
        <div className="mt-8">
          <Link
            onClick={() => {
              dispatch(cleanCredentials());
            }}
            to="/auth"
            className="flex items-center gap-4 py-2 px-4 rounded-lg hover:bg-secondary-900 transition-colors text-white"
          >
            <SlLogin className="font-sans text-primary" />
            Log Out
          </Link>
        </div>
      </div>

      <button
        onClick={() => setShowMenu(!showMenu)}
        className="xl:hidden fixed bottom-4 right-4 bg-light_mode_text_hover text-light_mode_2 dark:bg-dark_mode_sidebar p-3 rounded-full z-50"
      >
        {showMenu ? <RiCloseLine /> : <RiMenu3Line />}
      </button>
    </>
  );
};

export default Sidebar;
