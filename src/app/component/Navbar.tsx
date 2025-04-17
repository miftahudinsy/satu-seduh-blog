const Navbar = () => {
  return (
    <div className="fixed h-20 w-full bg-white/80 backdrop-blur-lg shadow-sm flex items-center z-50">
      <div className="flex w-full items-center justify-between mx-auto px-4 max-w-7xl">
        <div className="font-bold text-xl text-gray-800">
          Satu<span className="text-blue-600">Seduh</span>
        </div>
        <div className="flex gap-6 text-gray-600">
          <div className="hover:text-blue-600 cursor-pointer transition-colors duration-200">
            Blog
          </div>
          <div className="hover:text-blue-600 cursor-pointer transition-colors duration-200">
            Kategori
          </div>
          <div className="hover:text-blue-600 cursor-pointer transition-colors duration-200">
            Tentang Kami
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
