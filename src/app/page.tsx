import { FeaturedPost } from "./component/FeaturedPost";
import HeroSection from "./component/HeroSection";
import { Kategori } from "./component/Kategori";
import { TombolLihatSemuaPost } from "./component/tombolLihatSemuaPost";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturedPost />
      <Kategori />
      <TombolLihatSemuaPost />
    </div>
  );
}
