import React from "react";

const Projects = () => {
  return (
    <>
      <div className="container mx-auto">
        <div className="flex flex-col h-[90vh] items-center justify-center bg-white dark:bg-[#17181C]">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            404
          </h1>
          <p className="mt-4 text-lg text-gray-500 dark:text-[b3c7ff]">
            Page not found
          </p>
          <a
            href="/"
            className="mt-6 text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Go back home
          </a>
        </div>
      </div>
    </>
  );
};

export default Projects;
