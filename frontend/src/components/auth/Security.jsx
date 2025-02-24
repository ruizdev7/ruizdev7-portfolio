import React from "react";
import { useSelector } from "react-redux";
import { RiPencilLine } from "react-icons/ri";

const Security = () => {
  const userInfo = useSelector(
    (state) => state.auth.current_user.user_info || {}
  );

  const account_id = useSelector((state) => state.auth.current_user.account_id);

  const truncateString = (str, num) => {
    if (str.length <= num) {
      return str;
    }
    return str.slice(0, num) + "...";
  };

  return (
    <>
      <div className="">
        <h2 className="text-white">Profile</h2>
        {/* Add your Security component content here */}
      </div>
      <div className="my-5">
        <div className="w-full flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <p className="text-sm text-left text-white font-normal w-[100px]">
              Email
            </p>
            <h2 className="text-sm text-left text-gray-400 font-light flex-grow">
              {userInfo.email || "Undefined"}
            </h2>
            <button className="hover:bg-bg_icons_dark_mode hover:text-blue-500 rounded-lg p-1">
              <RiPencilLine className="text-gray-500 w-[25px] h-[25px] hover:text-blue-500" />
            </button>
          </div>
        </div>
        <hr className="my-3 h-0.5 border-t border-dashed border-gray-400" />
        <div className="w-full flex flex-col justify-between gap-1">
          <div className="flex items-center justify-between gap-1">
            <p className="text-sm text-left text-white font-normal w-[100px]">
              Password
            </p>
            <h2 className="text-sm text-left text-gray-400 font-light flex-grow">
              {truncateString(userInfo.password || "Undefined", 20)}
            </h2>
            <button className="hover:bg-bg_icons_dark_mode hover:text-blue-500 rounded-lg p-1">
              <RiPencilLine className="text-gray-500 w-[25px] h-[25px] hover:text-blue-500" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Security;
