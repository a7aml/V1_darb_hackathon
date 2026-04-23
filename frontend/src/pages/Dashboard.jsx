import { Outlet } from "react-router-dom";
import DashboardNav   from "../components/dashboard/DashboardNav";
import ChatbotBubble  from "../components/dashboard/ChatbotBubble";
import Footer         from "../components/landing/Footer";

// Dashboard is a layout shell — child routes render via <Outlet />
// Routes:
//   /dashboard      → UploadPage
//   /my-progress    → (future)
//   /ai-tutor       → (future)

const Dashboard = () => (
  <div className="min-h-screen bg-cream-100 flex flex-col">
    <DashboardNav />

    {/* page content */}
    <main className="flex-1">
      <Outlet />
    </main>

    {/* same footer as landing page */}
    <Footer />

    {/* floating chatbot */}
    <ChatbotBubble />
  </div>
);

export default Dashboard;