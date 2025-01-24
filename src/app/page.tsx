import HeroSection from "@/components/HeroSection/HeroSection";
import FoodCategories from "@/components/FoodCategories/FoodCategories";
import CartSidebar from "@/components/CartSidebar/CartSidebar";
import FoodSection from "@/components/FoodSection/FoodSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <div className="container food-container">
        <FoodCategories />
        <CartSidebar />
        <FoodSection />
      </div>
    </>
  );
}
