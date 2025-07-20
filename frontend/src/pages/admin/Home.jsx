import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  // Configuración del color del láser
  const [hoveredCard, setHoveredCard] = useState(null); // Índice o id de la tarjeta en hover
  const [laserCoords, setLaserCoords] = useState(null); // {x1, y1, x2, y2}

  // Estado para expandir/cerrar cada tarjeta de categoría
  const [expandedCards, setExpandedCards] = useState({});

  // Refs para las tarjetas y la casilla AI
  const cardRefs = useRef([]);
  const aiRef = useRef(null);
  const sectionRef = useRef(null);

  // Detectar si es mobile para condicionar el render del láser y el orden de tarjetas
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Utilidad para obtener el centro de un elemento relativo al section, ajustando por scroll
  const getCenter = (el) => {
    if (!el || !sectionRef.current) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const sectionRect = sectionRef.current.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - sectionRect.left,
      y:
        rect.top +
        rect.height / 2 -
        sectionRect.top +
        sectionRef.current.scrollTop,
    };
  };

  // Calcular coordenadas del láser cuando hay hover
  useEffect(() => {
    if (
      hoveredCard !== null &&
      cardRefs.current[hoveredCard] &&
      aiRef.current
    ) {
      const from = getCenter(cardRefs.current[hoveredCard]);
      const to = getCenter(aiRef.current);
      setLaserCoords({ x1: from.x, y1: from.y, x2: to.x, y2: to.y });
    } else {
      setLaserCoords(null);
    }
  }, [hoveredCard]);

  // Colores de láser por categoría
  const laserColors = [
    "#00BFFF", // System Integration
    "#FF6B6B", // Web Development
    "#FFD93D", // API & Microservices
    "#6BCB77", // Database Optimization
    "#4D96FF", // Security
    "#B983FF", // Software Architecture
  ];

  // Color actual del láser
  const currentLaserColor =
    hoveredCard !== null ? laserColors[hoveredCard] : laserColors[0];

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
      <section
        ref={sectionRef}
        className="relative mx-auto max-w-screen-2xl h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] overflow-y-auto overflow-x-hidden p-2 md:p-4 lg:p-10"
      >
        {/* SVG para el láser animado solo en lg+ */}
        {window.innerWidth >= 1024 && laserCoords && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-50"
            style={{ overflow: "hidden" }}
          >
            <line
              x1={laserCoords.x1}
              y1={laserCoords.y1}
              x2={laserCoords.x2}
              y2={laserCoords.y2}
              stroke={currentLaserColor}
              strokeWidth={4}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 8px ${currentLaserColor})`,
                strokeDasharray: 1000,
                strokeDashoffset: 0,
                animation: "laser-move 0.4s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
            <style>{`
              @keyframes laser-move {
                from { stroke-dashoffset: 1000; }
                to { stroke-dashoffset: 0; }
              }
            `}</style>
          </svg>
        )}
        {/* Mobile y Tablet: AI arriba, About Me abajo, tarjetas en 1 o 2 columnas */}
        {(isMobile ||
          (window.innerWidth >= 768 && window.innerWidth < 1024)) && (
          <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-4">
            {/* AI arriba */}
            <div className="md:col-span-2">
              <div className="rounded-md flex flex-col justify-between mb-4">
                <div className="flex flex-col h-full justify-between gap-4">
                  <div className="flex-1 flex items-center justify-center">
                    <div
                      ref={aiRef}
                      className={`bg-[#23262F] rounded-md flex items-center justify-center p-2 transition-transform duration-300 ease-in-out cursor-pointer relative w-full border-2`}
                      style={{
                        borderColor:
                          hoveredCard !== null
                            ? laserColors[hoveredCard]
                            : "transparent",
                        transition: "border-color 0.3s, transform 0.3s",
                      }}
                    >
                      <h3 className="text-5xl text-center uppercase font-bold tracking-tight text-white">
                        AI
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Tarjetas de categorías */}
            <Link
              className={`bg-[#23262F] rounded-md p-4 flex flex-col justify-center items-center transition-shadow cursor-pointer border-2 ${
                hoveredCard === 0 ? "" : "border-transparent"
              } ${hoveredCard === 0 ? "" : ""}`}
              style={hoveredCard === 0 ? { borderColor: laserColors[0] } : {}}
              to="/category/system-integration"
              onMouseEnter={() => setHoveredCard(0)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="flex items-center gap-2 w-full">
                <h3 className="text-lg text-start uppercase font-bold tracking-tight text-white md:text-xl">
                  System Integration & Process Automation
                </h3>
              </div>
              <div className="w-full mt-4 transition-all duration-300 text-white text-xs md:text-sm">
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
            </Link>
            <Link
              className={`bg-[#23262F] rounded-md p-4 flex flex-col justify-center items-center transition-shadow cursor-pointer border-2 ${
                hoveredCard === 1 ? "" : "border-transparent"
              } ${hoveredCard === 1 ? "" : ""}`}
              style={hoveredCard === 1 ? { borderColor: laserColors[1] } : {}}
              to="/category/web-development"
              onMouseEnter={() => setHoveredCard(1)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="flex items-center gap-2 w-full">
                <h3 className="text-lg text-start uppercase font-bold tracking-tight text-white md:text-xl">
                  Modern and Scalable Web Application Development
                </h3>
              </div>
              <div className="w-full mt-4 transition-all duration-300 text-white text-xs md:text-sm">
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
            </Link>
            <Link
              className={`bg-[#23262F] rounded-md p-4 flex flex-col justify-center items-center transition-shadow cursor-pointer border-2 ${
                hoveredCard === 2 ? "" : "border-transparent"
              } ${hoveredCard === 2 ? "" : ""}`}
              style={hoveredCard === 2 ? { borderColor: laserColors[2] } : {}}
              to="/category/api-microservices"
              onMouseEnter={() => setHoveredCard(2)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="flex items-center gap-2 w-full">
                <h3 className="text-lg text-start uppercase font-bold tracking-tight text-white md:text-xl">
                  API & Microservices Development
                </h3>
              </div>
              <div className="w-full mt-4 transition-all duration-300 text-white text-xs md:text-sm">
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
            </Link>
            <Link
              className={`bg-[#23262F] rounded-md p-4 flex flex-col justify-center items-center transition-shadow cursor-pointer border-2 ${
                hoveredCard === 3 ? "" : "border-transparent"
              } ${hoveredCard === 3 ? "" : ""}`}
              style={hoveredCard === 3 ? { borderColor: laserColors[3] } : {}}
              to="/category/database-optimization"
              onMouseEnter={() => setHoveredCard(3)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="flex items-center gap-2 w-full">
                <h3 className="text-lg text-start uppercase font-bold tracking-tight text-white md:text-xl">
                  Database Optimization & Data Management
                </h3>
              </div>
              <div className="w-full mt-4 transition-all duration-300 text-white text-xs md:text-sm">
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
            </Link>
            <Link
              className={`bg-[#23262F] rounded-md p-4 flex flex-col justify-center items-center transition-shadow cursor-pointer border-2 ${
                hoveredCard === 4 ? "" : "border-transparent"
              } ${hoveredCard === 4 ? "" : ""}`}
              style={hoveredCard === 4 ? { borderColor: laserColors[4] } : {}}
              to="/category/security-best-practices"
              onMouseEnter={() => setHoveredCard(4)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="flex items-center gap-2 w-full">
                <h3 className="text-lg text-start uppercase font-bold tracking-tight text-white md:text-xl">
                  Security Enhancements & Development Best Practices
                </h3>
              </div>
              <div className="w-full mt-4 transition-all duration-300 text-white text-xs md:text-sm">
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
            </Link>
            {/* About Me al final */}
            <div className="bg-[#23262F] rounded-md p-4 flex flex-col justify-center items-center mt-4 md:col-span-2">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold text-white">About me</h3>
              </div>
              <p className="mt-4 font-normal text-gray-300">Lorem20</p>
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
              <div className="bg-[#23262F] rounded-md p-4 md:p-8 col-span-2 h-full flex flex-col justify-center items-center">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-white">About me</h3>
                </div>
                <p className="mt-4 font-normal text-gray-300">Lorem20</p>
                <button className="mt-8 h-10 w-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white transition-colors font-semibold">
                  Reach me out !!!
                </button>
              </div>
              {/* 1. Software Architecture Consulting and Cloud Solutions Implementation Card */}
              <Link
                className={`bg-[#23262F] rounded-md p-4 md:p-8 col-span-10 h-full flex flex-col justify-center items-center transition-shadow cursor-pointer border-2 ${
                  hoveredCard === 5 ? "" : "border-transparent"
                } ${hoveredCard === 5 ? "" : ""}`}
                style={hoveredCard === 5 ? { borderColor: laserColors[5] } : {}}
                ref={(el) => (cardRefs.current[5] = el)}
                onMouseEnter={() => setHoveredCard(5)}
                onMouseLeave={() => setHoveredCard(null)}
                to="/category/software-architecture"
              >
                <div className="flex items-center gap-2 w-full">
                  <h3 className="text-xl text-start uppercase font-bold tracking-tight text-white">
                    Software Architecture Consulting and Cloud Solutions
                    Implementation
                  </h3>
                </div>
                <div className="w-full mt-4 transition-all duration-300 text-white text-sm md:text-base">
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
              </Link>
            </div>
            {/* Segunda fila */}
            <div className="grid grid-cols-12 grid-flow-row-dense gap-4 items-start">
              {/* 2. System Integration & Process Automation Card */}
              <Link
                className={`bg-[#23262F] rounded-md p-4 md:p-8 col-span-5 h-full flex flex-col justify-center items-center transition-shadow cursor-pointer border-2 ${
                  hoveredCard === 0 ? "" : "border-transparent"
                } ${hoveredCard === 0 ? "" : ""}`}
                style={hoveredCard === 0 ? { borderColor: laserColors[0] } : {}}
                ref={(el) => (cardRefs.current[0] = el)}
                onMouseEnter={() => setHoveredCard(0)}
                onMouseLeave={() => setHoveredCard(null)}
                to="/category/system-integration"
              >
                <div className="flex items-center gap-2 w-full">
                  <h3 className="text-xl text-start uppercase font-bold tracking-tight text-white">
                    System Integration & Process Automation
                  </h3>
                </div>
                <div className="w-full mt-4 transition-all duration-300 text-white text-sm md:text-base">
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
              </Link>
              {/* Center Bento: AI Focused Placeholder */}
              <div className="rounded-md col-span-2 h-full flex flex-col justify-between">
                <div className="flex flex-col h-full justify-between gap-4">
                  <div className="flex-1 flex items-center justify-center">
                    <div
                      ref={aiRef}
                      className={`bg-[#23262F] rounded-md flex items-center justify-center p-2 transition-transform duration-300 ease-in-out cursor-pointer relative border-2 ${
                        hoveredCard !== null ? "scale-150" : "scale-100"
                      }`}
                      style={{
                        borderColor:
                          hoveredCard !== null
                            ? laserColors[hoveredCard]
                            : "transparent",
                        transition: "border-color 0.3s, transform 0.3s",
                      }}
                    >
                      <h3 className="text-8xl text-center uppercase font-bold tracking-tight text-white">
                        AI
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
              {/* 3. Modern and Scalable Web Application Development Card */}
              <Link
                className={`bg-[#23262F] rounded-md p-4 md:p-8 col-span-5 h-full flex flex-col justify-center items-center transition-shadow cursor-pointer border-2 ${
                  hoveredCard === 1 ? "" : "border-transparent"
                } ${hoveredCard === 1 ? "" : ""}`}
                style={hoveredCard === 1 ? { borderColor: laserColors[1] } : {}}
                ref={(el) => (cardRefs.current[1] = el)}
                onMouseEnter={() => setHoveredCard(1)}
                onMouseLeave={() => setHoveredCard(null)}
                to="/category/web-development"
              >
                <div className="flex items-center gap-2 w-full">
                  <h3 className="text-xl text-start uppercase font-bold tracking-tight text-white">
                    Modern and Scalable Web Application Development
                  </h3>
                </div>
                <div className="w-full mt-4 transition-all duration-300 text-white text-sm md:text-base">
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
              </Link>
              {/* 4. API & Microservices Development Card */}
              <Link
                className={`bg-[#23262F] rounded-md p-4 md:p-8 col-span-6 h-full flex flex-col justify-center items-center transition-shadow cursor-pointer border-2 ${
                  hoveredCard === 2 ? "" : "border-transparent"
                } ${hoveredCard === 2 ? "" : ""}`}
                style={hoveredCard === 2 ? { borderColor: laserColors[2] } : {}}
                ref={(el) => (cardRefs.current[2] = el)}
                onMouseEnter={() => setHoveredCard(2)}
                onMouseLeave={() => setHoveredCard(null)}
                to="/category/api-microservices"
              >
                <div className="flex items-center gap-2 w-full">
                  <h3 className="text-xl text-start uppercase font-bold tracking-tight text-white">
                    API & Microservices Development
                  </h3>
                </div>
                <div className="w-full mt-4 transition-all duration-300 text-white text-sm md:text-base">
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
              </Link>
              {/* 5. Database Optimization & Data Management Card */}
              <Link
                className={`bg-[#23262F] rounded-md p-4 md:p-8 col-span-3 h-full flex flex-col justify-center items-center transition-shadow cursor-pointer border-2 ${
                  hoveredCard === 3 ? "" : "border-transparent"
                } ${hoveredCard === 3 ? "" : ""}`}
                style={hoveredCard === 3 ? { borderColor: laserColors[3] } : {}}
                ref={(el) => (cardRefs.current[3] = el)}
                onMouseEnter={() => setHoveredCard(3)}
                onMouseLeave={() => setHoveredCard(null)}
                to="/category/database-optimization"
              >
                <div className="flex items-center gap-2 w-full">
                  <h3 className="text-xl text-start uppercase font-bold tracking-tight text-white">
                    Database Optimization & Data Management
                  </h3>
                </div>
                <div className="w-full mt-4 transition-all duration-300 text-white text-sm md:text-base">
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
              </Link>
              {/* 6. Security Enhancements & Development Best Practices Card */}
              <Link
                className={`bg-[#23262F] rounded-md p-4 md:p-8 col-span-3 h-full flex flex-col justify-center items-center transition-shadow cursor-pointer border-2 ${
                  hoveredCard === 4 ? "" : "border-transparent"
                } ${hoveredCard === 4 ? "" : ""}`}
                style={hoveredCard === 4 ? { borderColor: laserColors[4] } : {}}
                ref={(el) => (cardRefs.current[4] = el)}
                onMouseEnter={() => setHoveredCard(4)}
                onMouseLeave={() => setHoveredCard(null)}
                to="/category/security-best-practices"
              >
                <div className="flex items-center gap-2 w-full">
                  <h3 className="text-xl text-start uppercase font-bold tracking-tight text-white">
                    Security Enhancements & Development Best Practices
                  </h3>
                </div>
                <div className="w-full mt-4 transition-all duration-300 text-white text-sm md:text-base">
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
              </Link>
            </div>
          </>
        )}
        <div className="h-4" />
      </section>
    </>
  );
};

export default Home;
