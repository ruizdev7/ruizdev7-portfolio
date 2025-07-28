const Projects = () => {
  // Datos de ejemplo de proyectos
  const projects = [
    {
      id: 1,
      title: "Management system for the pump database",
      description:
        "Full-stack e-commerce platform with modern UI/UX, payment integration, and admin dashboard.",
      image:
        "https://via.placeholder.com/400x250/0069ff/ffffff?text=E-commerce+Platform",
      technologies: ["React", "Node.js", "MongoDB", "Stripe"],
      liveUrl: "/projects/pump-crud",
      githubUrl: "",
    },
  ];

  return (
    <div className="min-h-screen bg-do_bg_light dark:bg-do_bg_dark py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-do_text_light dark:text-do_text_dark mb-4">
            My Projects
          </h1>
          <p className="text-lg text-do_text_gray_light dark:text-do_text_gray_dark max-w-2xl mx-auto">
            A collection of projects showcasing my skills in web development,
            API design, and modern technologies.
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
              <div className="relative h-48 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
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
                        className="px-2 py-1 bg-do_blue text-white text-xs rounded-full"
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
