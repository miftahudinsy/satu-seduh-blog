import { FeaturedPost } from "./component/FeaturedPost";
import HeroSection from "./component/HeroSection";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturedPost />
      <div>Featured Post</div>
      <div>Kategori</div>
      <div>Baca Artikel Lainnya</div>
    </div>
  );
}
