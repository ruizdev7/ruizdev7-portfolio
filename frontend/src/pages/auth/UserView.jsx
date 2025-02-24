import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Overview from "../../components/auth/Overview";
import Security from "../../components/auth/Security";
import EventsLogs from "../../components/auth/EventsLogs";
import { RiPencilLine } from "react-icons/ri";

import google_icon from "../../assets/icons/google-icon.svg";
import github_icon from "../../assets/icons/github.svg";
import slack_icon from "../../assets/icons/slack-icon.svg";

const UserView = () => {
  const [activeComponent, setActiveComponent] = useState("Overview");

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

  const renderComponent = () => {
    switch (activeComponent) {
      case "Overview":
        return <Overview />;
      case "Security":
        return <Security />;
      case "EventsLogs":
        return <EventsLogs />;
      default:
        return <Overview />;
    }
  };

  return (
    <>
      <section className="container mx-auto dark:bg-bg_dark_mode p-5 rounded-lg">
        <div className="grid grid-cols-12 gap-5">
          {/** Header for every section */}
          <div className="col-span-12">
            <div className="py-5">
              <h1 className="text-neutral-900 dark:text-neutral-100 text-lg tracking-wide">
                View User Details
              </h1>
              <h2 className="text-neutral-700 dark:text-neutral-300 text-base tracking-wide">
                Latest Articles, News & Updates
              </h2>
            </div>
          </div>

          <div className="col-span-12">
            <div className="grid grid-cols-12 gap-5">
              <div className="row-span-3 w-full col-span-12 md:col-span-3 flex flex-col items-center justify-center p-5 dark:bg-bg_card_dark_mode rounded-lg">
                <img
                  src={
                    userInfo.avatarUrl ||
                    "https://avatars.githubusercontent.com/u/62305538?v=4"
                  }
                  width={100}
                  className="rounded-full"
                />
                <div className="mt-4 flex flex-col items-center justify-between gap-2">
                  <h2 className=" text-gray-400 font-normal">
                    {userInfo.full_name || "Joseph Ruiz"}
                  </h2>
                  <h2 className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                    {userInfo.role || "Administrator"}
                  </h2>
                </div>

                <div className="w-full mt-2 flex flex-col justify-between gap-1">
                  <div>
                    <p className="text-sm text-left text-white font-normal">
                      CCN
                    </p>
                    <h2 className="text-sm text-left text-gray-400 font-light">
                      {userInfo.ccn_user || "Undefined"}
                    </h2>
                  </div>
                </div>

                <div className="w-full flex flex-col justify-between gap-1">
                  <div>
                    <p className="text-sm text-left text-white font-normal">
                      Account ID
                    </p>
                    <h2 className="text-sm text-left text-gray-400 font-light">
                      {account_id || "Undefined"}
                    </h2>
                  </div>
                </div>

                <div className="w-full flex flex-col justify-between gap-1">
                  <div>
                    <p className="text-sm text-left text-white font-normal">
                      Email
                    </p>
                    <h2 className=" text-sm text-left text-gray-400 font-light">
                      {userInfo.email || "Undefined"}
                    </h2>
                  </div>
                </div>

                <div className="w-full flex flex-col justify-between gap-1">
                  <div>
                    <p className="text-sm text-left text-white font-normal">
                      Created At
                    </p>
                    <h2 className=" text-sm text-left text-gray-400 font-light">
                      {userInfo.created_at || "Undefined"}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="min-h-full col-span-12 md:col-start-4 md:col-span-9 p-5 dark:bg-bg_card_dark_mode rounded-lg">
                <div className="">
                  <h2 className="text-white">Connected Accounts</h2>
                  {/* Add your Security component content here */}
                </div>
                <div className="my-5 border border-dashed border-blue-500 rounded-lg">
                  <p className="bg-bg_icons_dark_mode p-5 text-sm text-gray-400 font-light rounded-lg">
                    By connecting an account, you hereby agree to our{" "}
                    <span className="flex items-center gap-2">
                      Terms and Conditions{" "}
                      <Link
                        to="/auth/terms-and-conditions"
                        className="text-primary hover:text-blue-500 hover:font-extrabold transition-colors"
                      >
                        Click Here!
                      </Link>
                    </span>
                  </p>
                </div>

                <div className="my-5">
                  <div className="w-full flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-1">
                      <div className="text-sm text-left text-white font-normal w-[100px]">
                        <img src={google_icon} />
                      </div>
                      <h2 className="text-sm text-left text-gray-400 font-light flex-grow">
                        {userInfo.email || "Undefined"}
                      </h2>
                      <button className="hover:bg-bg_icons_dark_mode hover:text-blue-500 rounded-lg p-1">
                        <RiPencilLine className="text-gray-500 w-[25px] h-[25px] hover:text-blue-500" />
                      </button>
                    </div>
                  </div>

                  <hr className="my-3 h-0.5 border-t border-dashed border-gray-400" />

                  <div className="w-full flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-1">
                      <div className="text-sm text-left text-white font-normal w-[100px]">
                        <img src={github_icon} />
                      </div>
                      <h2 className="text-sm text-left text-gray-400 font-light flex-grow">
                        {userInfo.email || "Undefined"}
                      </h2>
                      <button className="hover:bg-bg_icons_dark_mode hover:text-blue-500 rounded-lg p-1">
                        <RiPencilLine className="text-gray-500 w-[25px] h-[25px] hover:text-blue-500" />
                      </button>
                    </div>
                  </div>

                  <hr className="my-3 h-0.5 border-t border-dashed border-gray-400" />

                  <div className="w-full flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-1">
                      <div className="text-sm text-left text-white font-normal w-[100px]">
                        <img src={slack_icon} />
                      </div>
                      <h2 className="text-sm text-left text-gray-400 font-light flex-grow">
                        {userInfo.email || "Undefined"}
                      </h2>
                      <button className="hover:bg-bg_icons_dark_mode hover:text-blue-500 rounded-lg p-1">
                        <RiPencilLine className="text-gray-500 w-[25px] h-[25px] hover:text-blue-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-12 md:col-span-9 max-h-10 rounded-lg">
                <div className="flex flex-row justify-between">
                  <div className="flex gap-4">
                    <button
                      className={`p-2 border-b-2 ${
                        activeComponent === "Overview"
                          ? "text-blue-500 border-blue-500"
                          : "text-gray-400 border-transparent hover:text-blue-500 hover:border-blue-500"
                      }`}
                      onClick={() => setActiveComponent("Overview")}
                    >
                      Overview
                    </button>
                    <button
                      className={`p-2 border-b-2 ${
                        activeComponent === "Security"
                          ? "text-blue-500 border-blue-500"
                          : "text-gray-400 border-transparent hover:text-blue-500 hover:border-blue-500"
                      }`}
                      onClick={() => setActiveComponent("Security")}
                    >
                      Security
                    </button>
                    <button
                      className={`p-2 border-b-2 ${
                        activeComponent === "EventsLogs"
                          ? "text-blue-500 border-blue-500"
                          : "text-gray-400 border-transparent hover:text-blue-500 hover:border-blue-500"
                      }`}
                      onClick={() => setActiveComponent("EventsLogs")}
                    >
                      Events & Logs
                    </button>
                  </div>

                  <div>
                    <button
                      className="text-white bg-primary p-2 hover:bg-primary/90"
                      onClick={() => {
                        /* Add functionality to create a new user */
                      }}
                    >
                      Actions
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-span-12 md:col-start-4 md:col-span-9 p-5 dark:bg-bg_card_dark_mode rounded-lg">
                <div className="">{renderComponent()}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default UserView;
