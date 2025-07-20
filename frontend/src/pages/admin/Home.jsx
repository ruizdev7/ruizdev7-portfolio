import React from "react";
import { Link } from "react-router-dom";
import { Popover } from "@headlessui/react";

const Home = () => {
  // Add this SVG icon for info (if Heroicons is not available)
  const InfoIcon = (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5 text-blue-400 hover:text-blue-600 inline-block align-middle"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.25 9.75h.008v.008h-.008V9.75zm0 3.75h.008v.008h-.008V13.5zm.75 6.75a9 9 0 100-18 9 9 0 000 18zm0-13.5v.008h.008V6.75h-.008z"
      />
    </svg>
  );

  return (
    <>
      {/* Contact section header */}
      <section className="container mx-auto px-8">
        <div className="py-5">
          <h1 className=" text-white text-3xl tracking-wide">Contact Me</h1>
          <h2 className=" text-white text-base tracking-wide">
            Let&apos;s get in touch
          </h2>
        </div>
      </section>

      {/* About Me and Software Architecture section */}
      <section className="container mx-auto max-w-screen-2xl px-6">
        <div className="grid grid-cols-12 grid-flow-row-dense gap-4 items-start">
          {/* About Me Card */}
          <div className="bg-[#23262F] rounded-md p-8 col-span-2 h-full flex flex-col justify-center items-center">
            <div className="flex items-center gap-2">
              <h3 className=" text-2xl font-bold text-gray-900 dark:text-white">
                About me
              </h3>
              <Popover className="relative">
                <Popover.Button as="button" className="focus:outline-none">
                  <InfoIcon />
                </Popover.Button>
                <Popover.Panel className="absolute z-10 w-56 p-3 bg-[#23262F] text-xs text-white rounded shadow-lg left-1/2 -translate-x-1/2 mt-2">
                  Colombian software developer based in Poland. Passionate about
                  building scalable and maintainable solutions for modern
                  businesses.
                </Popover.Panel>
              </Popover>
            </div>
            <p className="mt-4 font-normal text-gray-700 dark:text-gray-400">
              Colombian software developer based in Poland
            </p>
            <button className="mt-8 h-10 w-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white transition-colors font-semibold">
              Reach me out !!!
            </button>
          </div>
          {/* 1. Software Architecture Consulting and Cloud Solutions Implementation Card */}
          <div className="bg-[#23262F] rounded-md p-8 col-span-10 h-full flex flex-col justify-center items-center">
            <div className="flex items-center gap-2 w-full">
              <h3 className="text-xl text-start uppercase font-bold tracking-tight text-gray-900 dark:text-white">
                Software Architecture Consulting and Cloud Solutions
                Implementation
              </h3>
              <Popover className="relative">
                <Popover.Button as="button" className="focus:outline-none">
                  <InfoIcon />
                </Popover.Button>
                <Popover.Panel className="absolute z-10 w-64 p-3 bg-[#23262F] text-xs text-white rounded shadow-lg left-1/2 -translate-x-1/2 mt-2">
                  <div>
                    Design and implementation of robust, observable, and
                    scalable software architectures using AWS, Docker,
                    Prometheus, and Grafana.
                    <ul className="mt-4 list-disc list-inside space-y-2 text-xs text-white font-normal leading-relaxed pl-3">
                      <li>
                        Design of decoupled architectures: microservices,
                        serverless, clean architecture, hexagonal, or
                        event-driven designs, based on project requirements.
                      </li>
                      <li>
                        Strategic AWS adoption: selection, configuration, and
                        optimization of services such as EC2, RDS, S3, Lambda,
                        ECS, API Gateway, and CloudWatch.
                      </li>
                      <li>
                        Service containerization: Docker implementation and
                        orchestration using Docker Compose for both development
                        and production environments.
                      </li>
                      <li>
                        Observability from day one: integration of monitoring
                        and visualization tools like Prometheus and Grafana,
                        enabling traceability, real-time alerts, and key
                        performance metrics.
                      </li>
                      <li>
                        Deployment and automation strategies: consulting on
                        CI/CD pipelines, infrastructure as code, and DevOps best
                        practices.
                      </li>
                    </ul>
                  </div>
                </Popover.Panel>
              </Popover>
            </div>
          </div>
        </div>
      </section>

      {/* Second row: System Integration, AI Focus, and Web App Development */}
      <section className="container mx-auto max-w-screen-2xl px-6 my-8">
        <div className="grid grid-cols-12 grid-flow-row-dense gap-4 items-start">
          {/* 2. System Integration & Process Automation Card */}
          <div className="bg-[#23262F] rounded-md p-8 col-span-5 h-full flex flex-col justify-center items-center">
            <div className="flex items-center gap-2 w-full">
              <h3 className="text-xl text-start uppercase font-bold tracking-tight text-gray-900 dark:text-white">
                System Integration & Process Automation
              </h3>
              <Popover className="relative">
                <Popover.Button as="button" className="focus:outline-none">
                  <InfoIcon />
                </Popover.Button>
                <Popover.Panel className="absolute z-10 w-64 p-3 bg-[#23262F] text-xs text-white rounded shadow-lg left-1/2 -translate-x-1/2 mt-2">
                  <div>
                    API integration, automation of business workflows, and data
                    synchronization between legacy and modern systems.
                    <ul className="mt-4 list-disc list-inside space-y-2 text-xs text-white font-normal leading-relaxed pl-3">
                      <li>
                        API integration between internal systems and third-party
                        platforms.
                      </li>
                      <li>
                        Automation of business workflows using Python, webhooks,
                        and cloud functions.
                      </li>
                      <li>
                        Data synchronization between legacy systems and modern
                        apps.
                      </li>
                      <li>
                        Task scheduling and orchestration of background jobs.
                      </li>
                      <li>
                        Optimization of manual processes through low-code or
                        custom automation solutions.
                      </li>
                    </ul>
                  </div>
                </Popover.Panel>
              </Popover>
            </div>
          </div>
          {/* Center Bento: AI Focused Placeholder */}
          <div className="rounded-md col-span-2 h-full flex flex-col justify-between">
            <div className="flex flex-col h-full justify-between gap-4">
              {/* AI Logo Placeholder */}
              <div className="flex-1 flex items-center justify-center">
                <div className="bg-[#23262F] rounded-md flex items-center justify-center p-2 transition-transform duration-300 ease-in-out hover:scale-150 cursor-pointer">
                  <h3 className="text-8xl text-center uppercase font-bold tracking-tight text-gray-900 dark:text-white">
                    AI
                  </h3>
                </div>
              </div>
            </div>
          </div>
          {/* 3. Modern and Scalable Web Application Development Card */}
          <div className="bg-[#23262F] rounded-md p-8 col-span-5 h-full flex flex-col justify-center items-center">
            <div className="flex items-center gap-2 w-full">
              <h3 className="text-xl text-start uppercase font-bold tracking-tight text-gray-900 dark:text-white">
                Modern and Scalable Web Application Development
              </h3>
              <Popover className="relative">
                <Popover.Button as="button" className="focus:outline-none">
                  <InfoIcon />
                </Popover.Button>
                <Popover.Panel className="absolute z-10 w-64 p-3 bg-[#23262F] text-xs text-white rounded shadow-lg left-1/2 -translate-x-1/2 mt-2">
                  <div>
                    Full stack web development using React, Tailwind, Redux
                    Toolkit, Flask, Django, and FastAPI. Modern, maintainable,
                    and scalable solutions.
                    <ul className="mt-4 list-disc list-inside space-y-2 text-xs text-white font-normal leading-relaxed pl-3">
                      <li>
                        Modern frontend development: fast, accessible, and
                        responsive UIs using React, Tailwind, and Vite, with
                        advanced state management via Redux Toolkit + RTK Query.
                      </li>
                      <li>
                        Robust Python backend: RESTful and async APIs using
                        Flask, Django, or FastAPI, tailored to project
                        requirements.
                      </li>
                      <li>
                        API integration and communication: clean client-server
                        architecture, secure authentication, and structured data
                        flow.
                      </li>
                      <li>
                        CI/CD and cloud deployment: automated delivery
                        pipelines, Docker-based containerization, and deployment
                        on AWS or VPS environments.
                      </li>
                      <li>
                        Best development practices: clean architecture, testing,
                        version control, and comprehensive technical
                        documentation.
                      </li>
                    </ul>
                  </div>
                </Popover.Panel>
              </Popover>
            </div>
          </div>
          {/* 4. API & Microservices Development Card */}
          <div className="bg-[#23262F] rounded-md p-8 col-span-6 h-full flex flex-col justify-center items-center">
            <div className="flex items-center gap-2 w-full">
              <h3 className="text-xl text-start uppercase font-bold tracking-tight text-gray-900 dark:text-white">
                API & Microservices Development
              </h3>
              <Popover className="relative">
                <Popover.Button as="button" className="focus:outline-none">
                  <InfoIcon />
                </Popover.Button>
                <Popover.Panel className="absolute z-10 w-64 p-3 bg-[#23262F] text-xs text-white rounded shadow-lg left-1/2 -translate-x-1/2 mt-2">
                  <div>
                    RESTful and async APIs, microservices design, API
                    versioning, and secure endpoints with monitoring and
                    observability.
                    <ul className="mt-4 list-disc list-inside space-y-2 text-xs text-white font-normal leading-relaxed pl-3">
                      <li>
                        RESTful and async APIs with Flask, FastAPI, or Django.
                      </li>
                      <li>
                        Design and deployment of microservices with clear
                        boundaries.
                      </li>
                      <li>
                        API versioning, rate limiting, and documentation with
                        tools like Swagger/OpenAPI.
                      </li>
                      <li>
                        Secure endpoints with authentication, logging, and error
                        handling.
                      </li>
                      <li>
                        Integration of monitoring, observability, and metrics
                        for production readiness.
                      </li>
                    </ul>
                  </div>
                </Popover.Panel>
              </Popover>
            </div>
          </div>
          {/* 5. Database Optimization & Data Management Card */}
          <div className="bg-[#23262F] rounded-md p-8 col-span-3 h-full flex flex-col justify-center items-center">
            <div className="flex items-center gap-2 w-full">
              <h3 className="text-xl text-start uppercase font-bold tracking-tight text-gray-900 dark:text-white">
                Database Optimization & Data Management
              </h3>
              <Popover className="relative">
                <Popover.Button as="button" className="focus:outline-none">
                  <InfoIcon />
                </Popover.Button>
                <Popover.Panel className="absolute z-10 w-64 p-3 bg-[#23262F] text-xs text-white rounded shadow-lg left-1/2 -translate-x-1/2 mt-2">
                  <div>
                    Database schema design, query optimization, data pipelines,
                    and reporting infrastructure for scalable data management.
                    <ul className="mt-4 list-disc list-inside space-y-2 text-xs text-white font-normal leading-relaxed pl-3">
                      <li>Database schema design and normalization.</li>
                      <li>Query optimization and indexing strategies.</li>
                      <li>Refactoring legacy data models for scalability.</li>
                      <li>Backup, migration, and replication strategies.</li>
                      <li>
                        Building custom data pipelines and reporting
                        infrastructure.
                      </li>
                    </ul>
                  </div>
                </Popover.Panel>
              </Popover>
            </div>
          </div>
          {/* 6. Security Enhancements & Development Best Practices Card */}
          <div className="bg-[#23262F] rounded-md p-8 col-span-3 h-full flex flex-col justify-center items-center">
            <div className="flex items-center gap-2 w-full">
              <h3 className="text-xl text-start uppercase font-bold tracking-tight text-gray-900 dark:text-white">
                Security Enhancements & Development Best Practices
              </h3>
              <Popover className="relative">
                <Popover.Button as="button" className="focus:outline-none">
                  <InfoIcon />
                </Popover.Button>
                <Popover.Panel className="absolute z-10 w-64 p-3 bg-[#23262F] text-xs text-white rounded shadow-lg left-1/2 -translate-x-1/2 mt-2">
                  <div>
                    Secure code reviews, authentication, CI/CD integration, and
                    collaborative coding practices for robust software delivery.
                    <ul className="mt-4 list-disc list-inside space-y-2 text-xs text-white font-normal leading-relaxed pl-3">
                      <li>
                        Implementation of authentication and role-based access
                        control.
                      </li>
                      <li>
                        Secure code reviews and dependency vulnerability checks.
                      </li>
                      <li>
                        Enforcement of coding standards and project structure.
                      </li>
                      <li>
                        CI/CD integration with automated testing and linting.
                      </li>
                      <li>
                        Git workflow optimization and collaborative coding
                        practices.
                      </li>
                    </ul>
                  </div>
                </Popover.Panel>
              </Popover>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
