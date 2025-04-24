import Link from "next/link";
import React from "react";

export const TombolLihatSemuaPost = () => {
  return (
    <div className="text-center my-10">
      <Link
        href="/blog"
        className="
          bg-blue-600 
          text-white 
          font-semibold 
          text-lg 
          py-3 px-8 
          rounded-4xl 
          shadow-md 
          hover:bg-blue-700 
          transition-colors duration-300 
        "
      >
        Baca Postingan Lainnya
      </Link>
    </div>
  );
};
