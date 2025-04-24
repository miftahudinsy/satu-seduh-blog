const HeroSection = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[20rem] bg-gradient-to-b from-blue-100 to-white text-center pt-20">
      <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-4">
        Satu<span className="text-blue-600">Seduh</span>
      </h1>
      <p className="text-lg md:text-xl text-gray-600 max-w-2xl">
        Ringkasan ide-ide besar dari podcast, diseduh menjadi bacaan singkat
        yang bisa langsung kamu seruput & praktekin.
      </p>
    </div>
  );
};

export default HeroSection;
