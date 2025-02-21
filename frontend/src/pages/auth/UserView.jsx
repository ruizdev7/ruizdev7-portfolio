import React, { useState } from "react";
import { Link } from "react-router-dom";
import Overview from "../../components/auth/Overview";
import Security from "../../components/auth/Security";
import EventsLogs from "../../components/auth/EventsLogs";

const UserView = () => {
  const [activeComponent, setActiveComponent] = useState("Overview");

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
      <section className="container mx-auto max-w-7xl bg-[#17181C] p-6 rounded-lg">
        <div className="grid grid-cols-12 justify-evenly gap-4">
          <div className="col-span-12">
            <div className="p-5">
              <h1 className=" text-white text-lg tracking-wide">
                View User Details
              </h1>
              <h2 className=" text-white text-base tracking-wide">
                Latest Articles, News & Updates
              </h2>
            </div>
          </div>

          <div className="col-span-12">
            <div className="grid grid-cols-12 gap-4">
              <div className=" col-span-12 bg-[#0F1014] w-full p-4 rounded-lg">
                <div className="flex flex-col items-center rounded-full">
                  <img
                    src="https://avatars.githubusercontent.com/u/62305538?v=4"
                    width={100}
                    height={100}
                    className="rounded-full"
                  />
                  <h1>Joseph Ruiz</h1>
                  <h2>Administrator</h2>
                </div>
              </div>

              <div className="col-span-6 bg-blue-400 w-full p-4 rounded-lg">
                <button onClick={() => setActiveComponent("Overview")}>
                  Overview
                </button>
                <button onClick={() => setActiveComponent("Security")}>
                  Security
                </button>
                <button onClick={() => setActiveComponent("EventsLogs")}>
                  Events & Logs
                </button>
              </div>
            </div>
          </div>

          <div className="col-span-12"></div>
        </div>
      </section>
      <div className="">{renderComponent()}</div>

      <div className="bg-neutral-100 dark:bg-neutral-900 p-6 rounded-lg shadow-lg">
        <h2 className="text-neutral-900 dark:text-neutral-100 text-xl font-bold">
          Título
        </h2>
        <p className="text-neutral-700 dark:text-neutral-300 mt-2">
          Contenido que cambia con el tema
        </p>
        <button className="bg-primary text-white px-4 py-2 mt-4 rounded hover:bg-primary/90">
          Botón
        </button>
      </div>
    </>
  );
};

export default UserView;
