// Importar imágenes
import { useState, useEffect } from "react";
import pumpCrudImage from "../../assets/img/pump-crud.png";
import rbacSystemImage from "../../assets/img/rbac-system-dashboard.png";
import portfolioAssistantImage from "../../assets/img/portfolio-ai-assistant.png";
// import aiFinancialCalculatorImage from "../../assets/img/article1.png";
import aiGovernanceImage from "../../assets/img/chip_AI_Medium.png";
import profileImage from "../../assets/img/Profile_Picture_Portfolio.png";

// Datos de proyectos (constante fuera del componente para evitar re-renders)
const projects = [
  {
    id: 1,
    title: "Advanced Pump Management & Analytics System",
    description:
      "Industrial asset platform combining operational dashboards with a RAG pipeline and local AI models to analyze live pump data, maintenance records and performance metrics.",
    image: pumpCrudImage, // Usando imagen importada
    technologies: [
      "React",
      "Redux Toolkit",
      "RTK Query",
      "ECharts",
      "AG Grid",
      "Docker",
      "Flask",
      "MySQL",
      "RAG",
      "Ollama",
      "Local LLM",
    ],
    liveUrl: "/projects/pump-crud",
    articleUrl:
      "https://docs.ruizdev7.com/blog/industrial-iot-pump-management-dashboard/",
    githubUrl: "https://github.com/Ruizdev7/ruizdev7-portfolio",
    highlights: [
      "Context-grounded analysis over live Redux and MySQL pump data",
      "Private local inference with Ollama and streaming responses",
      "Interactive KPIs, maintenance insights and role-secured workflows",
    ],
  },
  {
    id: 2,
    title: "Role-Based Access Control (RBAC) System",
    description:
      "End-to-end roles and permissions system implemented in this portfolio, securing Flask APIs and React interfaces with reusable, granular authorization rules.",
    image: rbacSystemImage,
    technologies: [
      "React",
      "Redux Toolkit",
      "RTK Query",
      "Flask",
      "SQLAlchemy",
      "MySQL",
      "JWT",
      "Docker",
      "AWS",
    ],
    liveUrl:
      "/admin/roles",
    articleUrl:
      "https://docs.ruizdev7.com/blog/rbac-in-action-securing-web-applications/",
    githubUrl: "https://github.com/Ruizdev7/ruizdev7-portfolio",
    highlights: [
      "Many-to-many users, roles and permissions model",
      "Protected API endpoints and permission-aware React components",
      "Production case study published on the AWS-hosted blog",
    ],
  },
  // {
  //   id: 2,
  //   title: "AI-Powered Financial Calculator",
  //   description:
  //     "An intelligent financial calculator that leverages artificial intelligence to provide personalized insights, predict savings growth, optimize investments, and offer tailored recommendations based on your financial data and goals.",
  //   image: aiFinancialCalculatorImage, // Puedes reemplazar por la imagen de la calculadora si tienes una específica
  //   technologies: [
  //     "React",
  //     "TensorFlow.js",
  //     "OpenAI API",
  //     "Material-UI",
  //     "Node.js",
  //     "Express",
  //   ],
  //   liveUrl: "/projects/ai-financial-calculator",
  //   githubUrl: "",
  // },
  {
    id: 3,
    title: "Harness ** AI Governance Platform",
    description:
      "Technical prototype for governing AI workflows through policy management, human approval checkpoints, auditability and role-based access control.",
    image: aiGovernanceImage,
    technologies: [
      "React",
      "Redux Toolkit",
      "RTK Query",
      "Flask",
      "MySQL",
      "Docker",
      "OpenAI API",
      "MPC (Shamir Secret Sharing)",
      "Blockchain (PoW)",
      "JWT Authentication",
      "RBAC",
    ],
    liveUrl: "/ai-governance",
    articleUrl:
      "https://docs.ruizdev7.com/blog/ai-governance-platform-architecture/",
    githubUrl: "https://github.com/Ruizdev7/ruizdev7-portfolio",
    highlights: [
      "Human-in-the-loop approval workflows",
      "Policy, agent and task management APIs",
      "Audit trail and permission-oriented design",
    ],
  },
  {
    id: 4,
    title: "Local AI Portfolio Assistant",
    description:
      "Context-aware assistant embedded in the portfolio hero, designed to help recruiters and potential clients explore my experience, projects and engineering approach.",
    image: portfolioAssistantImage,
    technologies: [
      "React",
      "Flask",
      "Ollama",
      "Qwen 2.5",
      "Local LLM",
      "Context Grounding",
      "Server-Sent Events",
      "Docker",
    ],
    liveUrl: "/",
    articleUrl:
      "https://docs.ruizdev7.com/blog/from-side-projects-to-enterprise-solutions/",
    githubUrl: "https://github.com/Ruizdev7/ruizdev7-portfolio",
    highlights: [
      "Dedicated recruiter and potential-client conversation modes",
      "Answers grounded in curated CV and portfolio context",
      "Private local inference, token streaming and five languages",
    ],
  },
];

const Projects = () => {
  const [imageLoading, setImageLoading] = useState({});
  // Función para manejar errores de carga de imagen
  const handleImageError = (e, projectId) => {
    e.target.src = profileImage; // Imagen de fallback importada
    e.target.alt = "Imagen no disponible";
    setImageLoading((prev) => ({ ...prev, [projectId]: false }));
  };

  // Función para manejar carga exitosa de imagen
  const handleImageLoad = (projectId) => {
    setImageLoading((prev) => ({ ...prev, [projectId]: false }));
  };

  // Inicializar estado de carga para cada proyecto
  useEffect(() => {
    const initialLoadingState = {};
    projects.forEach((project) => {
      initialLoadingState[project.id] = true;
    });
    setImageLoading(initialLoadingState);
  }, []);

  return (
    <div className="min-h-screen bg-do_bg_light dark:bg-do_bg_dark py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-do_text_light dark:text-do_text_dark mb-4">
            Selected Engineering Work
          </h1>
          <p className="text-lg text-do_text_gray_light dark:text-do_text_gray_dark max-w-2xl mx-auto">
            Working software you can inspect: deployed interfaces, source code,
            API contracts and the engineering decisions behind them.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <a
              href="https://ruizdev7.com/api/v1/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-do_blue hover:bg-blue-700 text-white py-2 px-5 rounded-lg text-sm font-medium transition-colors"
            >
              OpenAPI / Swagger
            </a>
            <a
              href="/CV_Jose_Ruiz.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-do_blue text-do_blue hover:bg-do_blue hover:text-white py-2 px-5 rounded-lg text-sm font-medium transition-colors"
            >
              Download CV
            </a>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex flex-col bg-do_card_light dark:bg-do_card_dark rounded-lg overflow-hidden border border-do_border_light dark:border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              {/* Project Image */}
              <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-scale-down transition-transform duration-300 hover:scale-150"
                  onLoad={() => {
                    console.log("✅ Image loaded successfully:", project.title);
                    handleImageLoad(project.id);
                  }}
                  onError={(e) => {
                    console.error("❌ Image failed to load:", project.title, e);
                    handleImageError(e, project.id);
                  }}
                />
                {/* Loading indicator */}
                {imageLoading[project.id] !== false && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Project Content */}
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-bold text-do_text_light dark:text-do_text_dark mb-3">
                  {project.title}
                </h3>
                <p className="text-do_text_gray_light dark:text-do_text_gray_dark mb-4 text-sm leading-relaxed">
                  {project.description}
                </p>

                <ul className="mb-5 space-y-2 text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
                  {project.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-2">
                      <span className="text-emerald-500" aria-hidden="true">✓</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>

                {/* Technologies */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-do_text_light dark:text-do_text_dark mb-2">
                    Technologies:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Project Links */}
                <div className="mt-auto grid grid-cols-2 gap-3">
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-do_blue hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    View Project
                  </a>
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-do_blue text-do_blue hover:bg-do_blue hover:text-white text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    GitHub
                  </a>
                  <a
                    href={project.articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="col-span-2 border border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Read Engineering Case Study →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
