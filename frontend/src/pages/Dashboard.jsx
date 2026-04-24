import { Outlet } from "react-router-dom";
import DashboardNav  from "../components/dashboard/DashboardNav";
import ChatbotBubble from "../components/dashboard/ChatbotBubble";

// Footer is intentionally excluded — it only appears on the landing page.
// The Dashboard shell provides the sticky nav and floating chatbot for all
// protected routes (/dashboard, /my-progress, /ai-tutor, /study/:id etc.)

const Dashboard = () => (
  <div className="min-h-screen bg-cream-100 flex flex-col">
    <DashboardNav />
    <main className="flex-1 pt-16">
      <Outlet />
    </main>
    <ChatbotBubble />
  </div>
);

export default Dashboard;