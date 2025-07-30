import React from "react";

const RequirementsContent = () => (
  <div className="space-y-8">
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold text-do_text_light dark:text-do_text_dark mb-4">
        Especificación del Requerimiento de Software
      </h2>
      <p className="text-lg text-do_text_gray_light dark:text-do_text_gray_dark">
        Sistema de gestión de bombas industriales
      </p>
    </div>

    <div className="grid gap-6 md:grid-cols-2">
      {/* Functional Requirements */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold text-do_text_light dark:text-do_text_dark mb-4 flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          Functional Requirements
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
              <strong>Complete CRUD:</strong> Create, read, update and delete
              pump records
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
              <strong>Filtering and Search:</strong> Advanced filtering system
              for multiple fields
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
              <strong>Pagination:</strong> Efficient navigation for large
              datasets
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
              <strong>Data Validation:</strong> Real-time form validation
            </span>
          </li>
        </ul>
      </div>

      {/* Non-Functional Requirements */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold text-do_text_light dark:text-do_text_dark mb-4 flex items-center gap-2">
          <span className="text-2xl">🔧</span>
          Non-Functional Requirements
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">✓</span>
            <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
              <strong>Responsiveness:</strong> Adaptable to mobile and desktop
              devices
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">✓</span>
            <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
              <strong>Usability:</strong> Intuitive and easy-to-navigate
              interface
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">✓</span>
            <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
              <strong>Performance:</strong> Fast loading and smooth operations
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">✓</span>
            <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
              <strong>Accessibility:</strong> Support for light and dark themes
            </span>
          </li>
        </ul>
      </div>
    </div>

    {/* Technical Specifications */}
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-do_text_light dark:text-do_text_dark mb-4 flex items-center gap-2">
        <span className="text-2xl">💻</span>
        Technical Specifications
      </h3>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <h4 className="font-semibold text-do_text_light dark:text-do_text_dark mb-2">
            Frontend
          </h4>
          <ul className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark space-y-1">
            <li>• React 18</li>
            <li>• AG-Grid Community</li>
            <li>• Headless UI</li>
            <li>• React Hook Form</li>
            <li>• Tailwind CSS</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-do_text_light dark:text-do_text_dark mb-2">
            Features
          </h4>
          <ul className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark space-y-1">
            <li>• Local state management</li>
            <li>• Form validation</li>
            <li>• Responsive modals</li>
            <li>• Dynamic filters</li>
            <li>• Adaptive themes</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-do_text_light dark:text-do_text_dark mb-2">
            Datos
          </h4>
          <ul className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark space-y-1">
            <li>• Datos mock realistas</li>
            <li>• Estados de bomba</li>
            <li>• Métricas técnicas</li>
            <li>• Fechas de mantenimiento</li>
            <li>• Información de ubicación</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

export default RequirementsContent;
