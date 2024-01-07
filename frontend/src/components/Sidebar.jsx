import { Link } from "react-router-dom";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cleanCredentials } from "../rtx_app/state_slices/auth/authSlice";
import { SlLogin, SlSocialLinkedin, SlSocialGithub } from "react-icons/sl";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCloseLine,
  RiMenu3Line,
} from "react-icons/ri";
import {
  FcFile,
  FcCollaboration,
  FcFilingCabinet,
  FcConferenceCall,
  FcKindle,
  FcLinux,
} from "react-icons/fc";

const Sidebar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showSubmenu, setShowSubmenu] = useState(false);
  const dispatch = useDispatch();
  return (
    <>
      <div
        className={`xl:h-[100vh] overflow-y-scroll fixed xl:static w-[80%] md:w-[40%] lg:w-[30%] xl:w-auto h-full top-0 bg-white p-4 flex flex-col justify-between z-50 ${
          showMenu ? "left-0" : "-left-full"
        } transition-all`}
      >
        <div>
          <div>
            <h1 className="text-center text-2xl font-bold text-primary mb-10">
              @Ruizdev7<span className="text-primary2 text-4xl">.</span>
            </h1>
          </div>
          <ul>
            <li>
              <Link
                to="/"
                className="flex items-center gap-4 py-2 px-4 rounded-lg hover:bg-secondary-900 transition-colors text-black"
              >
                <FcLinux className="" />
                Know me!!!
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className="flex items-center gap-4 py-2 px-4 rounded-lg hover:bg-secondary-900 transition-colors text-black"
              >
                <FcKindle className="text-primary" />
                Blog
              </Link>
            </li>
            <li>
              <button
                onClick={() => setShowSubmenu(!showSubmenu)}
                className="w-full flex items-center justify-between py-2 px-4 rounded-lg hover:bg-secondary-900 transition-colors text-black"
              >
                <span className="flex items-center gap-4">
                  <FcConferenceCall className="text-primary" />
                  Social Network
                </span>
                <RiArrowRightSLine
                  className={`mt-1 ${
                    showSubmenu && "rotate-90"
                  } transition-all`}
                />
              </button>
              <ul
                className={` ${
                  showSubmenu ? "h-[130px]" : "h-0"
                } overflow-y-hidden transition-all`}
              >
                <li>
                  <Link
                    to="/"
                    className="py-2 px-4 border-l border-gray-500 ml-6 block relative before:w-3 before:h-3 before:absolute before:bg-primary before:rounded-full before:-left-[6.5px] before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-secondary-100 hover:text-primary transition-colors"
                  >
                    LinkedIN
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="py-2 px-4 border-l border-gray-500 ml-6 block relative before:w-3 before:h-3 before:absolute before:bg-gray-500 before:rounded-full before:-left-[6.5px] before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-secondary-100 hover:text-primary transition-colors"
                  >
                    X
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="py-2 px-4 border-l border-gray-500 ml-6 block relative before:w-3 before:h-3 before:absolute before:bg-gray-500 before:rounded-full before:-left-[6.5px] before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-secondary-100 hover:text-primary transition-colors"
                  >
                    GitHub
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link
                to="/"
                className="flex items-center gap-4 py-2 px-4 rounded-lg hover:bg-secondary-900 transition-colors text-black"
              >
                <FcCollaboration className="text-primary" />
                Messagges
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className="flex items-center gap-4 py-2 px-4 rounded-lg hover:bg-secondary-900 transition-colors text-black"
              >
                <FcFilingCabinet className="text-primary" />
                Knowledge Base
              </Link>
            </li>
          </ul>
        </div>
        <nav>
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
        </nav>
      </div>

      <button
        onClick={() => setShowMenu(!showMenu)}
        className="xl:hidden fixed bottom-4 right-4 bg-primary2 text-black p-3 rounded-full z-50"
      >
        {showMenu ? <RiCloseLine /> : <RiMenu3Line />}
      </button>
    </>
  );
};

export default Sidebar;
