import Link from "next/link";
import React from "react";

export const TombolLihatSemuaPost = () => {
  return (
    <div className="text-center my-10">
      {" "}
      {/* Wrapper for centering and margin */}
      <Link
        href="/blog"
        className="
          inline-block 
          bg-blue-600 
          text-white 
          font-semibold 
          text-lg 
          py-3 px-8 
          rounded-4xl 
          shadow-md 
          hover:bg-blue-700 
          transition-colors duration-300 
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        "
      >
        Baca Postingan Lainnya
      </Link>
    </div>
  );
};

// Note: Remember to import and use <TombolLihatSemuaPost /> in your desired page component.
