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
      <header className="bg-light_mode_2 dark:bg-dark_mode_sidebar h-[7vh] md:h-[7vh] p-6 flex items-center justify-center">
        <button onClick={toggleDarkMode}>
          <RiEmphasisCn className="p-2 text-[#B5B7C8] hover:text-light_mode_text_hover rounded-xl h-[40px] w-[40px]" />
        </button>

        <button onClick={toggleDarkMode}>
          {isDarkMode ? (
            <RiSunLine className="p-2 text-[#B5B7C8] hover:text-light_mode_text_hover rounded-xl h-[40px] w-[40px]" />
          ) : (
            <RiMoonLine className="p-2 text-[#B5B7C8] hover:text-light_mode_text_hover rounded-xl h-[40px] w-[40px]" />
          )}
        </button>

        <Link to="https://www.linkedin.com/in/ruizdev7/" target="blank">
          <RiLinkedinBoxLine className="p-2 text-[#B5B7C8] hover:text-light_mode_text_hover rounded-xl h-[40px] w-[40px]" />
        </Link>

        <Link to="https://github.com/ruizdev7" target="blank">
          <RiGithubFill className="p-2 text-[#B5B7C8] hover:text-light_mode_text_hover rounded-xl h-[40px] w-[40px]" />
        </Link>

        <Link to="https://x.com/ruizdev7" target="blank">
          <RiTwitterXLine className="p-2 text-[#B5B7C8] hover:text-light_mode_text_hover rounded-xl h-[40px] w-[40px]" />
        </Link>
      </header>
    </>
  );
};

export default Header;
