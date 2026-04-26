
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useTutor       from "../hooks/useTutor";
import TutorSidebar   from "../components/tutor/TutorSidebar";
import TutorChat      from "../components/tutor/TutorChat";

// Fully standalone — no LectureContext dependency
const AITutorPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const {
    sessions, activeSession,
    loading, toolLoading, uploading, attachedFile,
    newSession, openSession, deleteSession,
    attachFile, clearAttachment,
    uploadLectureFromChat, send, callTool,
  } = useTutor();

  // start a blank session on first load
  useEffect(() => {
    if (!activeSession) newSession();
  }, []);

  return (
    <div
      className="flex bg-cream-50 overflow-hidden"
      style={{ height: "calc(100vh - 64px)" }}
    >
      {/* sidebar */}
      <TutorSidebar
        sessions={sessions}
        activeSession={activeSession}
        onNew={newSession}
        onOpen={openSession}
        onDelete={deleteSession}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(v => !v)}
      />

      {/* chat area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

        {/* active lecture banner */}
        {activeSession?.lectureTitle && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1,  y:  0 }}
            className="flex items-center gap-2 px-5 py-2 border-b border-forest-100/60 bg-forest-50 shrink-0"
          >
            <div className="w-2 h-2 rounded-full bg-forest-500 animate-pulse-slow" />
            <span className="text-xs font-medium text-forest-700">
              Lecture: <strong>{activeSession.lectureTitle}</strong>
            </span>
            <span className="text-2xs text-forest-500 ms-1">
              — AI tools are using this lecture
            </span>
          </motion.div>
        )}

        <div className="flex-1 min-h-0 overflow-hidden">
          <TutorChat
            session={activeSession}
            loading={loading}
            toolLoading={toolLoading}
            uploading={uploading}
            attachedFile={attachedFile}
            onSend={send}
            onCallTool={callTool}
            onAttach={attachFile}
            onClearAttachment={clearAttachment}
            onUploadLecture={uploadLectureFromChat}
          />
        </div>
      </div>
    </div>
  );
};

export default AITutorPage;