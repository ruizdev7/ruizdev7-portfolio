import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CodeBracketIcon,
  ChartBarIcon,
  CpuChipIcon,
  CloudIcon,
  ShieldCheckIcon,
  CogIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import ThemeInfo from "../../components/ThemeInfo";
import AuthInfo from "../../components/auth/AuthInfo";

const Home = () => {
  // Estado para expandir/cerrar cada tarjeta de categoría
  const [expandedCards, setExpandedCards] = useState({});

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

  // Servicios con iconos y descripciones mejoradas
  const services = [
    {
      id: 0,
      title: "System Integration & Process Automation",
      description:
        "Streamline your business operations with intelligent automation and seamless system integration.",
      icon: CogIcon,
      color: "from-blue-500 to-cyan-500",
      bullets: cardBullets[0],
    },
    {
      id: 1,
      title: "Full-Stack Web Development",
      description:
        "Modern, scalable web applications built with cutting-edge technologies and best practices.",
      icon: CodeBracketIcon,
      color: "from-purple-500 to-pink-500",
      bullets: cardBullets[1],
    },
    {
      id: 2,
      title: "API & Microservices Development",
      description:
        "Robust, scalable APIs and microservices architecture for modern applications.",
      icon: CloudIcon,
      color: "from-green-500 to-emerald-500",
      bullets: cardBullets[2],
    },
    {
      id: 3,
      title: "Database Optimization & Data Management",
      description:
        "Optimize your data infrastructure and build powerful data pipelines for insights.",
      icon: ChartBarIcon,
      color: "from-orange-500 to-red-500",
      bullets: cardBullets[3],
    },
    {
      id: 4,
      title: "Security & Best Practices",
      description:
        "Secure, maintainable code with industry-leading development practices.",
      icon: ShieldCheckIcon,
      color: "from-indigo-500 to-purple-500",
      bullets: cardBullets[4],
    },
    {
      id: 5,
      title: "Software Architecture & DevOps",
      description:
        "Scalable architecture design and modern DevOps practices for production-ready applications.",
      icon: CpuChipIcon,
      color: "from-teal-500 to-blue-500",
      bullets: cardBullets[5],
    },
  ];

  // Utilidad para alternar expansión
  const toggleExpand = (idx) => {
    setExpandedCards((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <>
      <section className="relative mx-auto max-w-screen-2xl min-h-screen overflow-y-auto overflow-x-hidden bg-do_bg_light dark:bg-do_bg_dark">
        {/* Debug Info - Temporal
        <DebugUserInfo /> */}

        {/* Hero Section */}
        <div className="relative px-4 py-12 md:py-16 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl font-bold text-do_text_light dark:text-do_text_dark mb-6">
                Software Developer &
                <span className="block bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                  Data Analyst
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-do_text_gray_light dark:text-do_text_gray_dark mb-8 leading-relaxed">
                Transforming ideas into powerful, scalable solutions with modern
                technology and data-driven insights
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/projects"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-800 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-900 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                >
                  <RocketLaunchIcon className="w-5 h-5 mr-2" />
                  View My Work
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center px-8 py-4 border-2 border-do_border_light dark:border-do_border_dark text-do_text_light dark:text-do_text_dark font-semibold rounded-lg hover:bg-do_card_light dark:hover:bg-do_card_dark transition-all duration-300"
                >
                  <UserGroupIcon className="w-5 h-5 mr-2" />
                  Get In Touch
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="px-4 py-8 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-do_text_light dark:text-do_text_dark mb-4">
                Services I Offer
              </h2>
              <p className="text-lg text-do_text_gray_light dark:text-do_text_gray_dark max-w-3xl mx-auto">
                Comprehensive software development and data analysis services to
                help your business grow and succeed in the digital age
              </p>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-do_card_light dark:bg-do_card_dark rounded-xl p-6 border border-do_border_light dark:border-do_border_dark hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div
                    className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${service.color} mb-4`}
                  >
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-do_text_light dark:text-do_text_dark mb-3">
                    {service.title}
                  </h3>
                  <p className="text-do_text_gray_light dark:text-do_text_gray_dark mb-4">
                    {service.description}
                  </p>
                  <div className="space-y-2">
                    {(expandedCards[service.id]
                      ? service.bullets
                      : service.bullets.slice(0, 2)
                    ).map((bullet, i) => (
                      <div key={i} className="flex items-start">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
                          {bullet}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    className="mt-4 text-blue-500 hover:text-blue-600 font-semibold text-sm focus:outline-none transition-colors"
                    onClick={() => toggleExpand(service.id)}
                  >
                    {expandedCards[service.id] ? "Show less" : "Show more"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technologies & Experience Section */}
        <div className="px-4 py-16 lg:px-8 bg-do_card_light dark:bg-do_card_dark">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-do_text_light dark:text-do_text_dark mb-4">
                Technologies & Expertise
              </h2>
              <p className="text-lg text-do_text_gray_light dark:text-do_text_gray_dark">
                Modern tech stack and proven methodologies for delivering
                exceptional results
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center group">
                <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 mb-3">
                  <CodeBracketIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-medium text-do_text_light dark:text-do_text_dark mb-2">
                  Frontend
                </h3>
                <p className="text-xs text-do_text_gray_light dark:text-do_text_gray_dark leading-relaxed">
                  React, TypeScript, Tailwind CSS, Redux Toolkit, Vite
                </p>
              </div>

              <div className="text-center group">
                <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 mb-3">
                  <CpuChipIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-medium text-do_text_light dark:text-do_text_dark mb-2">
                  Backend
                </h3>
                <p className="text-xs text-do_text_gray_light dark:text-do_text_gray_dark leading-relaxed">
                  Python, Flask, Django, FastAPI, Node.js, Express
                </p>
              </div>

              <div className="text-center group">
                <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 mb-3">
                  <ChartBarIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-medium text-do_text_light dark:text-do_text_dark mb-2">
                  Data & Analytics
                </h3>
                <p className="text-xs text-do_text_gray_light dark:text-do_text_gray_dark leading-relaxed">
                  SQL, PostgreSQL, MySQL, Pandas, NumPy, ECharts
                </p>
              </div>

              <div className="text-center group">
                <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 mb-3">
                  <CloudIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-medium text-do_text_light dark:text-do_text_dark mb-2">
                  DevOps & Cloud
                </h3>
                <p className="text-xs text-do_text_gray_light dark:text-do_text_gray_dark leading-relaxed">
                  Docker, AWS, CI/CD, Git, Linux, Nginx
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="px-4 py-16 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-do_text_light dark:text-do_text_dark mb-6">
              Ready to Start Your Project?
            </h2>
            <p className="text-lg text-do_text_gray_light dark:text-do_text_gray_dark mb-8">
              Let&apos;s discuss how I can help you build the next great
              software solution or analyze your data for actionable insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                <UserGroupIcon className="w-5 h-5 mr-2" />
                Start a Conversation
              </Link>
              <Link
                to="/projects"
                className="inline-flex items-center px-8 py-4 border-2 border-do_border_light dark:border-do_border_dark text-do_text_light dark:text-do_text_dark font-semibold rounded-lg hover:bg-do_card_light dark:hover:bg-do_card_dark transition-all duration-300"
              >
                <RocketLaunchIcon className="w-5 h-5 mr-2" />
                View Portfolio
              </Link>
            </div>
          </div>
        </div>

        {/* Theme Testing Section */}
        <div className="px-4 py-16 lg:px-8 bg-gray-50 dark:bg-gray-900">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                🎨 Sistema de Tema - Pruebas
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Prueba el nuevo sistema de tema centralizado
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ThemeInfo />
              <AuthInfo />
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🎛️ Selector de Tema
                </h3>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Usa el selector de tema en el header para cambiar entre:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>
                      • <strong>Sistema:</strong> Sigue la configuración del
                      sistema operativo
                    </li>
                    <li>
                      • <strong>Claro:</strong> Tema claro fijo
                    </li>
                    <li>
                      • <strong>Oscuro:</strong> Tema oscuro fijo
                    </li>
                  </ul>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    El tema se guarda automáticamente y se sincroniza entre
                    pestañas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
