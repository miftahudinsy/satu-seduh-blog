import React from "react";
import { FaGithub } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear(); // Get current year dynamically

  return (
    <footer className="bg-gray-100 text-gray-600 py-6 mt-12">
      {" "}
      {/* Added margin-top */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
        <p className="text-sm mb-2 sm:mb-0">&copy; {currentYear} Satu Seduh</p>
        <a
          href="https://github.com/miftahudinsy/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub Profile"
          className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <FaGithub size={24} /> {/* Use FaGithub icon with size prop */}
        </a>
      </div>
    </footer>
  );
};

export default Footer;
