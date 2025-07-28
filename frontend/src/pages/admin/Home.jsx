import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  // Estado para expandir/cerrar cada tarjeta de categoría
  const [expandedCards, setExpandedCards] = useState({});

  // Detectar si es mobile para condicionar el render del láser y el orden de tarjetas
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Definición de bullets para cada tarjeta (excepto IA)
  const cardBullets = [
    [
      // 0: System Integration
      "API integration between internal systems and third-party platforms.",
      "Automation of business workflows using Python, webhooks, and cloud functions.",
      "Data synchronization between legacy systems and modern apps.",
      "Task scheduling and orchestration of background jobs.",
      "Optimization of manual processes through low-code or custom automation solutions.",
    ],
    [
      // 1: Web Development
      "Modern frontend development: fast, accessible, and responsive UIs using React, Tailwind, and Vite, with advanced state management via Redux Toolkit + RTK Query.",
      "Robust Python backend: RESTful and async APIs using Flask, Django, or FastAPI, tailored to project requirements.",
      "API integration and communication: clean client-server architecture, secure authentication, and structured data flow.",
      "CI/CD and cloud deployment: automated delivery pipelines, Docker-based containerization, and deployment on AWS or VPS environments.",
      "Best development practices: clean architecture, testing, version control, and comprehensive technical documentation.",
    ],
    [
      // 2: API & Microservices
      "RESTful and async APIs with Flask, FastAPI, or Django.",
      "Design and deployment of microservices with clear boundaries.",
      "API versioning, rate limiting, and documentation with tools like Swagger/OpenAPI.",
      "Secure endpoints with authentication, logging, and error handling.",
      "Integration of monitoring, observability, and metrics for production readiness.",
    ],
    [
      // 3: Database Optimization
      "Database schema design and normalization.",
      "Query optimization and indexing strategies.",
      "Refactoring legacy data models for scalability.",
      "Backup, migration, and replication strategies.",
      "Building custom data pipelines and reporting infrastructure.",
    ],
    [
      // 4: Security
      "Implementation of authentication and role-based access control.",
      "Secure code reviews and dependency vulnerability checks.",
      "Enforcement of coding standards and project structure.",
      "CI/CD integration with automated testing and linting.",
      "Git workflow optimization and collaborative coding practices.",
    ],
    [
      // 5: Software Architecture
      "Design of decoupled architectures: microservices, serverless, clean architecture, hexagonal, or event-driven designs, based on project requirements.",
      "Strategic AWS adoption: selection, configuration, and optimization of services such as EC2, RDS, S3, Lambda, ECS, API Gateway, and CloudWatch.",
      "Service containerization: Docker implementation and orchestration using Docker Compose for both development and production environments.",
      "Observability from day one: integration of monitoring and visualization tools like Prometheus and Grafana, enabling traceability, real-time alerts, and key performance metrics.",
      "Deployment and automation strategies: consulting on CI/CD pipelines, infrastructure as code, and DevOps best practices.",
    ],
  ];

  // Utilidad para alternar expansión
  const toggleExpand = (idx) => {
    setExpandedCards((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <>
      <section className="relative mx-auto max-w-screen-2xl h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] overflow-y-auto overflow-x-hidden p-2 md:p-4 lg:p-10 bg-do_bg_light dark:bg-do_bg_dark">
        {/* Mobile y Tablet: AI arriba, About Me abajo, tarjetas en 1 o 2 columnas */}
        {(isMobile ||
          (window.innerWidth >= 768 && window.innerWidth < 1024)) && (
          <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-4">
            {/* AI arriba */}
            <div className="md:col-span-2">
              <Link
                to="/projects"
                className="rounded-md flex flex-col justify-between mb-4 bg-do_card_light dark:bg-do_card_dark border-2 border-do_border_light dark:border-none hover:border-[#6BCB77] dark:hover:border-[#6BCB77] transition-all duration-300 cursor-pointer"
              >
                <div className="flex flex-col h-full justify-between gap-4">
                  <div className="flex-1 flex items-center justify-center">
                    <div className="rounded-md flex items-center justify-center p-2 transition-transform duration-300 ease-in-out relative w-full bg-do_card_light dark:bg-do_card_dark">
                      <h3 className="text-3xl text-center uppercase font-bold tracking-tight text-do_text_light dark:text-do_text_dark">
                        PROJECTS
                      </h3>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
            {/* Tarjetas de categorías */}
            <div className="bg-do_card_light dark:bg-do_card_dark rounded-md p-4 flex flex-col justify-center items-center border border-do_border_light dark:border-none">
              <div className="flex items-center gap-2 w-full">
                <h3 className="text-lg text-start uppercase font-bold tracking-tight text-do_text_light dark:text-do_text_dark md:text-xl">
                  System Integration & Process Automation
                </h3>
              </div>
              <div className="w-full mt-4 transition-all duration-300 text-do_text_gray_light dark:text-do_text_gray_dark text-xs md:text-sm">
                <div>
                  API integration, automation of business workflows, and data
                  synchronization between legacy and modern systems.
                  <ul className="mt-4 list-disc list-inside space-y-2 font-normal leading-relaxed pl-3">
                    {(expandedCards[0]
                      ? cardBullets[0]
                      : cardBullets[0].slice(0, 3)
                    ).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                  <button
                    className="mt-2 text-blue-400 hover:underline text-xs font-semibold focus:outline-none"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleExpand(0);
                    }}
                  >
                    {expandedCards[0] ? "Ver menos" : "Ver más"}
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-do_card_light dark:bg-do_card_dark rounded-md p-4 flex flex-col justify-center items-center border border-do_border_light dark:border-none">
              <div className="flex items-center gap-2 w-full">
                <h3 className="text-lg text-start uppercase font-bold tracking-tight text-do_text_light dark:text-do_text_dark md:text-xl">
                  Modern and Scalable Web Application Development
                </h3>
              </div>
              <div className="w-full mt-4 transition-all duration-300 text-do_text_gray_light dark:text-do_text_gray_dark text-xs md:text-sm">
                <div>
                  Full stack web development using React, Tailwind, Redux
                  Toolkit, Flask, Django, and FastAPI. Modern, maintainable, and
                  scalable solutions.
                  <ul className="mt-4 list-disc list-inside space-y-2 font-normal leading-relaxed pl-3">
                    {(expandedCards[1]
                      ? cardBullets[1]
                      : cardBullets[1].slice(0, 3)
                    ).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                  <button
                    className="mt-2 text-blue-400 hover:underline text-xs font-semibold focus:outline-none"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleExpand(1);
                    }}
                  >
                    {expandedCards[1] ? "Ver menos" : "Ver más"}
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-do_card_light dark:bg-do_card_dark rounded-md p-4 flex flex-col justify-center items-center border border-do_border_light dark:border-none">
              <div className="flex items-center gap-2 w-full">
                <h3 className="text-lg text-start uppercase font-bold tracking-tight text-do_text_light dark:text-do_text_dark md:text-xl">
                  API & Microservices Development
                </h3>
              </div>
              <div className="w-full mt-4 transition-all duration-300 text-do_text_gray_light dark:text-do_text_gray_dark text-xs md:text-sm">
                <div>
                  RESTful and async APIs, microservices design, API versioning,
                  and secure endpoints with monitoring and observability.
                  <ul className="mt-4 list-disc list-inside space-y-2 font-normal leading-relaxed pl-3">
                    {(expandedCards[2]
                      ? cardBullets[2]
                      : cardBullets[2].slice(0, 3)
                    ).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                  <button
                    className="mt-2 text-blue-400 hover:underline text-xs font-semibold focus:outline-none"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleExpand(2);
                    }}
                  >
                    {expandedCards[2] ? "Ver menos" : "Ver más"}
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-do_card_light dark:bg-do_card_dark rounded-md p-4 flex flex-col justify-center items-center border border-do_border_light dark:border-none">
              <div className="flex items-center gap-2 w-full">
                <h3 className="text-lg text-start uppercase font-bold tracking-tight text-do_text_light dark:text-do_text_dark md:text-xl">
                  Database Optimization & Data Management
                </h3>
              </div>
              <div className="w-full mt-4 transition-all duration-300 text-do_text_gray_light dark:text-do_text_gray_dark text-xs md:text-sm">
                <div>
                  Database schema design, query optimization, data pipelines,
                  and reporting infrastructure for scalable data management.
                  <ul className="mt-4 list-disc list-inside space-y-2 font-normal leading-relaxed pl-3">
                    {(expandedCards[3]
                      ? cardBullets[3]
                      : cardBullets[3].slice(0, 3)
                    ).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                  <button
                    className="mt-2 text-blue-400 hover:underline text-xs font-semibold focus:outline-none"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleExpand(3);
                    }}
                  >
                    {expandedCards[3] ? "Ver menos" : "Ver más"}
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-do_card_light dark:bg-do_card_dark rounded-md p-4 flex flex-col justify-center items-center border border-do_border_light dark:border-none">
              <div className="flex items-center gap-2 w-full">
                <h3 className="text-lg text-start uppercase font-bold tracking-tight text-do_text_light dark:text-do_text_dark md:text-xl">
                  Security Enhancements & Development Best Practices
                </h3>
              </div>
              <div className="w-full mt-4 transition-all duration-300 text-do_text_gray_light dark:text-do_text_gray_dark text-xs md:text-sm">
                <div>
                  Secure code reviews, authentication, CI/CD integration, and
                  collaborative coding practices for robust software delivery.
                  <ul className="mt-4 list-disc list-inside space-y-2 font-normal leading-relaxed pl-3">
                    {(expandedCards[4]
                      ? cardBullets[4]
                      : cardBullets[4].slice(0, 3)
                    ).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                  <button
                    className="mt-2 text-blue-400 hover:underline text-xs font-semibold focus:outline-none"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleExpand(4);
                    }}
                  >
                    {expandedCards[4] ? "Ver menos" : "Ver más"}
                  </button>
                </div>
              </div>
            </div>
            {/* About Me al final */}
            <div className="bg-do_card_light dark:bg-do_card_dark rounded-md p-4 flex flex-col justify-center items-center mt-4 md:col-span-2 border border-do_border_light dark:border-none">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold text-do_text_light dark:text-do_text_dark">
                  About me
                </h3>
              </div>
              <p className="mt-4 font-normal text-do_text_gray_light dark:text-do_text_gray_dark">
                Lorem20
              </p>
              <button className="mt-8 h-10 w-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white transition-colors font-semibold">
                Reach me out !!!
              </button>
            </div>
          </div>
        )}
        {/* Desktop: bento original (AI centro, About Me izq) */}
        {window.innerWidth >= 1024 && (
          <>
            {/* Primera fila */}
            <div className="grid grid-cols-12 grid-flow-row-dense gap-4 items-start mb-4">
              {/* About Me Card (no es Link) */}
              <div className="bg-do_card_light dark:bg-do_card_dark rounded-md p-4 md:p-8 col-span-4 h-full flex flex-col justify-center items-center">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-do_text_light dark:text-do_text_dark">
                    I&apos;m Jose Ruiz
                  </h3>
                </div>
                <p className="mt-4 font-normal text-do_text_gray_light dark:text-do_text_gray_dark text-center">
                  Passionate software developer focused on designing,
                  developing, and deploying robust and scalable solutions that
                  drive real impact.
                </p>
                <button className="mt-8 h-10 w-full bg-gradient-to-br from-[#0272AD] to-[#0272AD] rounded-xl text-white transition-colors font-semibold">
                  Reach me out !!!
                </button>
              </div>
              {/* 1. Software Architecture Consulting and Cloud Solutions Implementation Card */}
              <div className="bg-do_card_light dark:bg-do_card_dark rounded-md p-4 md:p-8 col-span-8 h-full flex flex-col justify-center items-center border border-do_border_light dark:border-none">
                <div className="flex items-center gap-2 w-full">
                  <h3 className="text-xl text-start uppercase font-bold tracking-tight text-do_text_light dark:text-do_text_dark">
                    Software Architecture Consulting and Cloud Solutions
                    Implementation
                  </h3>
                </div>
                <div className="w-full mt-4 transition-all duration-300 text-do_text_gray_light dark:text-do_text_gray_dark text-sm md:text-base">
                  <div>
                    Design and implementation of robust, observable, and
                    scalable software architectures using AWS, Docker,
                    Prometheus, and Grafana.
                    <ul className="mt-4 list-disc list-inside space-y-2 font-normal leading-relaxed pl-3">
                      {(expandedCards[5]
                        ? cardBullets[5]
                        : cardBullets[5].slice(0, 3)
                      ).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                    <button
                      className="mt-2 text-blue-400 hover:underline text-xs font-semibold focus:outline-none"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleExpand(5);
                      }}
                    >
                      {expandedCards[5] ? "Ver menos" : "Ver más"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Segunda fila */}
            <div className="grid grid-cols-12 grid-flow-row-dense gap-4 items-start">
              {/* 2. System Integration & Process Automation Card */}
              <div className="bg-do_card_light dark:bg-do_card_dark rounded-md p-4 md:p-8 col-span-5 h-full flex flex-col justify-center items-center border border-do_border_light dark:border-none">
                <div className="flex items-center gap-2 w-full">
                  <h3 className="text-xl text-start uppercase font-bold tracking-tight text-do_text_light dark:text-do_text_dark">
                    System Integration & Process Automation
                  </h3>
                </div>
                <div className="w-full mt-4 transition-all duration-300 text-do_text_gray_light dark:text-do_text_gray_dark text-sm md:text-base">
                  <div>
                    API integration, automation of business workflows, and data
                    synchronization between legacy and modern systems.
                    <ul className="mt-4 list-disc list-inside space-y-2 font-normal leading-relaxed pl-3">
                      {(expandedCards[0]
                        ? cardBullets[0]
                        : cardBullets[0].slice(0, 3)
                      ).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                    <button
                      className="mt-2 text-blue-400 hover:underline text-xs font-semibold focus:outline-none"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleExpand(0);
                      }}
                    >
                      {expandedCards[0] ? "Ver menos" : "Ver más"}
                    </button>
                  </div>
                </div>
              </div>
              {/* Center Bento: AI Focused Placeholder */}
              <div className="rounded-md col-span-2 h-full flex flex-col justify-between">
                <div className="flex flex-col h-full justify-between gap-4">
                  <div className="flex-1 flex items-center justify-center">
                    <Link
                      to="/projects"
                      className="bg-[#23262F] rounded-md flex items-center justify-center p-2 transition-all duration-300 ease-in-out cursor-pointer relative border-2 border-transparent hover:border-[#6BCB77] hover:scale-150"
                    >
                      <h3 className="text-2xl text-center uppercase font-bold tracking-tight text-white">
                        PROJECTS
                      </h3>
                    </Link>
                  </div>
                </div>
              </div>
              {/* 3. Modern and Scalable Web Application Development Card */}
              <div className="bg-do_card_light dark:bg-do_card_dark rounded-md p-4 md:p-8 col-span-5 h-full flex flex-col justify-center items-center border border-do_border_light dark:border-none">
                <div className="flex items-center gap-2 w-full">
                  <h3 className="text-xl text-start uppercase font-bold tracking-tight text-do_text_light dark:text-do_text_dark">
                    Modern and Scalable Web Application Development
                  </h3>
                </div>
                <div className="w-full mt-4 transition-all duration-300 text-do_text_gray_light dark:text-do_text_gray_dark text-sm md:text-base">
                  <div>
                    Full stack web development using React, Tailwind, Redux
                    Toolkit, Flask, Django, and FastAPI. Modern, maintainable,
                    and scalable solutions.
                    <ul className="mt-4 list-disc list-inside space-y-2 font-normal leading-relaxed pl-3">
                      {(expandedCards[1]
                        ? cardBullets[1]
                        : cardBullets[1].slice(0, 3)
                      ).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                    <button
                      className="mt-2 text-blue-400 hover:underline text-xs font-semibold focus:outline-none"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleExpand(1);
                      }}
                    >
                      {expandedCards[1] ? "Ver menos" : "Ver más"}
                    </button>
                  </div>
                </div>
              </div>
              {/* 4. API & Microservices Development Card */}
              <div className="bg-do_card_light dark:bg-do_card_dark rounded-md p-4 md:p-8 col-span-4 h-full flex flex-col justify-center items-center border border-do_border_light dark:border-none">
                <div className="flex items-center gap-2 w-full">
                  <h3 className="text-xl text-start uppercase font-bold tracking-tight text-do_text_light dark:text-do_text_dark">
                    API & Microservices Development
                  </h3>
                </div>
                <div className="w-full mt-4 transition-all duration-300 text-do_text_gray_light dark:text-do_text_gray_dark text-sm md:text-base">
                  <div>
                    RESTful and async APIs, microservices design, API
                    versioning, and secure endpoints with monitoring and
                    observability.
                    <ul className="mt-4 list-disc list-inside space-y-2 font-normal leading-relaxed pl-3">
                      {(expandedCards[2]
                        ? cardBullets[2]
                        : cardBullets[2].slice(0, 3)
                      ).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                    <button
                      className="mt-2 text-blue-400 hover:underline text-xs font-semibold focus:outline-none"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleExpand(2);
                      }}
                    >
                      {expandedCards[2] ? "Ver menos" : "Ver más"}
                    </button>
                  </div>
                </div>
              </div>
              {/* 5. Database Optimization & Data Management Card */}
              <div className="bg-do_card_light dark:bg-do_card_dark rounded-md p-4 md:p-8 col-span-4 h-full flex flex-col justify-center items-center border border-do_border_light dark:border-none">
                <div className="flex items-center gap-2 w-full">
                  <h3 className="text-xl text-start uppercase font-bold tracking-tight text-do_text_light dark:text-do_text_dark">
                    Database Optimization & Data Management
                  </h3>
                </div>
                <div className="w-full mt-4 transition-all duration-300 text-do_text_gray_light dark:text-do_text_gray_dark text-sm md:text-base">
                  <div>
                    Database schema design, query optimization, data pipelines,
                    and reporting infrastructure for scalable data management.
                    <ul className="mt-4 list-disc list-inside space-y-2 font-normal leading-relaxed pl-3">
                      {(expandedCards[3]
                        ? cardBullets[3]
                        : cardBullets[3].slice(0, 3)
                      ).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                    <button
                      className="mt-2 text-blue-400 hover:underline text-xs font-semibold focus:outline-none"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleExpand(3);
                      }}
                    >
                      {expandedCards[3] ? "Ver menos" : "Ver más"}
                    </button>
                  </div>
                </div>
              </div>
              {/* 6. Security Enhancements & Development Best Practices Card */}
              <div className="bg-do_card_light dark:bg-do_card_dark rounded-md p-4 md:p-8 col-span-4 h-full flex flex-col justify-center items-center border border-do_border_light dark:border-none">
                <div className="flex items-center gap-2 w-full">
                  <h3 className="text-xl text-start uppercase font-bold tracking-tight text-do_text_light dark:text-do_text_dark">
                    Security Enhancements & Development Best Practices
                  </h3>
                </div>
                <div className="w-full mt-4 transition-all duration-300 text-do_text_gray_light dark:text-do_text_gray_dark text-sm md:text-base">
                  <div>
                    Secure code reviews, authentication, CI/CD integration, and
                    collaborative coding practices for robust software delivery.
                    <ul className="mt-4 list-disc list-inside space-y-2 font-normal leading-relaxed pl-3">
                      {(expandedCards[4]
                        ? cardBullets[4]
                        : cardBullets[4].slice(0, 3)
                      ).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                    <button
                      className="mt-2 text-blue-400 hover:underline text-xs font-semibold focus:outline-none"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleExpand(4);
                      }}
                    >
                      {expandedCards[4] ? "Ver menos" : "Ver más"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        <div className="h-4" />
      </section>
    </>
  );
};

export default Home;
