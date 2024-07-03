import React from "react";

import PortfolioPic from "../../assets/img/Profile_Picture_Portfolio.png";

import CSS_skills from "../../assets/icons/css.webp";
import vite_skills from "../../assets/icons/vite.jpeg";
import html_skills from "../../assets/icons/html5.webp";
import flask_skills from "../../assets/icons/flask.png";
import mysql_skills from "../../assets/icons/mysql.png";
import react_skills from "../../assets/icons/react.webp";
import github_skills from "../../assets/icons/github.png";
import docker_skills from "../../assets/icons/docker.jpeg";
import JavaScript_skills from "../../assets/icons/js.webp";
import python_skills from "../../assets/icons/python.webp";
import django_skills from "../../assets/icons/django.webp";
import postman_skills from "../../assets/icons/postman.png";
import powerbi_skills from "../../assets/icons/power_bi.png";
import postgres_skills from "../../assets/icons/postgre.jpeg";
import ubuntu_linux_skills from "../../assets/icons/ubuntu.png";
import bootstrap_skills from "../../assets/icons/bootstrap.webp";
import tailwindcss_skills from "../../assets/icons/tailwind.webp";
import reduxtoolkitquery_skills from "../../assets/icons/rtk.webp";
import sqlalchemy_skills from "../../assets/icons/sqlalchemy.webp";
import docker_compose_skills from "../../assets/icons/docker_compose.png";

const Home = () => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 bg-light_mode_2 dark:bg-dark_mode_2 rounded-2xl items-center">
        <div className="col-span-1 md:col-span-3 lg:col-span-6 rounded-xl p-6">
          <div className="flex items-center">
            <div>
              <h1 className="text-light_mode_title_text dark:text-dark_mode_content_text font-extrabold text-2xl">
                Hi, I'm <span className="text-3xl">Joseph</span>
              </h1>
              <p className="text-gray-400">Backend Developer - Data Analyst</p>
            </div>
          </div>

          <div className="my-4">
            <h2 className="text-light_mode_title_text dark:text-dark_mode_content_text font-extrabold text-2xl">
              Passionate to pursue the technology.
            </h2>
            <p className="text-gray-400 text-justify">
              I enjoy learning new things and try to overcome new challenges
              while analyzing how I improved through them. Colombian based in
              Warsaw, Poland. I have more than three years of experience as an
              information systems analyst and developer, the skills necessary to
              carry out the process of developing web solutions from conception
              to putting them into production.
            </p>
          </div>
        </div>

        <div className="col-span-1 md:col-span-3 lg:col-span-6 rounded-xl p-6 place-content-center">
          <div className="flex justify-center items-center rounded-2xl">
            <img
              style={{ maskImage: "linear-gradient(black 80%, transparent)" }}
              src={PortfolioPic}
              className="md:w-full md:h-[300px] md:object-scale-down"
            />
          </div>
        </div>

        <div className="col-span-1 md:col-span-6 lg:col-span-12 rounded-xl p-6">
          <h3 className="text-light_mode_title_text dark:text-dark_mode_content_text font-extrabold text-2xl">
            Backend Technologies
          </h3>

          <div className="p-6 w-full rounded-lg flex flex-wrap gap-4">
            <div className="flex flex-col justify-center items-center grow">
              <img
                className="w-[80px] h-[80px] object-cover"
                src={python_skills}
                alt=""
              />
            </div>
            <div className="flex flex-col justify-center items-center grow">
              <img
                className="w-[180px] h-[80px] object-cover rounded-lg"
                src={django_skills}
                alt=""
              />
            </div>

            <div className="flex flex-col justify-center items-center grow">
              <img
                className="w-[220px] h-[80px] object-cover rounded-lg"
                src={flask_skills}
                alt=""
              />
            </div>

            <div className="flex flex-col justify-center items-center grow">
              <img
                className="w-[220px] h-[80px] object-cover rounded-lg"
                src={postman_skills}
                alt=""
              />
            </div>
            <div className="flex flex-col justify-center items-center grow">
              <img
                className="w-[220px] h-[80px] object-cover rounded-lg"
                src={ubuntu_linux_skills}
                alt=""
              />
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-6 lg:col-span-12 rounded-xl p-6">
          <h2 className="text-light_mode_title_text dark:text-dark_mode_content_text font-extrabold text-2xl">
            Database Engines
          </h2>

          <div className="p-6 w-full rounded-lg flex flex-wrap gap-4 items-center">
            <div className="flex flex-col justify-center items-center grow">
              <img
                className="w-[170px] h-[80px] object-contain rounded-xl"
                src={mysql_skills}
                alt=""
              />
            </div>
            <div className="flex flex-col justify-center items-center grow">
              <img
                className="w-[150px] h-[80px] object-contain rounded-lg"
                src={postgres_skills}
                alt=""
              />
            </div>
            <div className="flex flex-col justify-center items-center grow">
              <img
                className="w-[150px] h-[80px] object-contain rounded-lg"
                src={sqlalchemy_skills}
                alt=""
              />
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-6 lg:col-span-12 rounded-xl p-6">
          <h3 className="text-light_mode_title_text dark:text-dark_mode_content_text font-extrabold text-2xl">
            Frontend Technologies
          </h3>
          <div className="p-6 w-full rounded-lg flex flex-wrap gap-4">
            <div className="flex flex-col justify-center items-center grow">
              <img
                className="w-[80px] h-[80px] object-cover"
                src={JavaScript_skills}
                alt=""
              />
            </div>
            <div className="flex flex-col justify-center items-center grow">
              <img
                className="w-[80px] h-[80px] object-cover"
                src={html_skills}
                alt=""
              />
            </div>
            <div className="flex flex-col justify-center items-center grow">
              <img
                className="w-[80px] h-[80px] object-cover"
                src={CSS_skills}
                alt=""
              />
            </div>
            <div className="flex flex-col justify-center items-center grow">
              <img
                className="w-[80px] h-[80px] object-contain"
                src={tailwindcss_skills}
                alt=""
              />
            </div>
            <div className="flex flex-col justify-center items-center grow">
              <img
                className="w-[80px] h-[80px] object-cover"
                src={bootstrap_skills}
                alt=""
              />
            </div>

            <div className="flex flex-col justify-center items-center grow">
              <img
                className="w-[80px] h-[80px] object-cover"
                src={react_skills}
                alt=""
              />
            </div>
            <div className="flex flex-col justify-center items-center grow">
              <img
                className="w-[80px] h-[80px] object-contain"
                src={reduxtoolkitquery_skills}
                alt=""
              />
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-6 lg:col-span-12 rounded-xl p-6">
          <h3 className="text-light_mode_title_text dark:text-dark_mode_content_text font-extrabold text-2xl">
            Others Technologies
          </h3>
          <div className="p-6 w-full rounded-lg flex flex-wrap gap-4">
            <div className="flex flex-col justify-center items-center grow">
              <img
                className="w-[80px] h-[80px] object-cover"
                src={vite_skills}
                alt=""
              />
            </div>
            <div className="flex flex-col justify-center items-center grow">
              <img
                className="w-[300px] h-[80px] object-cover rounded-lg"
                src={github_skills}
                alt=""
              />
            </div>
            <div className="flex flex-col justify-center items-center grow">
              <img
                className="w-[80px] h-[80px] object-cover"
                src={docker_skills}
                alt=""
              />
            </div>
            <div className="flex flex-col justify-center items-center grow">
              <img
                className="w-[300px] h-[80px] object-contain rounded-lg"
                src={docker_compose_skills}
                alt=""
              />
            </div>
            <div className="flex flex-col justify-center items-center grow">
              <img
                className="w-[80px] h-[80px] object-cover"
                src={powerbi_skills}
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

/* 
 sm	640px	@media (min-width: 640px) { ... }
 md	768px	@media (min-width: 768px) { ... }
 lg	1024px	@media (min-width: 1024px) { ... }
 xl	1280px	@media (min-width: 1280px) { ... }
 2xl	1536px	@media (min-width: 1536px) { ... }
 */
