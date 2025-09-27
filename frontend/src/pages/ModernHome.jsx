import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  RocketLaunchIcon,
  UserGroupIcon,
  SparklesIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CodeBracketIcon,
  ChartBarIcon,
  CpuChipIcon,
  CloudIcon,
  ShieldCheckIcon,
  CogIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import Header from "../components/Header";

const ModernHome = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Efecto para mostrar/ocultar botón de volver arriba
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      setShowBackToTop(scrollTop > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navegación por teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        scrollToNextSection();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        const sections = ["hero", "services", "technologies", "contact"];
        const windowHeight = window.innerHeight;

        let currentSectionIndex = 0;
        sections.forEach((sectionId, index) => {
          const element = document.getElementById(sectionId);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 0 && rect.bottom > windowHeight / 2) {
              currentSectionIndex = index;
            }
          }
        });

        const prevIndex = Math.max(currentSectionIndex - 1, 0);
        const prevSection = document.getElementById(sections[prevIndex]);
        if (prevSection) {
          prevSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Función para volver arriba
  const scrollToTop = () => {
    const heroSection = document.getElementById("hero");
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Función para ir a la siguiente sección
  const scrollToNextSection = () => {
    const sections = ["hero", "services", "technologies", "contact"];
    const windowHeight = window.innerHeight;

    // Encontrar la sección actual
    let currentSectionIndex = 0;
    sections.forEach((sectionId, index) => {
      const element = document.getElementById(sectionId);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 0 && rect.bottom > windowHeight / 2) {
          currentSectionIndex = index;
        }
      }
    });

    // Ir a la siguiente sección
    const nextIndex = Math.min(currentSectionIndex + 1, sections.length - 1);
    const nextSection = document.getElementById(sections[nextIndex]);
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Definición de bullets para cada tarjeta
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
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>
      <div
        id="hero"
        className="section-snap relative min-h-screen overflow-hidden bg-do_bg_light dark:bg-do_bg_dark pt-14 md:pt-16"
      >
        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
          {/* Logo/Brand Section */}
          <div
            className={`transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="mb-8">
              <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-r from-[#0272AD]/10 to-[#0272AD]/5 backdrop-blur-sm border border-[#0272AD]/20 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0272AD] to-[#0272AD] rounded-xl blur-lg opacity-30"></div>
                  <div className="relative bg-gradient-to-r from-[#0272AD] to-[#0272AD] bg-clip-text text-transparent text-5xl md:text-7xl font-black tracking-tight">
                    ruizdev7
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mb-4">
                <SparklesIcon className="w-6 h-6 text-[#0272AD] animate-pulse" />
                <span className="text-lg font-semibold text-do_text_gray_light dark:text-do_text_gray_dark">
                  Portfolio
                </span>
                <SparklesIcon className="w-6 h-6 text-[#0272AD] animate-pulse" />
              </div>
            </div>
          </div>

          {/* Hero Text */}
          <div
            className={`max-w-5xl mx-auto mb-10 transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-do_text_light dark:text-do_text_dark">
                Software Developer &
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#0272AD] via-[#0272AD] to-[#0272AD] bg-clip-text text-transparent">
                Data Analyst
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-do_text_gray_light dark:text-do_text_gray_dark mb-8 leading-relaxed max-w-4xl mx-auto">
              Transforming ideas into powerful, scalable solutions with modern
              technology and data-driven insights
            </p>

            {/* Tech Stack Indicators */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {["React", "Python", "Flask", "PostgreSQL", "AWS"].map(
                (tech, index) => (
                  <div
                    key={tech}
                    className="px-4 py-2 bg-gradient-to-r from-[#0272AD]/10 to-[#0272AD]/5 border border-[#0272AD]/20 rounded-full text-sm font-medium text-[#0272AD] backdrop-blur-sm"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {tech}
                  </div>
                )
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-6 justify-center items-center mb-12 transition-all duration-1000 delay-500 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <Link
              to="/projects"
              className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#0272AD] to-[#0272AD] text-white font-semibold rounded-xl hover:from-[#0272AD]/90 hover:to-[#0272AD]/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#0272AD] to-[#0272AD] rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <RocketLaunchIcon className="w-5 h-5 mr-3 relative z-10" />
              <span className="relative z-10">View My Work</span>
            </Link>

            <Link
              to="/contact"
              className="group inline-flex items-center px-8 py-4 border-2 border-[#0272AD] text-[#0272AD] dark:text-[#0272AD] font-semibold rounded-xl hover:bg-[#0272AD] hover:text-white transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
            >
              <UserGroupIcon className="w-5 h-5 mr-3" />
              Get In Touch
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div
            className={`transition-all duration-1000 delay-700 cursor-pointer ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
            onClick={scrollToNextSection}
          >
            <div className="flex flex-col items-center text-do_text_gray_light dark:text-do_text_gray_dark hover:text-[#0272AD] transition-colors">
              <span className="text-sm mb-2">Scroll to explore</span>
              <ArrowDownIcon className="w-5 h-5 animate-bounce text-[#0272AD]" />
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div
        id="services"
        className="section-snap min-h-screen px-4 py-20 lg:px-8 bg-do_bg_light dark:bg-do_bg_dark flex flex-col justify-center"
      >
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
                  className="mt-4 text-[#0272AD] hover:text-[#0272AD]/80 font-semibold text-sm focus:outline-none transition-colors"
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
      <div
        id="technologies"
        className="section-snap min-h-screen px-4 py-20 lg:px-8 bg-do_bg_light dark:bg-do_bg_dark flex flex-col justify-center"
      >
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

      {/* Final CTA Section */}
      <div
        id="contact"
        className="section-snap min-h-screen px-4 py-20 lg:px-8 bg-do_bg_light dark:bg-do_bg_dark flex flex-col justify-center"
      >
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-do_text_light dark:text-do_text_dark mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-lg text-do_text_gray_light dark:text-do_text_gray_dark mb-8">
            Let&apos;s discuss how I can help you build the next great software
            solution or analyze your data for actionable insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#0272AD] to-[#0272AD] text-white font-semibold rounded-lg hover:from-[#0272AD]/90 hover:to-[#0272AD]/90 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <UserGroupIcon className="w-5 h-5 mr-2" />
              Start a Conversation
            </Link>
            <Link
              to="/projects"
              className="inline-flex items-center px-8 py-4 border-2 border-[#0272AD] text-[#0272AD] font-semibold rounded-lg hover:bg-[#0272AD] hover:text-white transition-all duration-300"
            >
              <RocketLaunchIcon className="w-5 h-5 mr-2" />
              View Portfolio
            </Link>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0272AD] hover:bg-[#0272AD]/90 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Volver arriba"
        >
          <ArrowUpIcon className="w-5 h-5" />
        </button>
      )}
    </>
  );
};

export default ModernHome;
