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
        className={`xl:h-[100vh] overflow-y-scroll fixed xl:static w-[80%] md:w-[40%] lg:w-[30%] xl:w-auto h-full top-0 bg-light_mode_1 dark:bg-dark_mode_1 p-4 flex flex-col justify-between z-50 ${
          showMenu ? "left-0" : "-left-full"
        } transition-all`}
      >
        <div className="">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold text-dark_mode_1 dark:text-light_mode_1">
              @Ruizdev7<span className="text-primary2 text-4xl">.</span>
            </h1>
          </div>
          <ul className="flex flex-col justify-center items-start gap-[12px] my-[30px]">
            <li>
              <Link
                to="/"
                className="my-[10px] py-2 px-4 rounded-lg text-light_mode_content_text hover:text-light_mode_text_hover hover:text-base hover:font-medium hover:transition-colors"
              >
                Know me!!!
              </Link>
            </li>
            <li>
              <Link
                to="/projects"
                className="my-[10px] py-2 px-4 rounded-lg text-light_mode_content_text hover:text-light_mode_text_hover hover:text-base hover:font-medium hover:transition-colors"
              >
                Projects
              </Link>
            </li>

            <li>
              <Link
                to="/"
                className="my-[10px] py-2 px-4 rounded-lg text-light_mode_content_text hover:text-light_mode_text_hover hover:text-base hover:font-medium hover:transition-colors"
              >
                Messagges
              </Link>
            </li>
            <li>
              <Link
                to="/home_blog"
                className="my-[10px] py-2 px-4 rounded-lg text-light_mode_content_text hover:text-light_mode_text_hover hover:text-base hover:font-medium hover:transition-colors"
              >
                Knowledge Base
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <Link
            onClick={() => {
              dispatch(cleanCredentials());
            }}
            to="/auth"
            className="flex items-center gap-4 py-2 px-4 rounded-lg hover:bg-secondary-900 transition-colors text-gray-600"
          >
            <SlLogin className="text-primary" />
            Log Out
          </Link>
        </div>
      </div>

      <button
        onClick={() => setShowMenu(!showMenu)}
        className="xl:hidden fixed bottom-4 right-4 bg-light_mode_text_hover text-light_mode_2 dark:bg-dark_mode_2 p-3 rounded-full z-50"
      >
        {showMenu ? <RiCloseLine /> : <RiMenu3Line />}
      </button>
    </>
  );
};

export default Sidebar;
