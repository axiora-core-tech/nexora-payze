import { Link, Outlet, useLocation, useNavigation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Bell, User, Settings, LogOut, CheckCircle2,
  AlertTriangle, FileText, Terminal
} from "lucide-react";
import { toast } from "sonner";
import { notificationsService } from "../../services";

// Animated Payze brand logo — matches the favicon exactly
function PayzeLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="payze-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4AA">
            <animate attributeName="stop-color" values="#00D4AA;#00A3FF;#7F77DD;#00D4AA" dur="4s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="#00A3FF">
            <animate attributeName="stop-color" values="#00A3FF;#7F77DD;#00D4AA;#00A3FF" dur="4s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="114" ry="114" fill="url(#payze-logo-grad)" />
      <rect x="134" y="136" width="62" height="298" rx="31" fill="#ffffff" />
      <path
        d="M165 136 L290 136 C348 136 388 172 388 228 C388 284 348 320 290 320 L165 320"
        stroke="#ffffff" strokeWidth="62" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      <rect x="248" y="380" width="130" height="18" rx="9" fill="#ffffff" opacity="0.55">
        <animate attributeName="opacity" values="0.55;0.15;0.55" dur="1.6s" repeatCount="indefinite" />
      </rect>
      <rect x="248" y="414" width="90" height="18" rx="9" fill="#ffffff" opacity="0.35">
        <animate attributeName="opacity" values="0.35;0.1;0.35" dur="1.6s" begin="0.3s" repeatCount="indefinite" />
      </rect>
      <rect x="248" y="448" width="56" height="18" rx="9" fill="#ffffff" opacity="0.2">
        <animate attributeName="opacity" values="0.2;0.05;0.2" dur="1.6s" begin="0.6s" repeatCount="indefinite" />
      </rect>
    </svg>
  );
}

// Minimalist nav icons
function CustomIcon({ name, size = 20, active }: { name: string; size?: number; active?: boolean }) {
  const strokeW = active ? 2.5 : 2;
  const opacity = active ? 1 : 0.85;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" style={{ opacity }}>
      {name === "Home" && <><path d="M4 10L12 3L20 10V20C20 20.5 19.5 21 19 21H5C4.5 21 4 20.5 4 20V10Z" /><path d="M9 21V12H15V21" /></>}
      {name === "Pay" && <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10H21M8 14H10" /></>}
      {name === "Invoice" && <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 7H15M9 11H15M9 15H11" /></>}
      {name === "Links" && <><path d="M10 13A5 5 0 0 0 17 13L19 11A5 5 0 0 0 12 4L11 5" /><path d="M14 11A5 5 0 0 0 7 11L5 13A5 5 0 0 0 12 20L13 19" /></>}
      {name === "QR" && <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><path d="M14 14H20M14 17H17M17 20H20M14 20H14.01" /></>}
      {name === "Subs" && <><path d="M17 4C19 6 19 9 17 11L14 14" /><path d="M7 20C5 18 5 15 7 13L10 10" /><circle cx="12" cy="12" r="3" /></>}
      {name === "Risk" && <><path d="M12 3L4 7V11C4 16 8 20 12 22C16 20 20 16 20 11V7L12 3Z" /><path d="M12 8V12M12 16H12.01" /></>}
      {name === "Analytics" && <><rect x="4" y="14" width="4" height="6" rx="1" /><rect x="10" y="10" width="4" height="10" rx="1" /><rect x="16" y="4" width="4" height="16" rx="1" /></>}
      {name === "Settlements" && <><path d="M3 21H21" /><path d="M5 21V7L12 3L19 7V21" /><path d="M9 11V21M15 11V21" /></>}
      {name === "Onboarding" && <><circle cx="12" cy="7" r="4" /><path d="M5 21C5 17.5 8 14 12 14C16 14 19 17.5 19 21" /></>}
      {name === "Admin" && <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14H21V21H14V14Z" fill="currentColor" /></>}
      {name === "Dev" && <><path d="M8 6L2 12L8 18M16 6L22 12L16 18M14 4L10 20" /></>}
    </svg>
  );
}

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Array<{ id: number; icon: any; title: string; desc: string; time: string; unread: boolean }>>([]);

  // Load notifications from service on mount
  useEffect(() => {
    const iconMap: Record<string, any> = { CheckCircle2, AlertTriangle };
    notificationsService.getAll().then(result => {
      setNotifications(result.notifications.map((n: any) => ({
        ...n,
        icon: iconMap[n.icon] || CheckCircle2,
      })));
    }).catch(() => {
      // Silently fail — notifications are non-critical
    });
  }, []);

  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 600);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const isLoading = navigation.state === "loading" || isNavigating;
  const unreadCount = notifications.filter(n => n.unread).length;

  // Search handler
  const handleSearchSubmit = (query: string) => {
    if (!query.trim()) return;
    toast.success(`Searching for "${query}"`);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleSearchSuggestionClick = (suggestion: string, path: string) => {
    toast.info(`Opening ${suggestion}`);
    setIsSearchOpen(false);
    setSearchQuery("");
    navigate(path);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    toast.success("All notifications marked as read");
  };

  const handleNotifClick = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    toast.info("Notification opened");
    setIsNotifOpen(false);
  };

  const handleProfileAction = (action: string) => {
    setIsProfileOpen(false);
    if (action === "logout") {
      toast.success("Logged out successfully");
    } else {
      toast.info(`${action} — coming soon`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-stone-900 font-sans selection:bg-stone-200 overflow-x-hidden relative flex flex-col items-center">

      {/* Subtle organic background mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-stone-200/40 rounded-full blur-[120px] mix-blend-multiply opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-stone-300/30 rounded-full blur-[120px] mix-blend-multiply opacity-60" />
      </div>

      {/* Invisible overlay to close dropdowns */}
      {(isNotifOpen || isProfileOpen || isSearchOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setIsNotifOpen(false); setIsProfileOpen(false); setIsSearchOpen(false); }} />
      )}

      {/* Top Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between z-50 relative">
        {/* Clickable Payze logo — goes home */}
        <Link to="/" className="flex items-center gap-3 group relative" aria-label="Payze home">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            whileHover={{ scale: 1.05, rotate: -3 }}
          >
            <PayzeLogo size={36} />
          </motion.div>
          <div className="flex flex-col">
            <span
              className="font-bold tracking-tight text-2xl leading-none"
              style={{
                background: "linear-gradient(135deg, #00D4AA 0%, #00A3FF 50%, #7F77DD 100%)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "payzeGradient 4s ease infinite"
              }}
            >
              Payze
            </span>
            <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-stone-400 mt-0.5">
              Pay with Ease
            </span>
          </div>
          <style>{`
            @keyframes payzeGradient {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
          `}</style>
        </Link>

        <div className="flex items-center gap-4 relative">
          {/* Search */}
          <div className="relative z-50 flex items-center justify-end">
            <AnimatePresence initial={false}>
              {isSearchOpen ? (
                <motion.div
                  key="search-dropdown"
                  initial={{ width: 40, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 40, opacity: 0 }}
                  className="absolute right-0 bg-white shadow-xl rounded-2xl border border-stone-200 overflow-hidden flex flex-col"
                >
                  <div className="flex items-center px-3 py-2 border-b border-stone-100">
                    <Search size={18} className="text-stone-400 mr-2 shrink-0" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search transactions, users..."
                      className="w-full bg-transparent border-none outline-none text-sm text-stone-800 placeholder:text-stone-400"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(searchQuery); }}
                    />
                  </div>
                  <div className="bg-stone-50/50 p-2 space-y-1">
                    {searchQuery.length > 0 ? (
                      <>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 px-2 py-1">Results</p>
                        <button onClick={() => handleSearchSubmit(searchQuery)} className="w-full text-left px-3 py-2 bg-white rounded-xl text-sm text-stone-900 flex items-center gap-2 shadow-sm border border-stone-100 hover:bg-stone-50 transition-colors">
                          <Search size={14} className="text-stone-400" /> Search "{searchQuery}"
                        </button>
                        <button onClick={() => handleSearchSuggestionClick(`Customer: ${searchQuery}`, "/admin")} className="w-full text-left px-3 py-2 hover:bg-white rounded-xl text-sm text-stone-700 flex items-center gap-2 transition-colors">
                          <User size={14} /> Customer: {searchQuery}
                        </button>
                        <button onClick={() => handleSearchSuggestionClick(`Invoice #${Math.floor(Math.random() * 10000)}`, "/invoice")} className="w-full text-left px-3 py-2 hover:bg-white rounded-xl text-sm text-stone-700 flex items-center gap-2 transition-colors">
                          <FileText size={14} /> Invoice matching "{searchQuery}"
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 px-2 py-1">Suggestions</p>
                        <button onClick={() => handleSearchSuggestionClick("Invoice INV-2024", "/invoice")} className="w-full text-left px-3 py-2 hover:bg-white rounded-xl text-sm text-stone-700 flex items-center gap-2 transition-colors">
                          <FileText size={14} /> Invoice INV-2024
                        </button>
                        <button onClick={() => handleSearchSuggestionClick("John Doe", "/admin")} className="w-full text-left px-3 py-2 hover:bg-white rounded-xl text-sm text-stone-700 flex items-center gap-2 transition-colors">
                          <User size={14} /> John Doe
                        </button>
                        <button onClick={() => handleSearchSuggestionClick("API Documentation", "/developer")} className="w-full text-left px-3 py-2 hover:bg-white rounded-xl text-sm text-stone-700 flex items-center gap-2 transition-colors">
                          <Terminal size={14} /> API Documentation
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  key="search-btn"
                  exit={{ opacity: 0 }}
                  onClick={() => { setIsSearchOpen(true); setIsNotifOpen(false); setIsProfileOpen(false); }}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white border border-transparent hover:border-stone-200/50 transition-all text-stone-600 shadow-sm hover:shadow-md"
                  aria-label="Search"
                >
                  <Search size={18} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 relative z-50">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); setIsSearchOpen(false); }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${isNotifOpen ? 'bg-stone-900 border-stone-900 text-white shadow-sm' : 'hover:bg-white border-transparent hover:border-stone-200/50 text-stone-600 hover:shadow-md'} relative`}
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] px-1 bg-gradient-to-br from-[#00D4AA] to-[#00A3FF] rounded-full border-2 border-[#FAFAF8] text-[9px] font-bold text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute right-0 top-14 w-[360px] bg-white/95 backdrop-blur-3xl border border-stone-200/80 rounded-3xl shadow-[0_24px_48px_rgba(0,0,0,0.08)] overflow-hidden"
                  >
                    <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                      <h4 className="font-semibold text-stone-800 text-sm">Notifications</h4>
                      <button onClick={markAllRead} className="text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-md">Mark all read</button>
                    </div>
                    <div className="max-h-[340px] overflow-y-auto">
                      {notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => handleNotifClick(n.id)}
                          className="w-full p-4 border-b border-stone-100 hover:bg-stone-50 cursor-pointer transition-colors flex gap-4 group text-left"
                        >
                          <div className={`w-10 h-10 rounded-full ${n.unread ? 'bg-gradient-to-br from-[#00D4AA]/15 to-[#00A3FF]/15 text-[#00A3FF]' : 'bg-stone-100 text-stone-500'} flex items-center justify-center shrink-0 shadow-sm border border-white`}>
                            <n.icon size={18} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h5 className={`text-sm font-medium ${n.unread ? 'text-stone-900' : 'text-stone-600'}`}>{n.title}</h5>
                              <span className="text-[10px] font-medium text-stone-400 whitespace-nowrap pt-0.5">{n.time}</span>
                            </div>
                            <p className="text-xs text-stone-500 leading-relaxed">{n.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); setIsSearchOpen(false); }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-2 ml-2 ${isProfileOpen ? 'border-stone-900 bg-stone-900 text-white shadow-md' : 'border-transparent bg-gradient-to-br from-[#00D4AA] to-[#00A3FF] text-white hover:shadow-md'}`}
                aria-label="Profile"
              >
                <span className="text-sm font-bold">SC</span>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute right-0 top-14 w-64 bg-white/95 backdrop-blur-3xl border border-stone-200/80 rounded-3xl shadow-[0_24px_48px_rgba(0,0,0,0.08)] overflow-hidden"
                  >
                    <div className="p-5 border-b border-stone-100 bg-stone-50/50 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00D4AA] to-[#00A3FF] text-white flex items-center justify-center shadow-inner font-bold">
                        SC
                      </div>
                      <div>
                        <h4 className="font-semibold text-stone-800 text-sm">Sarah Connor</h4>
                        <p className="text-xs text-stone-500 font-medium">sarah@payze.com</p>
                      </div>
                    </div>
                    <div className="p-2 space-y-1">
                      <button onClick={() => handleProfileAction("My Profile")} className="w-full text-left px-4 py-2.5 rounded-2xl text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors flex items-center gap-3">
                        <User size={16} /> My Profile
                      </button>
                      <button onClick={() => handleProfileAction("Preferences")} className="w-full text-left px-4 py-2.5 rounded-2xl text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors flex items-center gap-3">
                        <Settings size={16} /> Preferences
                      </button>
                    </div>
                    <div className="p-2 border-t border-stone-100 bg-stone-50/50">
                      <button onClick={() => handleProfileAction("logout")} className="w-full text-left px-4 py-2.5 rounded-2xl text-sm font-medium text-stone-900 hover:bg-stone-200 transition-colors flex items-center gap-3">
                        <LogOut size={16} /> Log out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* App Loader */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)", transition: { duration: 0.4 } }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAFAF8]/95 backdrop-blur-2xl pointer-events-none"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="w-20 h-20 mb-6"
            >
              <PayzeLogo size={80} />
            </motion.div>
            <p className="text-stone-600 font-semibold tracking-widest text-xs uppercase">Loading Payze Workspace</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="w-full max-w-[1400px] flex-1 pb-32 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-screen pt-4 px-6 sm:px-12"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Dock Navigation — Home centered */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 px-4 w-full max-w-[95vw] overflow-x-auto hide-scrollbar flex justify-center pb-4 -mb-4">
        <nav className="flex items-center gap-1.5 p-2 bg-white/80 backdrop-blur-2xl rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,1)] border border-stone-200/50 w-max pointer-events-auto transition-transform hover:scale-[1.02] duration-300">
          {/* LEFT side — management/admin */}
          <NavItem to="/onboarding" icon="Onboarding" label="Onboarding" active={location.pathname === "/onboarding"} />
          <NavItem to="/admin" icon="Admin" label="Admin" active={location.pathname === "/admin"} />
          <NavItem to="/developer" icon="Dev" label="Developer" active={location.pathname === "/developer"} />
          <NavItem to="/risk" icon="Risk" label="Risk" active={location.pathname === "/risk"} />
          <NavItem to="/settlements" icon="Settlements" label="Settlements" active={location.pathname === "/settlements"} />

          {/* CENTER — Home */}
          <NavItem to="/" icon="Home" label="Home" active={location.pathname === "/"} featured />

          {/* RIGHT side — operational/daily use */}
          <NavItem to="/pay" icon="Pay" label="Pay" active={location.pathname.startsWith("/pay") && location.pathname !== "/payment-links"} />
          <NavItem to="/invoice" icon="Invoice" label="Invoice" active={location.pathname === "/invoice"} />
          <NavItem to="/payment-links" icon="Links" label="Links" active={location.pathname === "/payment-links"} />
          <NavItem to="/qr" icon="QR" label="QR" active={location.pathname === "/qr"} />
          <NavItem to="/subscriptions" icon="Subs" label="Subs" active={location.pathname === "/subscriptions"} />
          <NavItem to="/analytics" icon="Analytics" label="Analytics" active={location.pathname === "/analytics"} />
        </nav>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function NavItem({ to, icon, label, active, featured }: { to: string; icon: string; label: string; active: boolean; featured?: boolean }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to={to}
      className="relative group flex items-center justify-center h-12 rounded-full transition-colors overflow-hidden px-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={label}
    >
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className={`absolute inset-0 rounded-full shadow-md ${featured ? 'bg-gradient-to-br from-[#00D4AA] to-[#00A3FF]' : 'bg-stone-900'}`}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      {!active && featured && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#00D4AA]/10 to-[#00A3FF]/10" />
      )}
      <AnimatePresence>
        {!active && isHovered && (
          <motion.div
            className="absolute inset-0 bg-stone-100 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </AnimatePresence>
      <div className={`relative z-10 flex items-center justify-center transition-colors duration-300 ${active ? "text-white" : featured ? "text-[#00A3FF]" : "text-stone-500 group-hover:text-stone-900"}`}>
        <motion.div
          animate={{
            scale: active ? 1 : isHovered ? 1.1 : 1,
            rotate: isHovered && !active ? [0, -10, 10, 0] : 0
          }}
          transition={{ duration: 0.3 }}
        >
          <CustomIcon name={icon} active={active} />
        </motion.div>
        <AnimatePresence>
          {(active || isHovered) && (
            <motion.span
              key="label"
              className="ml-2 font-medium text-sm whitespace-nowrap overflow-hidden"
              initial={{ width: 0, opacity: 0, x: -5 }}
              animate={{ width: "auto", opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </Link>
  );
}
