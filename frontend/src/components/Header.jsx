import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <header className="dark:bg-dark_mode_sidebar h-14 md:h-16 p-4 flex justify-between items-center">
      <div>
        <div className="flex items-center justify-center ml-[10px]">
          <div className="group flex items-center space-x-3 hover:scale-105 transition-transform">
            {/* Texto con gradiente */}
            <h1 className="text-xl md:text-2xl font-normal bg-gradient-to-r from-[#B3C7FF] to-[#B3C7FF] bg-clip-text text-transparent">
              ruizdev7
            </h1>
          </div>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-2">
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

      <UserMenu />
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
              active ? "bg-gray-100 dark:bg-gray-700" : ""
            } w-full text-left px-4 py-2 rounded-md text-gray-900 dark:text-gray-100 block`}
          >
            Profile
          </Link>
        )}
      </MenuItem>
      <MenuItem>
        {({ active }) => (
          <button
            className={`${
              active ? "bg-gray-100 dark:bg-gray-700" : ""
            } w-full text-left px-4 py-2 rounded-md text-gray-900 dark:text-gray-100`}
          >
            Settings
          </button>
        )}
      </MenuItem>
      <div className="border-t my-1 dark:border-gray-700" />
      <MenuItem>
        {({ active }) => (
          <button
            className={`${
              active ? "bg-gray-100 dark:bg-gray-700" : ""
            } w-full text-left px-4 py-2 rounded-md text-red-600 dark:text-red-400`}
          >
            Logout
          </button>
        )}
      </MenuItem>
    </MenuItems>
  </Menu>
);

export default Header;
