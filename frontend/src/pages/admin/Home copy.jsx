import React from "react";
import { TbBrandPython } from "react-icons/tb";

import SoftSkillsCarrousel from "../../components/SoftSkillsCarrousel";

import mysql_skills from "../../assets/img/mysql_skills.png";
import flask_skills from "../../assets/img/flask_skills.png";
import python_skills from "../../assets/img/python_skills.png";
import Flag_of_Poland from "../../assets/img/Flag_of_Poland.png";
import PortfolioPic from "../../assets/img/Profile_Picture_Portfolio.jpeg";

const Home = () => {
  return (
    <>
      <div className="bg-gray-100 grid grid-cols-1 lg:grid-cols-2 grid-row-start-1 grid-row-span-2">
        <div className="">
          <div className="bg-white rounded-lg shadow-md shadow-slate-500 flex flex-col items-center justify-center h-full">
            <h1 className="p-3 my-[2px] font-bold text-2xl lg:text-3xl tracking-wider">
              Welcome to my portfolio
            </h1>
            <h2 className="my-[2px] text-2xl font-bold tracking-wider">
              Python Backend Developer
            </h2>
            <p className="my-[2px] text-base tracking-widerest">
              I'm
              <span className="text-primary font-semibold text-xl">
                {" "}
                Joseph Ruiz
              </span>{" "}
              Colombian based in Warsaw, Poland.
              <img src={Flag_of_Poland} alt="" />
            </p>
            <div className="w-[200px] rounded-lg object-fill">
              <img src={PortfolioPic} alt="" />
            </div>
            <p className="p-3 mt-[10px] text-base tracking-widerest">
              I have more than three years of experience as an information
              systems analyst and developer, the skills necessary to carry out
              the process of developing web solutions from conception to putting
              them into production.
            </p>

            <div>
              <h3 className="font-bold text-3xl text-primary tracking-wider">
                Technologies
              </h3>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-6 my-[20px] gap-4">
              <div className="p-3 bg-gray-100 w-[80px] h-[80px] rounded-lg shadow-lg shadow-gray-500 hover:translate-y-1">
                <img
                  className="w-[60px] h-[60px] object-contain flex flex-col justify-center items-center"
                  src={python_skills}
                  alt=""
                />
              </div>
              <div className="p-3 bg-gray-100 w-[80px] h-[80px] rounded-lg shadow-lg shadow-gray-500">
                <img
                  className="w-[60px] h-[60px] object-contain flex flex-col justify-center items-center"
                  src={mysql_skills}
                  alt=""
                />
              </div>
              <div className="p-3 bg-gray-100 w-[80px] h-[80px] rounded-lg shadow-lg shadow-gray-500">
                <img
                  className="w-[60px] h-[60px] object-contain flex flex-col justify-center items-center"
                  src={flask_skills}
                  alt=""
                />
              </div>
              <div className="p-3 bg-gray-100 w-[80px] h-[80px] rounded-lg shadow-lg shadow-gray-500">
                <img
                  className="w-[60px] h-[60px] object-contain flex flex-col justify-center items-center"
                  src={flask_skills}
                  alt=""
                />
              </div>
              <div className="p-3 bg-gray-100 w-[80px] h-[80px] rounded-lg shadow-lg shadow-gray-500 hover:translate-y-1">
                <img
                  className="w-[60px] h-[60px] object-contain flex flex-col justify-center items-center"
                  src={python_skills}
                  alt=""
                />
              </div>
              <div className="p-3 bg-gray-100 w-[80px] h-[80px] rounded-lg shadow-lg shadow-gray-500 hover:translate-y-1">
                <img
                  className="w-[60px] h-[60px] object-contain flex flex-col justify-center items-center"
                  src={python_skills}
                  alt=""
                />
              </div>
              <div className="p-3 bg-gray-100 w-[80px] h-[80px] rounded-lg shadow-lg shadow-gray-500 hover:translate-y-1">
                <img
                  className="w-[60px] h-[60px] object-contain flex flex-col justify-center items-center"
                  src={python_skills}
                  alt=""
                />
              </div>
              <div className="p-3 bg-gray-100 w-[80px] h-[80px] rounded-lg shadow-lg shadow-gray-500 hover:translate-y-1">
                <img
                  className="w-[60px] h-[60px] object-contain flex flex-col justify-center items-center"
                  src={python_skills}
                  alt=""
                />
              </div>
              <div className="p-3 bg-gray-100 w-[80px] h-[80px] rounded-lg shadow-lg shadow-gray-500 hover:translate-y-1">
                <img
                  className="w-[60px] h-[60px] object-contain flex flex-col justify-center items-center"
                  src={python_skills}
                  alt=""
                />
              </div>
              <div className="p-3 bg-gray-100 w-[80px] h-[80px] rounded-lg shadow-lg shadow-gray-500 hover:translate-y-1">
                <img
                  className="w-[60px] h-[60px] object-contain flex flex-col justify-center items-center"
                  src={python_skills}
                  alt=""
                />
              </div>
              <div className="p-3 bg-gray-100 w-[80px] h-[80px] rounded-lg shadow-lg shadow-gray-500 hover:translate-y-1">
                <img
                  className="w-[60px] h-[60px] object-contain flex flex-col justify-center items-center"
                  src={python_skills}
                  alt=""
                />
              </div>
              <div className="p-3 bg-gray-100 w-[80px] h-[80px] rounded-lg shadow-lg shadow-gray-500 hover:translate-y-1">
                <img
                  className="w-[60px] h-[60px] object-contain flex flex-col justify-center items-center"
                  src={python_skills}
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <SoftSkillsCarrousel />
        </div>
      </div>
    </>
  );
};

export default Home;
