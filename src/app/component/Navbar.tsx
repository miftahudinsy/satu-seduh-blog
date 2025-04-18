import Link from "next/link";

const Navbar = () => {
  return (
    <div className="fixed h-20 w-full bg-white/80 backdrop-blur-lg shadow-sm flex items-center z-50">
      <div className="flex w-full items-center justify-between mx-auto px-4 max-w-7xl">
        <Link
          href="/"
          className="font-bold text-xl text-gray-800 hover:text-blue-600 transition-colors duration-200"
        >
          Satu<span className="text-blue-600">Seduh</span>
        </Link>
        <nav className="flex gap-6 text-gray-600">
          <Link
            href="/blog"
            className="hover:text-blue-600 cursor-pointer transition-colors duration-200"
          >
            Blog
          </Link>
          <Link
            href="/kategori"
            className="hover:text-blue-600 cursor-pointer transition-colors duration-200"
          >
            Kategori
          </Link>
          <Link
            href="/tentang-kami"
            className="hover:text-blue-600 cursor-pointer transition-colors duration-200"
          >
            Tentang Kami
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
