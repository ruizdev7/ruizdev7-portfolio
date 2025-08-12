// Importar imágenes
import { useState, useEffect } from "react";
import pumpCrudImage from "../../assets/img/pump-crud.png";
import profileImage from "../../assets/img/Profile_Picture_Portfolio.png";

const Projects = () => {
  const [imageLoading, setImageLoading] = useState({});

  // Datos de ejemplo de proyectos
  const projects = [
    {
      id: 1,
      title: "Management system for the pump database",
      description:
        "Full-stack e-commerce platform with modern UI/UX, payment integration, and admin dashboard.",
      image: pumpCrudImage, // Usando imagen importada
      technologies: ["React", "Node.js", "MongoDB", "Stripe"],
      liveUrl: "/projects/pump-crud",
      githubUrl: "",
    },
  ];

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
            My Projects
          </h1>
          <p className="text-lg text-do_text_gray_light dark:text-do_text_gray_dark max-w-2xl mx-auto">
            A collection of projects that I have worked on.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-do_card_light dark:bg-do_card_dark rounded-lg overflow-hidden border border-do_border_light dark:border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
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
              <div className="p-6">
                <h3 className="text-xl font-bold text-do_text_light dark:text-do_text_dark mb-3">
                  {project.title}
                </h3>
                <p className="text-do_text_gray_light dark:text-do_text_gray_dark mb-4 text-sm leading-relaxed">
                  {project.description}
                </p>

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
                <div className="flex gap-3">
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-do_blue hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Live Demo
                  </a>
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 border border-do_blue text-do_blue hover:bg-do_blue hover:text-white text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    GitHub
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
