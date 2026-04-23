import Navbar, { LangTransition } from "../components/landing/Navbar";
import Hero         from "../components/landing/Hero";
import Features     from "../components/landing/Features";
import About        from "../components/landing/About";
import Testimonials from "../components/landing/Testimonials";
import CTABanner    from "../components/landing/CTABanner";
import Footer       from "../components/landing/Footer";

const LandingPage = () => (
  <div className="min-h-screen bg-cream-100 antialiased">
    {/* Navbar stays mounted always — only its text animates on lang change */}
    <Navbar />

    {/* Everything below fades out/in smoothly when language is toggled */}
    <LangTransition>
      <Hero />
      <Features />
      <About />
      <Testimonials />
      <CTABanner />
      <Footer />
    </LangTransition>
  </div>
);

export default LandingPage;