import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  RocketLaunchIcon,
  UserGroupIcon,
  SparklesIcon,
  ArrowDownIcon,
  CodeBracketIcon,
  ChartBarIcon,
  CpuChipIcon,
  CloudIcon,
  ShieldCheckIcon,
  CogIcon,
  CheckCircleIcon,
  Squares2X2Icon,
  Bars3Icon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import Header from "../components/Header";
import KeyboardNavigation from "../components/KeyboardNavigation";
import { useTheme } from "../contexts/ThemeContext";

import techDark from "../assets/img/tech-dark.svg";
import techLight from "../assets/img/tech-light.svg";

const ModernHome = () => {
  const { currentTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [hoveredTechnology, setHoveredTechnology] = useState(null);
  const [selectedTechnology, setSelectedTechnology] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [showTechImageModal, setShowTechImageModal] = useState(false);
  const [viewMode, setViewMode] = useState("mosaic"); // 'mosaic' or 'row'
  const [chatRole, setChatRole] = useState(null); // 'visitor' | 'recruiter'
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showContactButton, setShowContactButton] = useState(false);

  // Try to guess initial language from browser, fallback to English
  const detectInitialLanguage = () => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return "en";
    }
    const lang = navigator.language || navigator.userLanguage || "en";
    const lower = lang.toLowerCase();
    if (lower.startsWith("es")) return "es";
    if (lower.startsWith("de")) return "de";
    if (lower.startsWith("pl")) return "pl";
    if (
      lower.startsWith("uk") ||
      lower.startsWith("uk-") ||
      lower.startsWith("uk_")
    )
      return "uk";
    return "en";
  };

  const [selectedLanguage, setSelectedLanguage] = useState(
    detectInitialLanguage
  ); // 'es', 'de', 'en', 'pl', 'uk'
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const languages = [
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "pl", name: "Polski", flag: "🇵🇱" },
    { code: "uk", name: "Українська", flag: "🇺🇦" },
  ];

  const getIntroMessage = (role, language) => {
    const introMessages = {
      es:
        role === "visitor"
          ? "👋 Hola, soy el asistente virtual de Jose. Cuéntame qué tipo de proyecto o idea tienes en mente y te guiaré."
          : "👋 Hola, soy el asistente virtual de Jose. Puedo responder preguntas técnicas y sobre experiencia para tu proceso de contratación.",
      de:
        role === "visitor"
          ? "👋 Hallo, ich bin Jose's virtueller Assistent. Erzählen Sie mir, welche Art von Projekt oder Idee Sie im Kopf haben, und ich werde Sie führen."
          : "👋 Hallo, ich bin Jose's virtueller Assistent. Ich kann technische Fragen und Fragen zur Erfahrung für Ihren Einstellungsprozess beantworten.",
      en:
        role === "visitor"
          ? "👋 Hi, I'm Jose's virtual assistant. Tell me what kind of project or idea you have in mind and I'll guide you."
          : "👋 Hi, I'm Jose's virtual assistant. I can answer technical and experience-related questions for your hiring process.",
      pl:
        role === "visitor"
          ? "👋 Cześć, jestem wirtualnym asystentem Jose. Powiedz mi, jaki rodzaj projektu lub pomysłu masz na myśli, a ja Cię poprowadzę."
          : "👋 Cześć, jestem wirtualnym asystentem Jose. Mogę odpowiedzieć na pytania techniczne i dotyczące doświadczenia w Twoim procesie rekrutacji.",
      uk:
        role === "visitor"
          ? "👋 Привіт, я віртуальний помічник Хосе. Розкажи мені, який проект або ідею ти маєш на увазі, і я допоможу тобі."
          : "👋 Привіт, я віртуальний помічник Хосе. Можу відповісти на технічні питання та питання про досвід для вашого процесу найму.",
    };
    return introMessages[language] || introMessages.en;
  };

  const resetChat = () => {
    setChatMessages([]);
    setChatInput("");
    setChatRole(null);
    setIsStreaming(false);
    setShowContactButton(false);
    // Keep language selection when resetting
  };

  // Auto-scroll to bottom when messages change
  const scrollToBottom = (forceInstant = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: forceInstant ? "auto" : "smooth",
        block: "end",
      });
    }
  };

  useEffect(() => {
    // Scroll when messages change or streaming state changes
    const timer = setTimeout(() => scrollToBottom(), 100);
    return () => clearTimeout(timer);
  }, [chatMessages, isStreaming]);

  // Update intro message when language changes (keep rest of conversation)
  useEffect(() => {
    if (!chatRole || chatMessages.length === 0) return;

    const firstMessage = chatMessages[0];
    if (firstMessage.from !== "assistant") return;

    const newIntro = getIntroMessage(chatRole, selectedLanguage);
    if (firstMessage.text === newIntro) return;

    const updated = [...chatMessages];
    updated[0] = { ...firstMessage, text: newIntro };
    setChatMessages(updated);
  }, [selectedLanguage, chatRole, chatMessages]);

  const handleStartChat = (role) => {
    resetChat();
    setChatRole(role);
    const introMessage = getIntroMessage(role, selectedLanguage);
    setChatMessages([
      {
        from: "assistant",
        text: introMessage,
      },
    ]);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !chatRole || isStreaming) return;

    const userMessage = chatInput.trim();
    const newMessages = [...chatMessages, { from: "user", text: userMessage }];
    setChatMessages(newMessages);
    setChatInput("");
    setIsStreaming(true);
    setShowContactButton(false); // Ocultar botón cuando se envía un nuevo mensaje

    try {
      const payload = {
        role: chatRole,
        language: selectedLanguage, // Include selected language
        messages: newMessages.map((m) => ({
          role: m.from === "assistant" ? "assistant" : "user",
          content: m.text,
        })),
      };

      const response = await fetch("/api/v1/portfolio/chat-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok || !response.body) {
        throw new Error("Could not start streaming response.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let assistantBuffer = "";

      // Añadir mensaje de assistant vacío que iremos rellenando
      setChatMessages((prev) => [...prev, { from: "assistant", text: "" }]);

      const processChunk = async () => {
        const { done, value } = await reader.read();
        if (done) {
          setIsStreaming(false);
          // Mostrar botón de contacto si hay mensajes del asistente
          setTimeout(() => {
            setChatMessages((prev) => {
              const hasAssistantMessages = prev.some(
                (msg) => msg.from === "assistant" && msg.text.trim()
              );
              if (hasAssistantMessages) {
                setShowContactButton(true);
              }
              return prev;
            });
          }, 100);
          return;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");

        lines.forEach((block) => {
          if (!block.startsWith("data:")) return;
          const jsonStr = block.replace("data:", "").trim();
          if (!jsonStr) return;
          try {
            const event = JSON.parse(jsonStr);
            if (event.type === "chunk" && event.content) {
              assistantBuffer += event.content;
              setChatMessages((prev) => {
                const updated = [...prev];
                const lastIndex = updated.length - 1;
                if (lastIndex >= 0 && updated[lastIndex].from === "assistant") {
                  updated[lastIndex] = {
                    ...updated[lastIndex],
                    text: assistantBuffer,
                  };
                }
                return updated;
              });
              // Auto-scroll during streaming (throttled)
              if (messagesEndRef.current) {
                setTimeout(() => scrollToBottom(), 50);
              }
            } else if (event.type === "complete") {
              // Conversación completada, mostrar botón de contacto
              setIsStreaming(false);
              // Verificar que hay mensajes del asistente antes de mostrar el botón
              setChatMessages((prev) => {
                const hasAssistantMessages = prev.some(
                  (msg) => msg.from === "assistant" && msg.text.trim()
                );
                if (hasAssistantMessages) {
                  setShowContactButton(true);
                }
                return prev;
              });
            } else if (event.type === "error") {
              setChatMessages((prev) => [
                ...prev,
                {
                  from: "system",
                  text: `Error: ${event.error}`,
                },
              ]);
              setIsStreaming(false);
            }
          } catch {
            // Ignorar errores de parseo individuales
          }
        });

        await processChunk();
      };

      await processChunk();
    } catch (err) {
      setIsStreaming(false);
      setChatMessages((prev) => [
        ...prev,
        {
          from: "system",
          text: "There was a problem connecting to the local model. Make sure Ollama is running and try again.",
        },
      ]);
    }
  };

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

        // Usar la misma lógica mejorada para detectar la sección actual
        let currentSectionIndex = 0;
        let bestMatch = 0;
        let minDistance = Infinity;

        sections.forEach((sectionId, index) => {
          const element = document.getElementById(sectionId);
          if (element) {
            const rect = element.getBoundingClientRect();
            const elementCenter = rect.top + rect.height / 2;
            const viewportCenter = windowHeight / 2;
            const distance = Math.abs(elementCenter - viewportCenter);

            // Si el elemento está visible en el viewport
            if (rect.top < windowHeight && rect.bottom > 0) {
              if (distance < minDistance) {
                minDistance = distance;
                bestMatch = index;
              }
            }

            // También considerar elementos que están parcialmente visibles
            if (rect.top <= 0 && rect.bottom > 0) {
              currentSectionIndex = index;
            }
          }
        });

        // Usar el mejor match si no encontramos una sección activa
        if (currentSectionIndex === 0 && bestMatch > 0) {
          currentSectionIndex = bestMatch;
        }

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

    // Encontrar la sección actual usando una lógica más robusta
    let currentSectionIndex = 0;
    let bestMatch = 0;
    let minDistance = Infinity;

    sections.forEach((sectionId, index) => {
      const element = document.getElementById(sectionId);
      if (element) {
        const rect = element.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const viewportCenter = windowHeight / 2;
        const distance = Math.abs(elementCenter - viewportCenter);

        // Si el elemento está visible en el viewport
        if (rect.top < windowHeight && rect.bottom > 0) {
          if (distance < minDistance) {
            minDistance = distance;
            bestMatch = index;
          }
        }

        // También considerar elementos que están parcialmente visibles
        if (rect.top <= 0 && rect.bottom > 0) {
          currentSectionIndex = index;
        }
      }
    });

    // Usar el mejor match si no encontramos una sección activa
    if (currentSectionIndex === 0 && bestMatch > 0) {
      currentSectionIndex = bestMatch;
    }

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

  // Definir las tecnologías con imágenes específicas
  const technologies = [
    {
      id: "frontend",
      name: "Frontend Development",
      description: "React, Vite, Tailwind CSS, Redux Toolkit Query",
      details: [
        "Modern React development with hooks and functional components",
        "Fast development with Vite build tool and hot module replacement",
        "Responsive UI design with Tailwind CSS utility-first framework",
        "Efficient state management and API integration with Redux Toolkit Query",
      ],
      icon: "⚛️",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      id: "backend",
      name: "Backend Development",
      description:
        "Python, Flask, Django, FastAPI, PostgreSQL, MySQL, API, SQLAlchemy",
      details: [
        "Python backend development with Flask, Django, and FastAPI frameworks",
        "RESTful API design and implementation with comprehensive documentation",
        "Database management with PostgreSQL and MySQL using SQLAlchemy ORM",
        "Authentication, authorization, and secure API endpoints",
      ],
      icon: "🐍",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      id: "devops",
      name: "DevOps & Cloud",
      description:
        "Docker, Docker Compose, CI/CD, Git, Linux, Nginx, AWS, GitHub Actions",
      details: [
        "Containerization and orchestration with Docker and Docker Compose",
        "Automated CI/CD pipelines with GitHub Actions",
        "AWS cloud services deployment and management",
        "Linux server administration and Nginx web server configuration",
      ],
      icon: "☁️",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      id: "data",
      name: "Data & Analytics",
      description: "PostgresSQL, MySQL, Excel, Power BI, Tableau",
      details: [
        "Database management with PostgreSQL and MySQL",
        "Data analysis and reporting with Microsoft Excel",
        "Interactive dashboards and business intelligence with Power BI",
        "Advanced data visualization and analytics with Tableau",
      ],
      icon: "📊",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      id: "tools",
      name: "Development Tools",
      description: "Git, Postman, VS Code, Cursor, Linux, Nginx",
      details: [
        "Version control and collaboration with Git",
        "API development and testing with Postman",
        "Code editing and development with VS Code and Cursor",
        "Linux server administration and Nginx configuration",
      ],
      icon: "🛠️",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      id: "security",
      name: "Security & Best Practices",
      description: "Authentication, OWASP, Code Reviews, JWT Tokens",
      details: [
        "Authentication and authorization systems",
        "Security best practices following OWASP guidelines",
        "Code review processes and quality assurance",
        "JWT token implementation and management",
      ],
      icon: "🔒",
      image:
        "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg",
      color: "from-teal-500 to-blue-500",
      bgColor: "bg-teal-50 dark:bg-teal-900/20",
    },
  ];

  // Funciones para manejar interacciones
  const handleTechnologyHover = (tech) => {
    setHoveredTechnology(tech);
  };

  const handleTechnologyClick = (tech) => {
    setSelectedTechnology(tech);
  };

  const handleTechnologyLeave = () => {
    setHoveredTechnology(null);
  };

  const closeTechnologyModal = () => {
    setSelectedTechnology(null);
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
        <div className="relative z-10">
          <div className="mx-auto max-w-7xl flex flex-col lg:flex-row items-stretch justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8">
            {/* Left column: Branding, title, CTAs */}
            <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left justify-center">
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
                className={`max-w-3xl mx-auto lg:mx-0 mb-6 transition-all duration-1000 delay-300 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  <span className="text-do_text_light dark:text-do_text_dark">
                    Software Developer &
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-[#0272AD] via-[#0272AD] to-[#0272AD] bg-clip-text text-transparent">
                    Data Analyst
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-do_text_gray_light dark:text-do_text_gray_dark mb-6 leading-relaxed max-w-2xl">
                  Transforming ideas into scalable, production-ready solutions
                  using modern web technologies, data analysis and cloud-native
                  architectures.
                </p>

                {/* Tech Stack Indicators */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
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
                className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-6 transition-all duration-1000 delay-500 ${
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
                  className="group inline-flex items-center px-8 py-4 border-2 border-[#0272AD] text-[#0272AD] dark:text-white font-semibold rounded-xl hover:bg-[#0272AD] hover:text-white transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                >
                  <UserGroupIcon className="w-5 h-5 mr-3" />
                  Get In Touch
                </Link>
              </div>
            </div>

            {/* Right column: Chat / virtual interview */}
            <div className="mt-10 lg:mt-0 lg:ml-10 flex-1 max-w-lg w-full self-center flex">
              <div className="bg-do_card_light dark:bg-do_card_dark border border-do_border_light dark:border-do_border_dark rounded-2xl shadow-lg p-4 md:p-5 w-full flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#0272AD] flex items-center justify-center text-white text-sm font-semibold">
                      D
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm md:text-base font-semibold text-do_text_light dark:text-do_text_dark">
                          Virtual Interview
                        </h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-do_bg_light dark:bg-do_bg_dark text-do_text_gray_light dark:text-do_text_gray_dark border border-do_border_light dark:border-do_border_dark">
                          <ChatBubbleLeftRightIcon className="w-3 h-3" />
                          Advisory / Recruitment
                        </span>
                      </div>
                      <p className="text-[11px] md:text-xs text-do_text_gray_light dark:text-do_text_gray_dark mt-1">
                        Choose how you want to talk with me: as a potential
                        client or as a recruiter evaluating my profile.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Role buttons */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => handleStartChat("visitor")}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                      chatRole === "visitor"
                        ? "bg-[#0272AD] text-white border-[#0272AD]"
                        : "bg-do_bg_light dark:bg-do_bg_dark border-do_border_light dark:border-do_border_dark text-do_text_gray_light dark:text-do_text_gray_dark hover:border-[#0272AD] hover:text-[#0272AD]"
                    }`}
                  >
                    I&apos;m a visitor / potential client
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartChat("recruiter")}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                      chatRole === "recruiter"
                        ? "bg-[#0272AD] text-white border-[#0272AD]"
                        : "bg-do_bg_light dark:bg-do_bg_dark border-do_border_light dark:border-do_border_dark text-do_text_gray_light dark:text-do_text_gray_dark hover:border-[#0272AD] hover:text-[#0272AD]"
                    }`}
                  >
                    I&apos;m a recruiter / HR
                  </button>
                </div>

                {/* Language selector */}
                {chatRole && (
                  <div className="mb-3">
                    <div className="flex flex-col gap-0.5 mb-1.5">
                      <span className="text-[10px] text-do_text_gray_light dark:text-do_text_gray_dark">
                        Response language:
                      </span>
                      <span className="text-[9px] text-do_text_gray_light dark:text-do_text_gray_dark">
                        You can switch it at any time, the assistant will answer
                        in the selected language.
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => setSelectedLanguage(lang.code)}
                          className={`px-2 py-1 rounded-lg text-xs border transition-all duration-200 ${
                            selectedLanguage === lang.code
                              ? "bg-[#0272AD] text-white border-[#0272AD] shadow-sm scale-105"
                              : "bg-do_bg_light dark:bg-do_bg_dark border-do_border_light dark:border-do_border_dark text-do_text_gray_light dark:text-do_text_gray_dark hover:border-[#0272AD] hover:text-[#0272AD] hover:scale-105"
                          }`}
                          title={lang.name}
                        >
                          <span className="text-base">{lang.flag}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div
                  ref={messagesContainerRef}
                  className="max-h-56 overflow-y-auto space-y-3 mb-3 border border-dashed border-do_border_light dark:border-do_border_dark rounded-xl px-3 py-3 bg-do_bg_light/60 dark:bg-do_bg_dark/60 scroll-smooth"
                  style={{ scrollBehavior: "smooth" }}
                >
                  {chatMessages.length === 0 && (
                    <div className="text-[11px] text-do_text_gray_light dark:text-do_text_gray_dark text-center py-4">
                      Once you select a role, you&apos;ll see a short
                      conversation here powered by a local model with my resume
                      as context. It&apos;s a quick way to understand how I can
                      help in your project or hiring process.
                    </div>
                  )}
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={`${msg.from}-${idx}-${msg.text.slice(0, 6)}`}
                      className={`flex items-start gap-2 ${
                        msg.from === "user" ? "justify-end" : "justify-start"
                      } animate-fadeIn`}
                    >
                      {msg.from === "assistant" && (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0272AD] to-[#0294D8] flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0 shadow-sm">
                          AI
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm transition-all duration-200 ${
                          msg.from === "user"
                            ? "bg-gradient-to-br from-[#0272AD] to-[#0294D8] text-white rounded-br-sm"
                            : msg.from === "assistant"
                            ? "bg-white dark:bg-gray-800 text-do_text_light dark:text-do_text_dark rounded-bl-sm border border-do_border_light dark:border-do_border_dark"
                            : "bg-transparent text-do_text_gray_light dark:text-do_text_gray_dark text-[10px]"
                        }`}
                      >
                        <div className="whitespace-pre-wrap break-words">
                          {msg.text}
                          {isStreaming &&
                            idx === chatMessages.length - 1 &&
                            msg.from === "assistant" &&
                            msg.text && (
                              <span className="inline-block w-2 h-3 ml-1 bg-[#0272AD] dark:bg-[#0294D8] animate-pulse"></span>
                            )}
                        </div>
                      </div>
                      {msg.from === "user" && (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0 shadow-sm">
                          You
                        </div>
                      )}
                    </div>
                  ))}
                  {isStreaming &&
                    chatMessages.length > 0 &&
                    chatMessages[chatMessages.length - 1]?.from !==
                      "assistant" && (
                      <div className="flex items-center gap-2 justify-start animate-fadeIn">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0272AD] to-[#0294D8] flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0 shadow-sm">
                          AI
                        </div>
                        <div className="flex gap-1 px-3 py-2 bg-white dark:bg-gray-800 rounded-2xl rounded-bl-sm border border-do_border_light dark:border-do_border_dark shadow-sm">
                          <span className="w-2 h-2 bg-[#0272AD] rounded-full animate-bounce"></span>
                          <span
                            className="w-2 h-2 bg-[#0272AD] rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></span>
                          <span
                            className="w-2 h-2 bg-[#0272AD] rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></span>
                        </div>
                      </div>
                    )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Contact Button - Show after conversation ends */}
                {showContactButton &&
                  !isStreaming &&
                  chatMessages.length > 0 && (
                    <div className="mb-3 animate-fadeIn">
                      <Link
                        to="/contact"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#0272AD] to-[#0294D8] text-white text-xs font-semibold rounded-xl hover:from-[#0272AD]/90 hover:to-[#0294D8]/90 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                      >
                        <span>Get in Touch</span>
                        <ArrowDownIcon className="w-4 h-4 rotate-[-45deg]" />
                      </Link>
                    </div>
                  )}

                {/* Input */}
                <form
                  className="flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendChat();
                  }}
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      chatRole
                        ? "Type a short message here…"
                        : "First select if you are a visitor or recruiter"
                    }
                    disabled={!chatRole || isStreaming}
                    className="flex-1 text-xs rounded-lg px-2 py-1.5 bg-do_bg_light dark:bg-do_bg_dark border border-do_border_light dark:border-do_border_dark text-do_text_light dark:text-do_text_dark placeholder:text-do_text_gray_light dark:placeholder:text-do_text_gray_dark focus:outline-none focus:border-[#0272AD]"
                  />
                  <button
                    type="submit"
                    disabled={!chatRole || !chatInput.trim() || isStreaming}
                    className="p-1.5 rounded-full bg-[#0272AD] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0272AD]/90 transition-colors"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                  </button>
                </form>

                {isStreaming && (
                  <p className="mt-2 text-[11px] text-do_text_gray_light dark:text-do_text_gray_dark">
                    Generating answer from local model…
                  </p>
                )}
              </div>
            </div>

            {/* Scroll Indicator */}
            <div
              className={`absolute bottom-10 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-700 cursor-pointer ${
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
      </div>

      {/* Services Section */}
      <div
        id="services"
        className="section-snap min-h-screen px-4 py-20 lg:px-8 bg-do_bg_light dark:bg-do_bg_dark flex flex-col justify-center"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
              <div className="flex-1 text-center md:text-left w-full md:w-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-do_text_light dark:text-do_text_dark mb-4">
                  Services I Offer
                </h2>
                <p className="text-base md:text-lg text-do_text_gray_light dark:text-do_text_gray_dark max-w-2xl md:max-w-3xl mx-auto md:mx-0 line-clamp-2">
                  Comprehensive software development and data analysis services
                  to help your business grow and succeed in the digital age
                </p>
              </div>
              <div className="flex-shrink-0">
                {/* View Toggle Button */}
                <div className="flex items-center gap-2 bg-do_card_light dark:bg-do_card_dark rounded-lg p-1 border border-do_border_light dark:border-do_border_dark shadow-sm">
                  <button
                    onClick={() => setViewMode("mosaic")}
                    className={`p-2 rounded transition-all duration-200 ${
                      viewMode === "mosaic"
                        ? "bg-[#0272AD] text-white shadow-md"
                        : "text-do_text_gray_light dark:text-do_text_gray_dark hover:bg-do_bg_light dark:hover:bg-do_bg_dark"
                    }`}
                    aria-label="Mosaic view"
                    title="Mosaic view"
                  >
                    <Squares2X2Icon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("row")}
                    className={`p-2 rounded transition-all duration-200 ${
                      viewMode === "row"
                        ? "bg-[#0272AD] text-white shadow-md"
                        : "text-do_text_gray_light dark:text-do_text_gray_dark hover:bg-do_bg_light dark:hover:bg-do_bg_dark"
                    }`}
                    aria-label="Row view"
                    title="Row view"
                  >
                    <Bars3Icon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Services Display - Mosaic or Row */}
          {viewMode === "mosaic" ? (
            /* Mosaic View - Compact Cards with Modal - Wider for 2-line description */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className="bg-do_card_light dark:bg-do_card_dark rounded-xl p-5 border border-do_border_light dark:border-do_border_dark hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                >
                  <div
                    className={`inline-flex p-2.5 rounded-lg bg-gradient-to-r ${service.color} mb-3`}
                  >
                    <service.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-do_text_light dark:text-do_text_dark mb-2 leading-tight">
                    {service.title}
                  </h3>
                  <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark mb-3 line-clamp-2 min-h-[2.5rem]">
                    {service.description}
                  </p>
                  <p className="text-xs text-[#0272AD] font-semibold">
                    Click for details →
                  </p>
                </div>
              ))}
            </div>
          ) : (
            /* Row View - One service per row */
            <div className="flex flex-col gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className="bg-do_card_light dark:bg-do_card_dark rounded-xl p-6 border border-do_border_light dark:border-do_border_dark hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                >
                  {/* Icon and Title Section - Horizontal layout */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${service.color} flex-shrink-0`}
                    >
                      <service.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-do_text_light dark:text-do_text_dark mb-2 leading-tight break-words">
                        {service.title}
                      </h3>
                      <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark leading-relaxed break-words">
                        {service.description}
                      </p>
                      <p className="mt-3 text-xs text-[#0272AD] font-semibold">
                        Click for details →
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Service Details Modal */}
          {selectedService && (
            <div
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedService(null)}
            >
              <div
                className="relative max-w-3xl w-full mx-4 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header del modal */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div
                      className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${selectedService.color}`}
                    >
                      <selectedService.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedService.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {selectedService.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedService(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    title="Close"
                  >
                    <span className="text-xl text-gray-500 dark:text-gray-400">
                      ✕
                    </span>
                  </button>
                </div>

                {/* Contenido del modal */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Key Features & Capabilities
                  </h4>
                  <ul className="space-y-3">
                    {selectedService.bullets.map((bullet, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                          {bullet}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer del modal */}
                <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-end items-center">
                    <Link
                      to="/contact"
                      onClick={() => setSelectedService(null)}
                      className="px-6 py-2 bg-[#0272AD] text-white rounded-lg hover:bg-[#0272AD]/90 transition-colors text-sm font-medium"
                    >
                      Get In Touch
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Technologies & Experience Section */}
      <div
        id="technologies"
        className="section-snap min-h-screen px-4 py-20 lg:px-8 bg-do_bg_light dark:bg-do_bg_dark flex flex-col justify-center"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
              <div className="flex-1 text-center md:text-left w-full md:w-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-do_text_light dark:text-do_text_dark mb-4">
                  Technologies & Expertise
                </h2>
                <p className="text-base md:text-lg text-do_text_gray_light dark:text-do_text_gray_dark max-w-2xl md:max-w-3xl mx-auto md:mx-0 line-clamp-2">
                  Modern tech stack and proven methodologies for delivering
                  exceptional results
                </p>
              </div>
            </div>
          </div>

          {/* Layout de imagen + tooltips al lado derecho */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-4 mb-4 items-start">
            {/* Lado izquierdo: Imagen + Devops y Security */}
            <div className="order-2 lg:order-1 flex flex-col gap-4 w-full">
              {/* Imagen de tecnologías */}
              <div className="flex flex-col items-center lg:items-start w-full">
                <div className="w-full flex justify-center lg:justify-start">
                  <img
                    src={currentTheme === "dark" ? techDark : techLight}
                    alt="Technologies and Expertise - Interactive Map"
                    onClick={() => setShowTechImageModal(true)}
                    className="w-full max-w-full h-auto object-contain rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 hidden lg:block"
                    style={{ maxHeight: "275px" }}
                  />
                </div>
              </div>

              {/* Tarjetas de Devops y Security debajo de la imagen */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                {technologies
                  .filter(
                    (tech) => tech.id === "devops" || tech.id === "security"
                  )
                  .map((tech) => (
                    <div
                      key={tech.id}
                      className={`relative p-3 md:p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer group flex flex-col ${
                        hoveredTechnology?.id === tech.id
                          ? "border-[#0272AD] shadow-lg transform scale-105"
                          : "border-gray-200 dark:border-gray-700 hover:border-[#0272AD]/50"
                      } ${tech.bgColor}`}
                      onMouseEnter={() => handleTechnologyHover(tech)}
                      onMouseLeave={handleTechnologyLeave}
                      onClick={() => handleTechnologyClick(tech)}
                    >
                      {/* Contenido de la tarjeta */}
                      <div className="flex items-start gap-2 md:gap-3">
                        {/* Imagen de la tecnología */}
                        <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">
                          <img
                            src={tech.image}
                            alt={tech.name}
                            className="w-6 h-6 md:w-8 md:h-8 object-contain"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "block";
                            }}
                          />
                          <span className="text-2xl hidden">{tech.icon}</span>
                        </div>

                        {/* Información de la tecnología */}
                        <div className="flex-1 min-w-0 max-w-full">
                          <h4 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-[#0272AD] transition-colors break-words">
                            {tech.name}
                          </h4>
                          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2 break-words">
                            {tech.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <div
                                className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gradient-to-r ${tech.color}`}
                              ></div>
                              {
                                tech.description.split(", ").filter(Boolean)
                                  .length
                              }{" "}
                              technologies
                            </span>
                            <span>•</span>
                            <span>Click for details</span>
                          </div>
                        </div>

                        {/* Indicador de hover */}
                        <div
                          className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gradient-to-r ${tech.color} opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0`}
                        ></div>
                      </div>

                      {/* Efecto de gradiente en hover */}
                      {hoveredTechnology?.id === tech.id && (
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${tech.color} opacity-5 rounded-lg pointer-events-none`}
                        ></div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Panel de tecnologías - Resto de las tarjetas */}
            <div className="order-1 lg:order-2 w-full max-w-full flex flex-col">
              <div className="grid grid-cols-2 gap-3 w-full">
                {technologies
                  .filter(
                    (tech) => tech.id !== "devops" && tech.id !== "security"
                  )
                  .map((tech) => (
                    <div
                      key={tech.id}
                      className={`relative p-3 md:p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer group flex flex-col min-h-[140px] ${
                        hoveredTechnology?.id === tech.id
                          ? "border-[#0272AD] shadow-lg transform scale-105"
                          : "border-gray-200 dark:border-gray-700 hover:border-[#0272AD]/50"
                      } ${tech.bgColor}`}
                      onMouseEnter={() => handleTechnologyHover(tech)}
                      onMouseLeave={handleTechnologyLeave}
                      onClick={() => handleTechnologyClick(tech)}
                    >
                      {/* Contenido de la tarjeta - Centrado verticalmente y horizontalmente */}
                      <div className="flex flex-col items-center justify-between text-center gap-2 flex-1 py-2">
                        {/* Imagen de la tecnología */}
                        <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">
                          <img
                            src={tech.image}
                            alt={tech.name}
                            className="w-8 h-8 md:w-9 md:h-9 object-contain"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "block";
                            }}
                          />
                          <span className="text-2xl hidden">{tech.icon}</span>
                        </div>

                        {/* Información de la tecnología */}
                        <div className="flex flex-col items-center justify-center min-w-0 w-full flex-1">
                          <h4 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-[#0272AD] transition-colors break-words">
                            {tech.name}
                          </h4>
                          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2 break-words px-1">
                            {tech.description}
                          </p>
                        </div>

                        {/* Footer de la tarjeta */}
                        <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2 text-xs text-gray-500 dark:text-gray-400 mt-auto">
                          <span className="flex items-center gap-1">
                            <div
                              className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gradient-to-r ${tech.color}`}
                            ></div>
                            {
                              tech.description.split(", ").filter(Boolean)
                                .length
                            }{" "}
                            techs
                          </span>
                          <span>•</span>
                          <span>Details</span>
                        </div>
                      </div>

                      {/* Efecto de gradiente en hover */}
                      {hoveredTechnology?.id === tech.id && (
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${tech.color} opacity-5 rounded-lg pointer-events-none`}
                        ></div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          </div> */}
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

      {/* Modal de imagen de tecnología ampliada */}
      {showTechImageModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowTechImageModal(false)}
        >
          <div
            className="relative max-w-6xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTechImageModal(false)}
              className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
              title="Close"
              aria-label="Close modal"
            >
              <span className="text-2xl">✕</span>
            </button>
            <img
              src={currentTheme === "dark" ? techDark : techLight}
              alt="Technologies and Expertise - Interactive Map (Enlarged)"
              className="w-full h-auto object-contain rounded-lg border-2 border-white/20 shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Modal de detalles de tecnología */}
      {selectedTechnology && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeTechnologyModal}
        >
          <div className="relative max-w-2xl w-full mx-4 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
            {/* Header del modal */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedTechnology.icon}</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedTechnology.name}
                </h3>
              </div>
              <button
                onClick={closeTechnologyModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="Cerrar"
              >
                <span className="text-xl text-gray-500 dark:text-gray-400">
                  ✕
                </span>
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Technologies and Tools
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTechnology.description
                    .split(", ")
                    .map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-[#0272AD]/10 to-[#0272AD]/5 border border-[#0272AD]/20 rounded-full text-sm font-medium text-[#0272AD] dark:text-[#0272AD]"
                      >
                        {tech}
                      </span>
                    ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Capabilities and Experience
                </h4>
                <ul className="space-y-2">
                  {selectedTechnology.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  💡 Interested in working with these technologies?
                </p>
                <Link
                  to="/contact"
                  onClick={closeTechnologyModal}
                  className="px-4 py-2 bg-[#0272AD] text-white rounded-lg hover:bg-[#0272AD]/90 transition-colors text-sm font-medium"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Navigation Buttons - Centrado verticalmente a la derecha */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40">
        <KeyboardNavigation
          onUp={() => {
            const sections = ["hero", "services", "technologies", "contact"];
            const currentSection = sections.find((sectionId) => {
              const element = document.getElementById(sectionId);
              if (element) {
                const rect = element.getBoundingClientRect();
                return rect.top <= 100 && rect.bottom > 100;
              }
              return false;
            });

            if (currentSection) {
              const currentIndex = sections.indexOf(currentSection);
              const prevIndex = Math.max(currentIndex - 1, 0);
              const prevSection = document.getElementById(sections[prevIndex]);
              if (prevSection) {
                prevSection.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }
            }
          }}
          onDown={scrollToNextSection}
          onTop={scrollToTop}
          showTop={showBackToTop}
        />
      </div>
    </>
  );
};

export default ModernHome;
