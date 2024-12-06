import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { RiNotification3Line, RiArrowDownSLine } from "react-icons/ri";
import {
  RiSunLine,
  RiMoonLine,
  RiEmphasisCn,
  RiLinkedinBoxLine,
  RiGithubFill,
  RiTwitterXLine,
} from "react-icons/ri";

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <>
      <header className="hover hover:borber hover:border-red-700 bg-light_mode_2 dark:bg-dark_mode_2 h-[7vh] md:h-[10vh] p-6 flex items-center justify-center">
        <div className="">
          <button onClick={toggleDarkMode}>
            <RiEmphasisCn className="p-2 text-gray-500 rounded-xl h-[40px] w-[40px]" />
          </button>
        </div>

        <div className="">
          <button onClick={toggleDarkMode}>
            {isDarkMode ? (
              <RiSunLine className="p-2 text-gray-500 rounded-xl h-[40px] w-[40px]" />
            ) : (
              <RiMoonLine className="p-2 text-gray-500 rounded-xl h-[40px] w-[40px]" />
            )}
          </button>
        </div>

        <Link to="https://www.linkedin.com/in/ruizdev7/" target="blank">
          <RiLinkedinBoxLine className="p-2 text-gray-500 rounded-xl h-[40px] w-[40px]" />
        </Link>

        <Link to="https://github.com/ruizdev7" target="blank">
          <RiGithubFill className="p-2 text-gray-500 rounded-xl h-[40px] w-[40px]" />
        </Link>

        <Link to="https://x.com/ruizdev7" target="blank">
          <RiTwitterXLine className="p-2 text-gray-500 rounded-xl h-[40px] w-[40px]" />
        </Link>
      </header>
    </>
  );
};

export default Header;
