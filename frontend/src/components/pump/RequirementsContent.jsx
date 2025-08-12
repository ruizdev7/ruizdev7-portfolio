const RequirementsContent = () => (
  <div className="space-y-8">
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold text-do_text_light dark:text-do_text_dark mb-4">
        Advanced Pump Management & Analytics System
      </h2>
      <p className="text-lg text-do_text_gray_light dark:text-do_text_gray_dark">
        Comprehensive industrial pump monitoring platform with real-time
        analytics
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
              <strong>Complete CRUD Operations:</strong> Create, read, update
              and delete pump records with real-time synchronization
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
              <strong>Advanced Data Grid:</strong> AG Grid with pagination,
              sorting, filtering and responsive design
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
              <strong>Photo Management:</strong> Upload, view, delete and
              reorder pump photographs
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
              <strong>Interactive Analytics:</strong> ECharts visualizations
              with drag-and-drop reordering
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
              <strong>Real-time KPIs:</strong> Animated metrics with NumberFlow
              for performance tracking
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
              <strong>Auto-synchronization:</strong> Automatic data refresh
              every 30 seconds with manual override
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
              <strong>Responsive Design:</strong> Fully adaptable to mobile,
              tablet and desktop devices
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">✓</span>
            <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
              <strong>Theme Support:</strong> Complete light and dark theme
              implementation with smooth transitions
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">✓</span>
            <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
              <strong>Performance Optimization:</strong> RTK Query caching, lazy
              loading and virtualized rendering
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">✓</span>
            <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
              <strong>Real-time Updates:</strong> Automatic data synchronization
              with manual refresh capabilities
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">✓</span>
            <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
              <strong>Error Handling:</strong> Comprehensive error management
              with user-friendly feedback
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">✓</span>
            <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
              <strong>Authentication:</strong> JWT-based authentication with
              automatic token refresh
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
            Frontend Stack
          </h4>
          <ul className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark space-y-1">
            <li>• React 18 with Hooks</li>
            <li>• Redux Toolkit & RTK Query</li>
            <li>• AG Grid Community</li>
            <li>• ECharts for React</li>
            <li>• Tailwind CSS</li>
            <li>• Headless UI</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-do_text_light dark:text-do_text_dark mb-2">
            Backend & Infrastructure
          </h4>
          <ul className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark space-y-1">
            <li>• Flask REST API</li>
            <li>• MySQL Database</li>
            <li>• JWT Authentication</li>
            <li>• Docker Compose</li>
            <li>• File Upload System</li>
            <li>• CORS Configuration</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-do_text_light dark:text-do_text_dark mb-2">
            Advanced Features
          </h4>
          <ul className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark space-y-1">
            <li>• Real-time data synchronization</li>
            <li>• Drag & drop chart reordering</li>
            <li>• Animated KPI metrics</li>
            <li>• Photo management system</li>
            <li>• Multi-tab synchronization</li>
            <li>• Auto-refresh capabilities</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

export default RequirementsContent;
