import NavBar from "./components/NavBar";
import LandingPage from "./components/LandingPage";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <LandingPage />
    </div>
  );
}