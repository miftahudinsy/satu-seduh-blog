const Navbar = () => {
  return (
    <div className="fixed h-24 w-full bg-blue-50 flex items-center backdrop-blur-lg">
      <div className="flex w-full items-center justify-between mx-auto px-4 max-w-7xl">
        <div>Logo</div>
        <div className="flex gap-4">
          <div>Blog</div>
          <div>Kategori</div>
          <div>Tentang Kami</div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
