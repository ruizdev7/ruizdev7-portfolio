import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  RiSunLine,
  RiMoonLine,
  RiLinkedinBoxLine,
  RiGithubFill,
  RiTwitterXLine,
} from "react-icons/ri";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const email_user = useSelector(
    (state) => state.auth.current_user.user_info.email
  );

  console.log(email_user ? email_user : "No user");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <header className="w-full dark:bg-dark_mode_sidebar h-14 md:h-16 flex items-center justify-center">
      <div className="relative w-full max-w-screen-2xl flex items-center justify-between px-2 md:px-4 lg:px-10 mx-auto">
        {/* Logo a la izquierda */}
        <div className="flex items-center justify-start flex-1 min-w-0">
          <div className="group flex items-center hover:scale-105 transition-transform">
            <Link
              to={"/"}
              className="text-xl md:text-2xl font-normal bg-gradient-to-r from-[#B3C7FF] to-[#B3C7FF] bg-clip-text text-transparent"
            >
              ruizdev7
            </Link>
          </div>
        </div>
        {/* Centro: Social icons y dark mode toggle */}
        <div className="flex items-center gap-2 justify-center flex-1 min-w-0">
          <button
            onClick={toggleDarkMode}
            className="p-2 text-secondary hover:text-primary hover:bg-hover-background rounded transition-colors"
          >
            {isDarkMode ? (
              <RiSunLine className="h-6 w-6 text-white hover:text-blue-400 transition-colors" />
            ) : (
              <RiMoonLine className="h-6 w-6 text-white hover:text-blue-400 transition-colors" />
            )}
          </button>
          <SocialIconLink
            url="https://www.linkedin.com/in/ruizdev7/"
            icon={
              <RiLinkedinBoxLine className="h-6 w-6 text-white hover:text-blue-400 transition-colors" />
            }
          />
          <SocialIconLink
            url="https://github.com/ruizdev7"
            icon={
              <RiGithubFill className="h-6 w-6 text-white hover:text-blue-400 transition-colors" />
            }
          />
          <SocialIconLink
            url="https://x.com/ruizdev7"
            icon={
              <RiTwitterXLine className="h-6 w-6 text-white hover:text-blue-400 transition-colors" />
            }
          />
          <Link
            to="/blog"
            className="h-6 w-6 text-white hover:text-blue-400 transition-colors"
          >
            Blog
          </Link>
        </div>
        {/* Usuario a la derecha */}
        <div className="flex items-center justify-end flex-1 min-w-0">
          <p className="text-white truncate max-w-[120px] md:max-w-[200px] lg:max-w-[300px]">
            {email_user ? email_user : "No user"}
          </p>
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

const SocialIconLink = ({ url, icon }) => (
  <Link
    to={url}
    target="_blank"
    className="p-2 text-secondary hover:text-primary hover:bg-hover-background rounded transition-colors"
  >
    {icon}
  </Link>
);

const UserMenu = () => (
  <Menu>
    <MenuButton className="flex items-center rounded-full focus:outline-none">
      <img
        className="h-9 w-9 rounded-full object-cover"
        src="https://avatars.githubusercontent.com/u/62305538?v=4"
        alt="User avatar"
      />
    </MenuButton>

    <MenuItems
      anchor="bottom end"
      className="w-48 origin-top-right rounded-lg bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700 mt-2 p-1 focus:outline-none"
    >
      <MenuItem>
        {({ active }) => (
          <Link
            to="/user-management/users/view"
            className={`${
              active
                ? "hover:text-light_mode_text_hover hover:bg-[#17181C]"
                : ""
            } flex items-center gap-4 py-2 px-4 rounded-lg transition-colors text-white w-full`}
          >
            Profile
          </Link>
        )}
      </MenuItem>
      <MenuItem>
        {({ active }) => (
          <button
            className={`${
              active
                ? "hover:text-light_mode_text_hover hover:bg-[#17181C]"
                : ""
            } flex items-center gap-4 py-2 px-4 rounded-lg transition-colors text-white w-full`}
          >
            Settings
          </button>
        )}
      </MenuItem>
      <div className="" />
      <MenuItem>
        {({ active }) => (
          <Link
            onClick={() => {
              dispatch(cleanCredentials());
            }}
            to="/auth"
            className={`${
              active
                ? "hover:text-light_mode_text_hover hover:bg-[#17181C]"
                : ""
            } flex items-center gap-4 py-2 px-4 rounded-lg transition-colors text-white w-full`}
          >
            Log Out
          </Link>
        )}
      </MenuItem>
    </MenuItems>
  </Menu>
);

export default Header;
