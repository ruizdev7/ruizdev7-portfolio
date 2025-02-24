import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Overview from "../../components/auth/Overview";
import Security from "../../components/auth/Security";
import EventsLogs from "../../components/auth/EventsLogs";

const UserView = () => {
  const [activeComponent, setActiveComponent] = useState("Overview");
  const userInfo = useSelector(
    (state) => state.auth.current_user.user_info || {}
  );

  console.log(userInfo);

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
        <div className="grid grid-cols-12">
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
            <div className="grid grid-cols-12 gap-y-5">
              <div className="row-span-2 w-full col-span-12 md:col-span-3 flex flex-col items-center justify-center p-5 dark:bg-bg_card_dark_mode rounded-lg">
                <img
                  src={
                    userInfo.avatarUrl ||
                    "https://avatars.githubusercontent.com/u/62305538?v=4"
                  }
                  width={100}
                  className="rounded-full"
                />
                <div className="mt-4 flex flex-col items-center justify-between gap-2">
                  <h2 className=" text-gray-400 font-semibold">
                    {userInfo.full_name || "Joseph Ruiz"}
                  </h2>
                  <h2 className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                    {userInfo.role || "Administrator"}
                  </h2>
                </div>
                <div className="w-full mt-4 flex flex-col justify-between gap-1 p-2">
                  <div>
                    <p className="text-left text-white">
                      CCN Consecutive Code Number
                    </p>
                    <h2 className=" text-gray-400">
                      {userInfo.ccn_user || "Undefined"}
                    </h2>
                  </div>
                </div>
                <div className="w-full flex flex-col justify-between gap-1 p-2">
                  <div>
                    <p className="text-left text-white">Email</p>
                    <h2 className=" text-gray-400">
                      {userInfo.email || "Undefined"}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="col-span-12 md:col-span-9 w-full rounded-lg">
                <div className="flex flex-row justify-between">
                  <div>
                    <button
                      className={`text-white p-2 rounded-lg ${
                        activeComponent === "Overview"
                          ? "bg-primary"
                          : "bg-secondary"
                      }`}
                      onClick={() => setActiveComponent("Overview")}
                    >
                      Overview
                    </button>
                    <button
                      className={`text-white p-2 rounded-lg ${
                        activeComponent === "Security"
                          ? "bg-primary"
                          : "bg-secondary"
                      }`}
                      onClick={() => setActiveComponent("Security")}
                    >
                      Security
                    </button>
                    <button
                      className={`text-white p-2 rounded-lg ${
                        activeComponent === "EventsLogs"
                          ? "bg-primary"
                          : "bg-secondary"
                      }`}
                      onClick={() => setActiveComponent("EventsLogs")}
                    >
                      Events & Logs
                    </button>
                  </div>

                  <div>
                    <button
                      className="text-white bg-primary p-2 rounded-lg hover:bg-primary/90"
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
