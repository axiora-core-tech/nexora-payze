import { Link, Outlet, useLocation, useNavigation } from "react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Home, CreditCard, LayoutDashboard, Code, FileText, ShieldAlert, QrCode, Repeat, Search, Bell, BarChart3, Users, Landmark, User, Settings, LogOut, CheckCircle2, AlertTriangle, Sparkles, Building2, Terminal } from "lucide-react";

// Unique monochromatic logo designs for Payze
function PayzeLogo({ variant }: { variant: number }) {
  if (variant === 1) return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#1C1917"/>
      <path d="M12 10C12 8.89543 12.8954 8 14 8H18.5C21.5376 8 24 10.4624 24 13.5C24 16.5376 21.5376 19 18.5 19H15V23C15 23.5523 14.5523 24 14 24C13.4477 24 13 23.5523 13 23V11V10Z" fill="white"/>
      <path d="M15 16H18.5C20.1569 16 21.5 14.6569 21.5 13C21.5 11.3431 20.1569 10 18.5 10H15V16Z" fill="#1C1917"/>
      <path d="M22 22L18 16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
  if (variant === 2) return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 16L16 4L28 16L16 28L4 16Z" fill="#1C1917" />
      <path d="M12 16L16 12L20 16L16 20L12 16Z" fill="white" />
    </svg>
  );
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#1C1917"/>
      <path d="M10 16H22M16 10V22" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="16" cy="16" r="4" fill="white"/>
    </svg>
  );
}

// Custom Minimalist Icons for Nav
function CustomIcon({ name, size = 20, active }: { name: string, size?: number, active?: boolean }) {
  const color = "currentColor";
  const strokeW = active ? 2.5 : 2;
  const opacity = active ? 1 : 0.8;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" style={{ opacity }}>
      {name === "Home" && <><path d="M4 10L12 3L20 10V20C20 20.5 19.5 21 19 21H5C4.5 21 4 20.5 4 20V10Z" /><path d="M9 21V12H15V21" /></>}
      {name === "Pay" && <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10H21M8 14H10" /></>}
      {name === "Invoice" && <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 7H15M9 11H15M9 15H11" /></>}
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
  const navigation = useNavigation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [logoVariant, setLogoVariant] = useState(1);

  // Simulate an app loader for aesthetic transitions when route changes
  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const isLoading = navigation.state === "loading" || isNavigating;

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-stone-900 font-sans selection:bg-stone-200 overflow-hidden relative flex flex-col items-center">
      
      {/* Subtle organic background mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-stone-200/40 rounded-full blur-[120px] mix-blend-multiply opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-stone-300/30 rounded-full blur-[120px] mix-blend-multiply opacity-60" />
      </div>

      {/* Invisible overlay to close dropdowns */}
      {(isNotifOpen || isProfileOpen || isSearchOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setIsNotifOpen(false); setIsProfileOpen(false); setIsSearchOpen(false); }} />
      )}

      {/* Top Header Navigation */}
      <header className="w-full px-6 py-4 flex items-center justify-between z-50">
        <div 
          className="flex items-center gap-3 cursor-pointer group relative" 
          onClick={() => setLogoVariant(v => v === 3 ? 1 : v + 1)}
        >
           <motion.div
             key={logoVariant}
             initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
             animate={{ scale: 1, opacity: 1, rotate: 0 }}
             transition={{ type: "spring", stiffness: 300, damping: 20 }}
           >
             <PayzeLogo variant={logoVariant} />
           </motion.div>
           <span className="font-bold tracking-tight text-2xl text-stone-900 group-hover:text-stone-600 transition-colors">
             Payze<span className="text-stone-900">.</span>
           </span>
        </div>

        <div className="flex items-center gap-4 relative">
          {/* Expanded Search Bar Component */}
          <div className="relative z-50 flex items-center justify-end">
            <AnimatePresence initial={false}>
              {isSearchOpen ? (
                <motion.div
                  key="search-dropdown"
                  initial={{ width: 40, opacity: 0 }}
                  animate={{ width: 300, opacity: 1 }}
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
                    />
                  </div>
                  <div className="bg-stone-50/50 p-2 space-y-1">
                    {searchQuery.length > 0 ? (
                      <>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 px-2 py-1">Results</p>
                        <div className="px-3 py-2 bg-white rounded-xl text-sm text-stone-900 cursor-pointer flex items-center gap-2 shadow-sm border border-stone-100"><Search size={14} className="text-stone-400"/> Search "{searchQuery}"</div>
                        <div className="px-3 py-2 hover:bg-white rounded-xl text-sm text-stone-700 cursor-pointer flex items-center gap-2 transition-colors"><User size={14}/> Customer: {searchQuery}</div>
                        <div className="px-3 py-2 hover:bg-white rounded-xl text-sm text-stone-700 cursor-pointer flex items-center gap-2 transition-colors"><FileText size={14}/> Invoice #{Math.floor(Math.random() * 10000)} matching "{searchQuery}"</div>
                      </>
                    ) : (
                      <>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 px-2 py-1">Suggestions</p>
                        <div className="px-3 py-2 hover:bg-white rounded-xl text-sm text-stone-700 cursor-pointer flex items-center gap-2 transition-colors"><FileText size={14}/> Invoice INV-2024</div>
                        <div className="px-3 py-2 hover:bg-white rounded-xl text-sm text-stone-700 cursor-pointer flex items-center gap-2 transition-colors"><User size={14}/> John Doe</div>
                        <div className="px-3 py-2 hover:bg-white rounded-xl text-sm text-stone-700 cursor-pointer flex items-center gap-2 transition-colors"><Terminal size={14}/> API Documentation</div>
                      </>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.button 
                  key="search-btn"
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSearchOpen(true)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white border border-transparent hover:border-stone-200/50 transition-all text-stone-600 shadow-sm hover:shadow-md"
                >
                  <Search size={18} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 relative z-50">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button 
                onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); setIsSearchOpen(false); }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${isNotifOpen ? 'bg-stone-900 border-stone-900 text-white shadow-sm' : 'hover:bg-white border-transparent hover:border-stone-200/50 text-stone-600 hover:shadow-md'} relative`}
              >
                <Bell size={18} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-stone-500 rounded-full border-2 border-[#FAFAF8] shadow-sm" />
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div 
                    key="notif-dropdown"
                    initial={{ opacity: 0, y: 12, scale: 0.96 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute right-0 top-14 w-[360px] bg-white/95 backdrop-blur-3xl border border-stone-200/80 rounded-3xl shadow-[0_24px_48px_rgba(0,0,0,0.08)] overflow-hidden"
                  >
                    <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                      <h4 className="font-semibold text-stone-800 text-sm">Notifications</h4>
                      <button className="text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors bg-stone-100 px-2 py-1 rounded-md">Mark all read</button>
                    </div>
                    <div className="max-h-[340px] overflow-y-auto">
                      {[
                        { icon: CheckCircle2, color: "text-stone-900", bg: "bg-stone-100", title: "Settlement Completed", desc: "Batch STL-9824 ($45,200.00) successfully settled.", time: "2m ago" },
                        { icon: AlertTriangle, color: "text-stone-800", bg: "bg-stone-200", title: "Anomaly Detected", desc: "Spike in 'Do Not Honour' codes observed.", time: "15m ago" },
                      ].map((n, i) => (
                        <div key={i} className="p-4 border-b border-stone-100 hover:bg-stone-50 cursor-pointer transition-colors flex gap-4 group">
                          <div className={`w-10 h-10 rounded-full ${n.bg} ${n.color} flex items-center justify-center shrink-0 shadow-sm border border-white`}>
                            <n.icon size={18} />
                          </div>
                          <div>
                            <div className="flex justify-between items-start mb-1">
                               <h5 className="text-sm font-medium text-stone-800 group-hover:text-stone-900 transition-colors">{n.title}</h5>
                               <span className="text-[10px] font-medium text-stone-400 whitespace-nowrap pt-0.5">{n.time}</span>
                            </div>
                            <p className="text-xs text-stone-500 leading-relaxed">{n.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); setIsSearchOpen(false); }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-2 ml-2 ${isProfileOpen ? 'border-stone-900 bg-stone-900 text-white shadow-md' : 'border-transparent bg-stone-200 text-stone-600 hover:bg-stone-300 hover:shadow-sm'}`}
              >
                <User size={18} />
              </button>
              
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    key="profile-dropdown"
                    initial={{ opacity: 0, y: 12, scale: 0.96 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute right-0 top-14 w-64 bg-white/95 backdrop-blur-3xl border border-stone-200/80 rounded-3xl shadow-[0_24px_48px_rgba(0,0,0,0.08)] overflow-hidden"
                  >
                    <div className="p-5 border-b border-stone-100 bg-stone-50/50 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-stone-800 to-stone-900 text-white flex items-center justify-center shadow-inner">
                        <User size={24} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-stone-800 text-sm">Sarah Connor</h4>
                        <p className="text-xs text-stone-500 font-medium">sarah@payze.com</p>
                      </div>
                    </div>
                    <div className="p-2 space-y-1">
                      <button className="w-full text-left px-4 py-2.5 rounded-2xl text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors flex items-center gap-3">
                        <User size={16} /> My Profile
                      </button>
                      <button className="w-full text-left px-4 py-2.5 rounded-2xl text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors flex items-center gap-3">
                        <Settings size={16} /> Preferences
                      </button>
                    </div>
                    <div className="p-2 border-t border-stone-100 bg-stone-50/50">
                      <button className="w-full text-left px-4 py-2.5 rounded-2xl text-sm font-medium text-stone-900 hover:bg-stone-200 transition-colors flex items-center gap-3">
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

      {/* Revolutionary App Loader */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="app-loader"
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)", transition: { duration: 0.4 } }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAFAF8]/95 backdrop-blur-2xl"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="relative w-32 h-32 mb-8 drop-shadow-xl"
            >
              {/* Organic shape loader */}
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
                <path fill="#1C1917" fillOpacity="0.1" d="M47.7,-57.2C59.9,-43.3,66.5,-25.4,66.9,-8.1C67.3,9.2,61.4,25.8,51.8,40.1C42.1,54.4,28.8,66.4,12.3,71.2C-4.1,75.9,-23.7,73.4,-41.2,64.2C-58.7,55.1,-74.1,39.3,-80.6,19.9C-87.1,0.5,-84.7,-22.4,-73.4,-40.4C-62.1,-58.4,-42.1,-71.4,-24.1,-75.1C-6.1,-78.7,9.9,-73,23.3,-65.4C36.7,-57.8,51.5,-48.3,47.7,-57.2Z" transform="translate(100 100)" />
              </svg>
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-10 h-10 rounded-full bg-stone-900 shadow-[0_0_20px_rgba(28,25,23,0.4)]" />
              </motion.div>
            </motion.div>
            <p className="text-stone-800 font-semibold tracking-widest text-sm uppercase drop-shadow-sm">Loading Payze Workspace</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
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

      {/* Floating Dynamic Dock Navigation */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 px-4 w-full max-w-[95vw] overflow-x-auto hide-scrollbar flex justify-center pb-4 -mb-4">
        <nav className="flex items-center gap-1.5 p-2 bg-white/80 backdrop-blur-2xl rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,1)] border border-stone-200/50 w-max pointer-events-auto transition-transform hover:scale-[1.02] duration-300">
          <NavItem to="/" icon={<CustomIcon name="Home" active={location.pathname === "/"} />} label="Home" active={location.pathname === "/"} />
          <NavItem to="/pay" icon={<CustomIcon name="Pay" active={location.pathname.startsWith("/pay")} />} label="Pay" active={location.pathname.startsWith("/pay")} />
          <NavItem to="/invoice" icon={<CustomIcon name="Invoice" active={location.pathname === "/invoice"} />} label="Invoice" active={location.pathname === "/invoice"} />
          <NavItem to="/qr" icon={<CustomIcon name="QR" active={location.pathname === "/qr"} />} label="QR" active={location.pathname === "/qr"} />
          <NavItem to="/subscriptions" icon={<CustomIcon name="Subs" active={location.pathname === "/subscriptions"} />} label="Subs" active={location.pathname === "/subscriptions"} />
          <NavItem to="/risk" icon={<CustomIcon name="Risk" active={location.pathname === "/risk"} />} label="Risk" active={location.pathname === "/risk"} />
          <NavItem to="/analytics" icon={<CustomIcon name="Analytics" active={location.pathname === "/analytics"} />} label="Analytics" active={location.pathname === "/analytics"} />
          <NavItem to="/settlements" icon={<CustomIcon name="Settlements" active={location.pathname === "/settlements"} />} label="Settlements" active={location.pathname === "/settlements"} />
          <NavItem to="/onboarding" icon={<CustomIcon name="Onboarding" active={location.pathname === "/onboarding"} />} label="Onboarding" active={location.pathname === "/onboarding"} />
          <NavItem to="/admin" icon={<CustomIcon name="Admin" active={location.pathname === "/admin"} />} label="Admin" active={location.pathname === "/admin"} />
          <NavItem to="/developer" icon={<CustomIcon name="Dev" active={location.pathname === "/developer"} />} label="Dev" active={location.pathname === "/developer"} />
        </nav>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active: boolean }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link 
      to={to} 
      className="relative group flex items-center justify-center h-12 rounded-full transition-colors overflow-hidden px-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute inset-0 bg-stone-900 rounded-full shadow-md"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <AnimatePresence>
        {!active && isHovered && (
          <motion.div
            layoutId="nav-hover-indicator"
            className="absolute inset-0 bg-stone-100 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </AnimatePresence>
      <div className={`relative z-10 flex items-center justify-center transition-colors duration-300 ${active ? "text-white" : "text-stone-500 group-hover:text-stone-900"}`}>
        <motion.div
          animate={{ 
            scale: active ? 1 : isHovered ? 1.1 : 1,
            rotate: isHovered && !active ? [0, -10, 10, 0] : 0
          }}
          transition={{ duration: 0.3 }}
        >
          {icon}
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
