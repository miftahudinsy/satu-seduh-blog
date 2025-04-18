import { FaInstagram } from "react-icons/fa";
import Link from "next/link";

const TentangKami = () => {
  return (
    <div className="bg-gradient-to-b from-blue-100 to-white">
      <div className="max-w-3xl mx-auto px-4 py-8 pt-28 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Tentang Kami
        </h1>
        <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
          <p>
            Satu Seduh adalah blog yang menyajikan ringkasan ide-ide besar dari
            podcast dalam bentuk bacaan singkat, langsung to the point, yang
            bisa langsung kamu seruput dan praktekkan. Buat kamu si paling
            efisiensi, kamu nggak perlu dengerin podcast panjang-panjang, cukup
            baca ringkasannya kapan saja. Walaupun begitu, kami tetap
            menyarankan kamu untuk menikmati podcast aslinya untuk pengalaman
            yang lebih lengkap!
          </p>
          <p>
            Misi kami adalah ikut serta dalam mencerdaskan kehidupan bangsa dan
            melaksanakan ketertiban dunia, dengan cara mengajak pembaca untuk
            selalu berpikir kritis.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Author</h2>
          <div className="flex items-center space-x-3 justify-center">
            <p className="text-gray-700">Syarif</p>
            <Link
              href="https://www.instagram.com/miftahudinsy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-pink-600 transition-colors duration-200"
              aria-label="Instagram Syarif"
            >
              <FaInstagram size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TentangKami;
