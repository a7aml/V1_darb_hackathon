import { useState } from "react";
import { motion } from "framer-motion";
import { getUser } from "../../utils/storage";

const ease = [0.22, 1, 0.36, 1];

const TutorSidebar = ({ sessions, activeSession, onNew, onOpen, onDelete, collapsed, onToggle }) => {
  const [confirmDelete, setConfirmDelete] = useState(null);
  const user     = getUser();
  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (confirmDelete === id) { onDelete(id); setConfirmDelete(null); }
    else { setConfirmDelete(id); setTimeout(() => setConfirmDelete(null), 3000); }
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 56 : 220 }}
      transition={{ duration: 0.3, ease }}
      className="relative flex flex-col bg-white border-e border-forest-100/60 shrink-0 overflow-hidden h-full"
    >
      {/* collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute top-3.5 end-2.5 z-10 w-7 h-7 rounded-lg flex items-center justify-center text-ink-400 hover:text-forest-700 hover:bg-cream-100 transition-colors"
      >
        <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </motion.div>
      </button>

      <div className="flex flex-col h-full overflow-hidden">

        {/* new chat button */}
        <div className="px-2.5 pt-3 pb-2 shrink-0">
          <motion.button
            onClick={onNew}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-ink-900 transition-all justify-center"
            style={{ backgroundColor: "#F5C842", boxShadow: "0 2px 8px rgba(245,200,66,0.28)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {!collapsed && <span>New Chat</span>}
          </motion.button>
        </div>

        {/* recent chats list */}
        {!collapsed && sessions.length > 0 && (
          <div className="flex-1 overflow-y-auto px-2.5 pb-3 min-h-0">
            <p className="text-2xs font-semibold tracking-[0.14em] uppercase text-ink-300 px-1 mb-1.5 mt-1">
              Recent Chats
            </p>
            <div className="space-y-0.5">
              {sessions.slice(0, 25).map((s) => (
                <motion.div
                  key={s.id}
                  onClick={() => onOpen(s.id)}
                  whileHover={{ x: 2 }}
                  className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150
                    ${activeSession?.id === s.id
                      ? "bg-forest-50 border border-forest-100"
                      : "hover:bg-cream-50"
                    }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-forest-300 shrink-0" />
                  <span className="text-xs text-ink-700 truncate flex-1 leading-snug">{s.title}</span>
                  <button
                    onClick={(e) => handleDelete(e, s.id)}
                    className={`shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all
                      ${confirmDelete === s.id
                        ? "text-red-500 bg-red-50 opacity-100"
                        : "text-ink-300 opacity-0 group-hover:opacity-100 hover:text-red-400"
                      }`}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    </svg>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* collapsed — show numbered dots */}
        {collapsed && sessions.length > 0 && (
          <div className="flex-1 overflow-y-auto px-1.5 py-1 space-y-1">
            {sessions.slice(0, 10).map((s, i) => (
              <button
                key={s.id}
                onClick={() => onOpen(s.id)}
                className={`w-full h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors
                  ${activeSession?.id === s.id ? "bg-forest-50 text-forest-700" : "text-ink-400 hover:bg-cream-100"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* user info at bottom */}
        <div className={`shrink-0 border-t border-forest-100/60 p-2.5 flex items-center gap-2.5 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-7 h-7 rounded-full bg-forest-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink-900 truncate">{user?.full_name}</p>
              <p className="text-2xs text-ink-400 truncate">{user?.email}</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

export default TutorSidebar;