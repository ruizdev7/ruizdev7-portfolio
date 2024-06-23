import React from "react";
import CSS_skills from "../../assets/img/CSS_skills.jpg";
import vite_skills from "../../assets/img/vite_skills.png";
import html_skills from "../../assets/img/html_skills.png";
import react_skills from "../../assets/img/react_skills.png";
import flask_skills from "../../assets/img/flask_skills.png";
import github_skills from "../../assets/img/github_skills.png";
import docker_skills from "../../assets/img/docker_skills.png";
import postman_skills from "../../assets/img/postman_skills.png";
import powerbi_skills from "../../assets/img/powerbi_skills.png";
import python_skills from "../../assets/img/python-svgrepo-com.svg";
import bootstrap_skills from "../../assets/img/bootstrap_skills.png";
import JavaScript_skills from "../../assets/img/JavaScript_skills.png";
import mysql_skills from "../../assets/img/mysql-logo-svgrepo-com.svg";
import tailwindcss_skills from "../../assets/img/tailwindcss_skills.png";
import PortfolioPic from "../../assets/img/Profile_Picture_Portfolio.jpeg";
import ubontu_linux_skills from "../../assets/img/ubontu_linux_skills.webp";
import docker_compose_skills from "../../assets/img/docker_compose_skills.jpeg";
import reduxtoolkitquery_skills from "../../assets/img/reduxtoolkitquery_skills.png";
import sqlalchemy_skills from "../../assets/img/sqlalchemy-logo-4B94AE45D9-seeklogo.com.png";

const Home = () => {
  return (
    <>
      <div className="container w-full h-full mx-auto p-5 my-[20px]">
        <h1 className="text-start text-5xl text-steel-blue-950 font-bold my-[10px]">
          Welcome to my Portfolio
        </h1>
        <h2 className="mt-[40px] text-center text-2xl text-[#16191F] font-bold">
          Python Backend Developer
        </h2>
        <div className="text-center font-normal mt-[10px]">
          I'm
          <span className="text-primary font-bold text-3xl">
            {" "}
            Joseph Ruiz
          </span>{" "}
          <p className="mt-[20px] text-normal tracking-widest">
            Colombian based in Warsaw, Poland. I have more than three years of
            experience as an information systems analyst and developer, the
            skills necessary to carry out the process of developing web
            solutions from conception to putting them into production.
          </p>
        </div>
        <div className="flex flex-wrap lg:flex lg:flex-cols-2 my-[20px] mx-5 justify-evenly items-center">
          <div className="p-4">
            <div className="w-[200px] rounded-lg object-fill">
              <img src={PortfolioPic} alt="" />
            </div>
          </div>

          <div className="w-[700px] p-8 bg-white rounded-lg">
            <h3 className="text-2xl text-[#16191F] font-semibold text-center lg:text-left">
              Backend Technologies
            </h3>

            <div className="p-8 w-full bg-white rounded-lg flex flex-wrap justify-around gap-4">
              <div className="flex flex-col justify-center items-center">
                <img
                  className="w-[80px] h-[80px] object-cover"
                  src={python_skills}
                  alt=""
                />
              </div>
              <div className="flex flex-col justify-center items-center">
                <img
                  className="w-[100px] h-[100px] object-contain flex flex-col justify-center items-center"
                  src={mysql_skills}
                  alt=""
                />
              </div>

              <div className="flex flex-col justify-center items-center">
                <img
                  className="w-[100px] h-[100px] object-contain flex flex-col justify-center items-center"
                  src={flask_skills}
                  alt=""
                />
              </div>

              <div className="flex flex-col justify-center items-center">
                <img
                  className="w-[100px] h-[100px] object-contain flex flex-col justify-center items-center"
                  src={sqlalchemy_skills}
                  alt=""
                />
              </div>

              <div className="flex flex-col justify-center items-center">
                <img
                  className="w-[100px] h-[100px] object-contain flex flex-col justify-center items-center"
                  src={postman_skills}
                  alt=""
                />
              </div>
              <div className="flex flex-col justify-center items-center">
                <img
                  className="w-[150px] h-[150px] object-contain flex flex-col justify-center items-center"
                  src={ubontu_linux_skills}
                  alt=""
                />
              </div>
            </div>

            <h3 className="text-2xl text-[#16191F] font-semibold text-center lg:text-left">
              Frontend Technologies
            </h3>

            <div className="p-8 w-full bg-white rounded-lg flex flex-wrap justify-around gap-4">
              <div className="flex flex-col justify-center items-center">
                <img
                  className="w-[80px] h-[80px] object-cover"
                  src={JavaScript_skills}
                  alt=""
                />
              </div>
              <div className="flex flex-col justify-center items-center">
                <img
                  className="w-[100px] h-[100px] object-contain flex flex-col justify-center items-center"
                  src={html_skills}
                  alt=""
                />
              </div>
              <div className="flex flex-col justify-center items-center">
                <img
                  className="w-[100px] h-[100px] object-contain flex flex-col justify-center items-center"
                  src={CSS_skills}
                  alt=""
                />
              </div>
              <div className="flex flex-col justify-center items-center">
                <img
                  className="w-[150px] h-[150px] object-contain flex flex-col justify-center items-center"
                  src={tailwindcss_skills}
                  alt=""
                />
              </div>
              <div className="flex flex-col justify-center items-center">
                <img
                  className="w-[150px] h-[150px] object-contain flex flex-col justify-center items-center"
                  src={bootstrap_skills}
                  alt=""
                />
              </div>

              <div className="flex flex-col justify-center items-center">
                <img
                  className="w-[150px] h-[150px] object-contain flex flex-col justify-center items-center"
                  src={react_skills}
                  alt=""
                />
              </div>
              <div className="flex flex-col justify-center items-center">
                <img
                  className="w-[150px] h-[150px] object-contain flex flex-col justify-center items-center"
                  src={reduxtoolkitquery_skills}
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap flex-col my-[20px] mx-5 justify-evenly items-start">
          <h3 className="text-2xl text-[#16191F] font-semibold text-center lg:text-left">
            Other Technologies
          </h3>

          <div className="p-8 w-full bg-white rounded-lg flex flex-wrap justify-around gap-4">
            <div className="flex flex-col justify-center items-center">
              <img
                className="w-[150px] h-[120px] object-cover"
                src={docker_skills}
                alt=""
              />
            </div>
            <div className="flex flex-col justify-center items-center">
              <img
                className="w-[220px] h-[200px] object-contain flex flex-col justify-center items-center"
                src={docker_compose_skills}
                alt=""
              />
            </div>
            <div className="flex flex-col justify-center items-center">
              <img
                className="w-[120px] h-[120px] object-contain flex flex-col justify-center items-center"
                src={vite_skills}
                alt=""
              />
            </div>
            <div className="flex flex-col justify-center items-center">
              <img
                className="w-[100px] h-[100px] object-contain flex flex-col justify-center items-center"
                src={powerbi_skills}
                alt=""
              />
            </div>
            <div className="flex flex-col justify-center items-center">
              <img
                className="w-[200px] h-[200px] object-contain flex flex-col justify-center items-center"
                src={github_skills}
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
