import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  RocketLaunchIcon,
  UserGroupIcon,
  SparklesIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";

const Navbar = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    setIsVisible(true);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-do_bg_light dark:bg-do_bg_dark">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0272AD]/10 via-transparent to-[#0272AD]/5"></div>

        {/* Animated Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#0272AD]/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Mouse Follower Effect */}
        <div
          className="absolute w-96 h-96 rounded-full opacity-20 pointer-events-none transition-all duration-1000 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            background:
              "radial-gradient(circle, rgba(2,114,173,0.1) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Logo/Brand Section */}
        <div
          className={`transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="mb-8">
            <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-r from-[#0272AD]/10 to-[#0272AD]/5 backdrop-blur-sm border border-[#0272AD]/20 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0272AD] to-[#0272AD] rounded-xl blur-lg opacity-30"></div>
                <div className="relative bg-gradient-to-r from-[#0272AD] to-[#0272AD] bg-clip-text text-transparent text-6xl md:text-8xl font-black tracking-tight">
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
          className={`max-w-4xl mx-auto mb-12 transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
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

          <p className="text-xl md:text-2xl text-do_text_gray_light dark:text-do_text_gray_dark mb-8 leading-relaxed max-w-3xl mx-auto">
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
          className={`flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
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
          className={`transition-all duration-1000 delay-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="flex flex-col items-center text-do_text_gray_light dark:text-do_text_gray_dark">
            <span className="text-sm mb-2">Scroll to explore</span>
            <ArrowDownIcon className="w-6 h-6 animate-bounce text-[#0272AD]" />
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-10 w-32 h-32 bg-gradient-to-r from-[#0272AD]/10 to-transparent rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-10 w-48 h-48 bg-gradient-to-l from-[#0272AD]/10 to-transparent rounded-full blur-xl animate-pulse delay-1000"></div>
    </div>
  );
};

export default Navbar;
