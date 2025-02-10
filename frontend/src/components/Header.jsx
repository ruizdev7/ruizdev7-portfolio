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
import {} from "../RTK_Query_app/services/user/userApi";

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
      <header className=" dark:bg-dark_mode_sidebar h-[55px] md:h-[63px] lg:h-[63px] p-6 flex items-center justify-center">
        <button onClick={toggleDarkMode}>
          {isDarkMode ? (
            <RiSunLine className="p-2 text-[#B5B7C8] hover:text-light_mode_text_hover hover:bg-[#17181C] transition-colors h-[40px] w-[40px] rounded" />
          ) : (
            <RiMoonLine className="p-2 text-[#B5B7C8] hover:text-light_mode_text_hover hover:bg-[#17181C] transition-colors h-[40px] w-[40px] rounded" />
          )}
        </button>

        <Link to="https://www.linkedin.com/in/ruizdev7/" target="blank">
          <RiLinkedinBoxLine className="p-2 text-[#B5B7C8] hover:text-light_mode_text_hover hover:bg-[#17181C] transition-colors h-[40px] w-[40px] rounded" />
        </Link>

        <Link to="https://github.com/ruizdev7" target="blank">
          <RiGithubFill className="p-2 text-[#B5B7C8] hover:text-light_mode_text_hover hover:bg-[#17181C] transition-colors h-[40px] w-[40px] rounded" />
        </Link>

        <Link to="https://x.com/ruizdev7" target="blank">
          <RiTwitterXLine className="p-2 text-[#B5B7C8] hover:text-light_mode_text_hover hover:bg-[#17181C] transition-colors h-[40px] w-[40px] rounded" />
        </Link>
        <Link
          to="http://localhost:4321/blog/"
          target="blank"
          className="p-2 text-[#B5B7C8] hover:text-light_mode_text_hover hover:bg-[#17181C] transition-colors h-[40px] w-[60px] text-base hover:font-extrabold rounded"
        >
          Blog
        </Link>
      </header>
    </>
  );
};

export default Header;
