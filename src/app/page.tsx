import FoodCategories from "@/components/FoodCategories/FoodCategories";
import HeroSection from "@/components/HeroSection/HeroSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <div className="main-container container">
        <FoodCategories />
      </div>
    </>
  );
}
