import { FeaturedPost } from "./component/FeaturedPost";
import HeroSection from "./component/HeroSection";

import { TombolLihatSemuaPost } from "./component/tombolLihatSemuaPost";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturedPost />

      <TombolLihatSemuaPost />
    </div>
  );
}
