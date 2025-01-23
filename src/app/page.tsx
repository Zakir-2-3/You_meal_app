import HeroSection from "@/components/HeroSection/HeroSection";
import FoodCategories from "@/components/FoodCategories/FoodCategories";
import CartSidebar from "@/components/CartSidebar/CartSidebar";

export default function Home() {
  return (
    <>
      <HeroSection />
      <div className="container">
        <FoodCategories />
        <CartSidebar />
      </div>
    </>
  );
}
