import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutGrid, 
  Calendar, 
  Bot, 
  TrendingUp, 
  Globe, 
  Menu, 
  X, 
  Sparkles, 
  Users, 
  ArrowRight,
  Shield,
  Layers,
  Cpu,
  ArrowUpRight
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { getStoredRefreshToken } from "../../utils/authTokens";
import logoAlloc from "../../assets/images/logo_alloc_108x134.png";

// Mock data for AI simulator widget
const mockMembers = [
  {
    name: "Alex Nguyen",
    role: "Senior Fullstack",
    skills: ["React", "Node.js", "System Design"],
    baseScore: 92,
    experience: "5+ years",
    workload: "3 active tasks"
  },
  {
    name: "Elena Tran",
    role: "AI & Data Engineer",
    skills: ["Python", "PyTorch", "AI/Machine Learning", "FastAPI"],
    baseScore: 95,
    experience: "4 years",
    workload: "1 active task"
  },
  {
    name: "Minh Le",
    role: "Backend Developer",
    skills: ["Node.js", "SignalR", "WebSockets", "C#"],
    baseScore: 88,
    experience: "3 years",
    workload: "2 active tasks"
  },
  {
    name: "Sofia Pham",
    role: "Frontend Specialist",
    skills: ["React", "Tailwind CSS", "UI/UX Design"],
    baseScore: 90,
    experience: "3+ years",
    workload: "2 active tasks"
  }
];

export default function LandingPage() {
  const { t, locale, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // States for AI Simulator
  const [selectedSkill, setSelectedSkill] = useState("React");
  const [selectedComplexity, setSelectedComplexity] = useState("Medium");
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  useEffect(() => {
    // Check auth status
    const token = getStoredRefreshToken();
    setIsAuth(!!token);

    // Navbar scroll listener
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAuthNavigation = (target) => {
    if (isAuth) {
      navigate("/workspaces");
    } else {
      navigate(target);
    }
  };

  // Run AI allocation simulation logic
  const handleSimulation = () => {
    setSimulating(true);
    setSimulationResult(null);

    setTimeout(() => {
      // Find matches containing selectedSkill
      let candidates = mockMembers.map(member => {
        let scoreBonus = 0;
        
        // Skill bonus
        if (member.skills.includes(selectedSkill)) {
          scoreBonus += 15;
        } else {
          scoreBonus -= 25;
        }

        // Complexity fit check
        if (selectedComplexity === "High") {
          if (member.role.includes("Senior") || member.role.includes("Specialist") || member.role.includes("Engineer")) {
            scoreBonus += 10;
          } else {
            scoreBonus -= 10;
          }
        } else if (selectedComplexity === "Low") {
          if (member.experience.includes("3")) {
            scoreBonus += 5;
          }
        }

        // Workload bonus (lower workload = higher score)
        if (member.workload === "1 active task") {
          scoreBonus += 8;
        } else if (member.workload === "3 active tasks") {
          scoreBonus -= 5;
        }

        const finalScore = Math.min(100, Math.max(40, member.baseScore + scoreBonus));

        return { ...member, finalScore };
      });

      // Sort by finalScore desc
      candidates.sort((a, b) => b.finalScore - a.finalScore);
      setSimulationResult(candidates[0]);
      setSimulating(false);
    }, 1200);
  };

  // Auto trigger simulation on load
  useEffect(() => {
    handleSimulation();
  }, []);

  return (
    <div className="relative bg-[#000000] text-[#f8fafc] font-sans min-h-screen overflow-x-hidden select-none selection:bg-[#3b82f6]/30 selection:text-[#f8fafc]">
      
      {/* Decorative Blur Spheres (Mesh Gradients) */}
      <div className="absolute top-[-10%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-[#3b82f6]/8 blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-[35%] right-[-15%] w-[50vw] h-[50vw] rounded-full bg-[#8b5cf6]/6 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[-5%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-[#3b82f6]/5 blur-[140px] pointer-events-none z-0" />

      {/* Sticky Top Navbar */}
      <header 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-[#131b2c]/85 border-b border-[#1f2937]/50 backdrop-blur-md py-3 shadow-lg" 
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img src={logoAlloc} alt="Alloc Logo" className="h-8 w-auto filter drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
            <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-[#f8fafc] to-[#cbd5e1] bg-clip-text text-transparent">
              Alloc
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-[#cbd5e1] hover:text-[#f8fafc] transition-colors relative group py-2">
              {t("landing.nav.features")}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#3b82f6] transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#tech" className="text-sm font-medium text-[#cbd5e1] hover:text-[#f8fafc] transition-colors relative group py-2">
              {t("landing.nav.tech")}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#3b82f6] transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#ai-demo" className="text-sm font-medium text-[#cbd5e1] hover:text-[#f8fafc] transition-colors relative group py-2">
              Alloc AI
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8b5cf6] transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#about" className="text-sm font-medium text-[#cbd5e1] hover:text-[#f8fafc] transition-colors relative group py-2">
              {t("landing.nav.about")}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#3b82f6] transition-all duration-300 group-hover:w-full" />
            </a>
          </nav>

          {/* Desktop Controls (Lang Switcher & Dynamic Auth Button) */}
          <div className="hidden md:flex items-center gap-5">
            <button 
              onClick={() => changeLanguage(locale === "vi" ? "en" : "vi")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1f2937]/80 bg-white/3 hover:bg-white/8 hover:border-white/20 transition-all text-xs font-medium text-[#cbd5e1]"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{locale === "vi" ? "EN" : "VI"}</span>
            </button>

            {isAuth ? (
              <button 
                onClick={() => navigate("/workspaces")}
                className="px-5 py-2 text-sm font-medium bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all duration-200"
              >
                {t("landing.nav.dashboard")}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-sm font-medium text-[#cbd5e1] hover:text-white transition-colors"
                >
                  {t("landing.nav.login")}
                </button>
                <button 
                  onClick={() => navigate("/register")}
                  className="px-5 py-2 text-sm font-medium bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all duration-200"
                >
                  {t("landing.nav.register")}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <button 
            className="md:hidden p-1.5 rounded-lg border border-[#1f2937]/80 hover:bg-white/5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-[#f8fafc]" /> : <Menu className="w-6 h-6 text-[#f8fafc]" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-[#131b2c] border-b border-[#1f2937] overflow-hidden"
            >
              <div className="px-6 py-4 flex flex-col gap-4">
                <a 
                  href="#features" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-[#cbd5e1] hover:text-white py-1"
                >
                  {t("landing.nav.features")}
                </a>
                <a 
                  href="#tech" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-[#cbd5e1] hover:text-white py-1"
                >
                  {t("landing.nav.tech")}
                </a>
                <a 
                  href="#ai-demo" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-[#cbd5e1] hover:text-white py-1"
                >
                  Alloc AI
                </a>
                <a 
                  href="#about" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-[#cbd5e1] hover:text-white py-1"
                >
                  {t("landing.nav.about")}
                </a>

                <div className="h-[1px] bg-[#1f2937] my-1" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#cbd5e1]">Language / Ngôn ngữ</span>
                  <button 
                    onClick={() => {
                      changeLanguage(locale === "vi" ? "en" : "vi");
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1f2937] bg-white/3 text-xs text-[#cbd5e1]"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{locale === "vi" ? "Tiếng Anh (EN)" : "Tiếng Việt (VI)"}</span>
                  </button>
                </div>

                {isAuth ? (
                  <button 
                    onClick={() => {
                      navigate("/workspaces");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-3 text-center text-sm font-medium bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl shadow-lg transition-all"
                  >
                    {t("landing.nav.dashboard")}
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => {
                        navigate("/login");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-3 text-center text-sm font-medium border border-[#1f2937] hover:bg-white/5 text-[#cbd5e1] rounded-xl transition-all"
                    >
                      {t("landing.nav.login")}
                    </button>
                    <button 
                      onClick={() => {
                        navigate("/register");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-3 text-center text-sm font-medium bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl shadow-lg transition-all"
                    >
                      {t("landing.nav.register")}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-6 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-6 flex flex-col items-start text-left"
          >
            {/* New feature pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#3b82f6]/30 bg-[#3b82f6]/8 text-xs font-semibold text-[#3b82f6] mb-6 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>{t("landing.hero.badge")}</span>
            </div>

            {/* Gradient Headline */}
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
              <span className="block text-white mb-2">{t("landing.hero.title").split("&")[0]}</span>
              <span className="bg-gradient-to-r from-[#3b82f6] via-[#60a5fa] to-[#8b5cf6] bg-clip-text text-transparent">
                & {t("landing.hero.title").split("&")[1] || "AI Resource Optimization"}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-lg text-[#cbd5e1] mb-8 max-w-xl leading-relaxed">
              {t("landing.hero.subtitle")}
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <button 
                onClick={() => handleAuthNavigation("/register")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-7 text-base font-semibold bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl shadow-lg shadow-blue-500/25 active:scale-[0.98] hover:shadow-blue-500/35 transition-all duration-200"
              >
                <span>{isAuth ? t("landing.nav.dashboard") : t("landing.hero.ctaPrimary")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a 
                href="#features" 
                className="w-full sm:w-auto flex items-center justify-center py-3.5 px-7 text-base font-semibold border border-[#1f2937] bg-white/3 hover:bg-white/8 hover:border-white/20 text-white rounded-xl active:scale-[0.98] transition-all duration-200"
              >
                {t("landing.hero.ctaSecondary")}
              </a>
            </div>

            {/* Users stat */}
            <div className="mt-10 flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border border-black bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">A</div>
                <div className="w-8 h-8 rounded-full border border-black bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">B</div>
                <div className="w-8 h-8 rounded-full border border-black bg-teal-600 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">C</div>
                <div className="w-8 h-8 rounded-full border border-black bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">+</div>
              </div>
              <span className="text-xs font-medium text-[#cbd5e1]">
                {t("landing.hero.usersCount")}
              </span>
            </div>
          </motion.div>

          {/* Right Mockup Column */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="lg:col-span-6 relative flex justify-center items-center h-full min-h-[350px] lg:min-h-[450px]"
          >
            {/* Visual glow behind mockup */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full bg-[#3b82f6]/10 blur-[80px] z-0" />

            {/* Main Mockup: Kanban Card & Tasks (Animated) */}
            <div className="relative w-full max-w-[480px] bg-[#131b2c]/85 border border-white/10 rounded-2xl p-6 shadow-2xl z-10 backdrop-blur-md">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1f2937]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                  <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                  <div className="w-3 h-3 rounded-full bg-[#10b981]" />
                  <span className="text-xs font-mono text-[#cbd5e1] ml-2">alloc_project_board.json</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="h-2 w-10 bg-white/5 rounded-full" />
                  <div className="h-2 w-6 bg-white/10 rounded-full" />
                </div>
              </div>

              {/* Mockup Workspace Columns */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Column 1: In Progress */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                    <span className="text-xs font-bold text-[#f8fafc] uppercase tracking-wider">In Progress</span>
                    <span className="text-[10px] bg-white/5 text-[#94a3b8] px-1.5 py-0.5 rounded">2</span>
                  </div>

                  {/* Task Card 1 (Animated Floating) */}
                  <motion.div 
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="p-3 bg-[#0b0f19] border border-white/5 rounded-xl flex flex-col gap-2 hover:border-[#3b82f6]/40 transition-colors cursor-grab active:cursor-grabbing shadow-lg"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-[#3b82f6] bg-[#3b82f6]/10 px-2 py-0.5 rounded">Frontend</span>
                      <span className="text-[10px] text-yellow-500 font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded">High</span>
                    </div>
                    <h4 className="text-xs font-bold text-[#f8fafc] leading-snug">Implement Auth Pages & Routing</h4>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden mt-1">
                      <div className="w-[75%] h-full bg-[#3b82f6]" />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-1.5 bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 px-1.5 py-0.5 rounded">
                        <Bot className="w-3 h-3 text-[#8b5cf6]" />
                        <span className="text-[8px] font-semibold text-[#8b5cf6] uppercase">AI Match</span>
                      </div>
                      <span className="text-[9px] text-[#94a3b8]">Aug 5</span>
                    </div>
                  </motion.div>

                  {/* Task Card 2 */}
                  <div className="p-3 bg-[#0b0f19] border border-white/5 rounded-xl flex flex-col gap-2 opacity-80">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded">Design</span>
                      <span className="text-[10px] text-green-400 font-bold bg-[#10b981]/10 px-1.5 py-0.5 rounded">Low</span>
                    </div>
                    <h4 className="text-xs font-semibold text-[#cbd5e1] leading-snug">Create Landing Page Wireframes</h4>
                    <div className="flex justify-between items-center mt-2">
                      <div className="w-4 h-4 rounded-full bg-slate-600 flex items-center justify-center text-[8px] text-white">S</div>
                      <span className="text-[9px] text-[#94a3b8]">Aug 3</span>
                    </div>
                  </div>
                </div>

                {/* Column 2: AI Review */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
                    <span className="text-xs font-bold text-[#f8fafc] uppercase tracking-wider">AI review</span>
                    <span className="text-[10px] bg-white/5 text-[#94a3b8] px-1.5 py-0.5 rounded">1</span>
                  </div>

                  {/* Task Card 3 (Animated Floating with delay) */}
                  <motion.div 
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="p-3 bg-[#0b0f19] border border-[#8b5cf6]/30 rounded-xl flex flex-col gap-2 hover:border-[#8b5cf6]/60 transition-colors shadow-lg relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#8b5cf6]/5 blur-xl pointer-events-none" />
                    
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">Resource</span>
                      <span className="text-[10px] text-red-500 font-bold bg-red-500/10 px-1.5 py-0.5 rounded">Critical</span>
                    </div>
                    <h4 className="text-xs font-bold text-[#f8fafc] leading-snug">Allocate Dev to SignalR Engine</h4>
                    
                    <div className="p-1.5 bg-[#8b5cf6]/10 rounded-lg border border-[#8b5cf6]/20 mt-1 flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-[#8b5cf6]" />
                        <span className="text-[8px] font-bold text-white">Alloc AI Suggestion:</span>
                      </div>
                      <p className="text-[8px] text-[#cbd5e1]">Match Elena Tran (AI Eng) - Overlap skill 95%</p>
                    </div>

                    <div className="flex justify-between items-center mt-1 pt-1 border-t border-white/5">
                      <div className="w-4 h-4 rounded-full bg-[#10b981] flex items-center justify-center text-[8px] text-white">E</div>
                      <span className="text-[9px] text-[#94a3b8]">Aug 6</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Absolute Decorative Floating Elements */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -top-6 -right-6 w-24 h-24 border border-white/5 rounded-full flex items-center justify-center p-2 bg-[#131b2c]/30 backdrop-blur-sm z-0 pointer-events-none hidden sm:flex"
            >
              <Cpu className="w-6 h-6 text-[#8b5cf6]/60" />
            </motion.div>

            <motion.div 
              animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-8 -left-8 p-4 bg-[#131b2c]/90 border border-white/10 rounded-2xl flex items-center gap-3 shadow-xl z-20 pointer-events-none hidden sm:flex"
            >
              <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-[#94a3b8] font-medium">Project Health</p>
                <p className="text-xs font-bold text-[#f8fafc]">+28.4% Efficiency</p>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* Core Features Grid Section */}
      <section id="features" className="relative py-24 px-6 bg-[#0b0f19]/70 border-y border-[#1f2937]/30 z-10 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#f8fafc] mb-4">
              {t("landing.features.title")}
            </h2>
            <p className="text-base text-[#cbd5e1]">
              {t("landing.features.subtitle")}
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature Card 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
              className="bg-[#131b2c]/40 border border-[#1f2937]/40 rounded-2xl p-6 hover:border-[#3b82f6]/40 hover:bg-[#1a2333]/60 transition-all duration-300 group flex flex-col items-start text-left shadow-lg relative overflow-hidden"
            >
              <div className="p-3 bg-[#3b82f6]/10 rounded-xl text-[#3b82f6] mb-5 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{t("landing.features.item1Title")}</h3>
              <p className="text-sm text-[#cbd5e1] leading-relaxed">{t("landing.features.item1Desc")}</p>
            </motion.div>

            {/* Feature Card 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[#131b2c]/40 border border-[#1f2937]/40 rounded-2xl p-6 hover:border-[#3b82f6]/40 hover:bg-[#1a2333]/60 transition-all duration-300 group flex flex-col items-start text-left shadow-lg relative overflow-hidden"
            >
              <div className="p-3 bg-[#3b82f6]/10 rounded-xl text-[#3b82f6] mb-5 group-hover:scale-110 transition-transform">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{t("landing.features.item2Title")}</h3>
              <p className="text-sm text-[#cbd5e1] leading-relaxed">{t("landing.features.item2Desc")}</p>
            </motion.div>

            {/* Feature Card 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[#131b2c]/40 border border-[#1f2937]/40 rounded-2xl p-6 hover:border-[#8b5cf6]/40 hover:bg-[#1a2333]/60 transition-all duration-300 group flex flex-col items-start text-left shadow-lg relative overflow-hidden"
            >
              <div className="p-3 bg-[#8b5cf6]/10 rounded-xl text-[#8b5cf6] mb-5 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{t("landing.features.item3Title")}</h3>
              <p className="text-sm text-[#cbd5e1] leading-relaxed">{t("landing.features.item3Desc")}</p>
            </motion.div>

            {/* Feature Card 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-[#131b2c]/40 border border-[#1f2937]/40 rounded-2xl p-6 hover:border-[#8b5cf6]/40 hover:bg-[#1a2333]/60 transition-all duration-300 group flex flex-col items-start text-left shadow-lg relative overflow-hidden"
            >
              <div className="p-3 bg-[#8b5cf6]/10 rounded-xl text-[#8b5cf6] mb-5 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{t("landing.features.item4Title")}</h3>
              <p className="text-sm text-[#cbd5e1] leading-relaxed">{t("landing.features.item4Desc")}</p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Interactive AI Simulation Widget Section */}
      <section id="ai-demo" className="relative py-24 px-6 z-10 scroll-mt-16">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/8 text-xs font-semibold text-[#8b5cf6] mb-4">
              <Bot className="w-3.5 h-3.5" />
              <span>Alloc AI Suggestion Engine</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#f8fafc] mb-4">
              {t("landing.aiShowcase.title")}
            </h2>
            <p className="text-base text-[#cbd5e1] max-w-2xl mx-auto">
              {t("landing.aiShowcase.subtitle")}
            </p>
          </div>

          {/* Interactive Widget Box */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-6 md:p-8 bg-[#131b2c]/65 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-md grid grid-cols-1 md:grid-cols-12 gap-8 text-left"
          >
            {/* Control Panel (left 5 columns) */}
            <div className="md:col-span-5 flex flex-col gap-6">
              
              {/* Skill Dropdown */}
              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
                  {t("landing.aiShowcase.skillLabel")}
                </label>
                <select 
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#f8fafc] focus:border-[#8b5cf6] focus:outline-none transition-colors"
                >
                  <option value="React">React / UI Layout</option>
                  <option value="Node.js">Node.js API</option>
                  <option value="SignalR">SignalR Realtime Engine</option>
                  <option value="AI/Machine Learning">AI & Machine Learning Model</option>
                </select>
              </div>

              {/* Complexity Selection */}
              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
                  {t("landing.aiShowcase.taskLabel")}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Low", "Medium", "High"].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSelectedComplexity(lvl)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                        selectedComplexity === lvl 
                          ? "bg-[#8b5cf6] text-white border-[#8b5cf6] shadow-md shadow-[#8b5cf6]/20" 
                          : "bg-[#0b0f19] text-[#cbd5e1] border-white/10 hover:border-white/20"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleSimulation}
                disabled={simulating}
                className="w-full mt-2 py-3 px-5 text-sm font-bold bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {simulating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>{t("landing.aiShowcase.analyzing")}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{t("landing.aiShowcase.analyzeBtn")}</span>
                  </>
                )}
              </button>
            </div>

            {/* Results Display Panel (right 7 columns) */}
            <div className="md:col-span-7 bg-[#0b0f19]/70 border border-white/5 rounded-xl p-5 min-h-[220px] flex flex-col justify-center relative overflow-hidden">
              <AnimatePresence mode="wait">
                {simulating ? (
                  <motion.div 
                    key="simulating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center text-center gap-3"
                  >
                    <div className="p-4 bg-purple-500/10 rounded-full animate-pulse">
                      <Bot className="w-8 h-8 text-[#8b5cf6] animate-bounce" />
                    </div>
                    <p className="text-xs text-[#cbd5e1] tracking-wide animate-pulse">
                      {t("landing.aiShowcase.analyzing")}
                    </p>
                  </motion.div>
                ) : simulationResult ? (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col h-full text-left"
                  >
                    <span className="text-[10px] uppercase font-bold text-[#8b5cf6] tracking-wider mb-2 block">
                      {t("landing.aiShowcase.resultTitle")}
                    </span>

                    {/* Member Details */}
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/5">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center font-bold text-white text-lg">
                        {simulationResult.name.split(" ")[0][0]}{simulationResult.name.split(" ")[1]?.[0] || ""}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">{simulationResult.name}</h4>
                        <p className="text-xs text-[#cbd5e1]">{simulationResult.role}</p>
                      </div>
                      
                      {/* Score Badge */}
                      <div className="ml-auto text-right">
                        <div className="text-xl font-black text-[#8b5cf6]">{simulationResult.finalScore}%</div>
                        <div className="text-[9px] text-[#cbd5e1] uppercase font-semibold">{t("landing.aiShowcase.scoreLabel")}</div>
                      </div>
                    </div>

                    {/* Meta stats */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[#94a3b8] block mb-0.5">{t("landing.aiShowcase.workloadLabel")}</span>
                        <span className="font-semibold text-white">{simulationResult.workload}</span>
                      </div>
                      <div>
                        <span className="text-[#94a3b8] block mb-0.5">{t("landing.aiShowcase.experienceLabel")}</span>
                        <span className="font-semibold text-white">{simulationResult.experience}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[#94a3b8] block mb-1">{t("landing.aiShowcase.skillsLabel")}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {simulationResult.skills.map((sk) => (
                            <span 
                              key={sk} 
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                                sk === selectedSkill 
                                  ? "bg-[#8b5cf6]/20 text-[#c084fc] border-[#8b5cf6]/30 animate-pulse" 
                                  : "bg-white/5 text-[#cbd5e1] border-white/5"
                              }`}
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Technology Stack & Integration Section */}
      <section id="tech" className="relative py-24 px-6 bg-[#0b0f19]/30 border-t border-[#1f2937]/20 z-10 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#f8fafc] mb-4">
              {locale === "vi" ? "Đồng bộ Công nghệ Hiện đại" : "Modern Architecture Stack"}
            </h2>
            <p className="text-base text-[#cbd5e1]">
              {locale === "vi" 
                ? "Ứng dụng được vận hành trên những nền tảng tối tân nhất để đảm bảo tính ổn định và tốc độ thời gian thực." 
                : "Powered by modern technologies designed to sustain high scalability and real-time operations."}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 bg-[#131b2c]/40 border border-white/5 rounded-2xl flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-[#61dafb] mb-2">React 19</span>
              <p className="text-xs text-[#cbd5e1]">Component rendering</p>
            </div>
            <div className="p-6 bg-[#131b2c]/40 border border-white/5 rounded-2xl flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-[#06b6d4] mb-2">Tailwind v4</span>
              <p className="text-xs text-[#cbd5e1]">Custom utility design system</p>
            </div>
            <div className="p-6 bg-[#131b2c]/40 border border-white/5 rounded-2xl flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-[#8b5cf6] mb-2">Motion</span>
              <p className="text-xs text-[#cbd5e1]">Fluid fluidic interactions</p>
            </div>
            <div className="p-6 bg-[#131b2c]/40 border border-white/5 rounded-2xl flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-[#f27300] mb-2">SignalR</span>
              <p className="text-xs text-[#cbd5e1]">Realtime updates engine</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Block */}
      <section className="relative py-20 px-6 z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card-light relative overflow-hidden rounded-3xl p-10 md:p-14 text-center border border-white/10 flex flex-col items-center"
          >
            {/* Blurs inside banner */}
            <div className="absolute top-[-30%] left-[-20%] w-[50%] h-[50%] rounded-full bg-[#3b82f6]/10 blur-[80px]" />
            <div className="absolute bottom-[-30%] right-[-20%] w-[50%] h-[50%] rounded-full bg-[#8b5cf6]/10 blur-[80px]" />

            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 relative z-10">
              {t("landing.cta.title")}
            </h2>
            <p className="text-sm md:text-base text-[#cbd5e1] max-w-xl mb-8 relative z-10">
              {t("landing.cta.subtitle")}
            </p>
            
            <button
              onClick={() => handleAuthNavigation("/register")}
              className="relative z-10 px-8 py-4 text-base font-bold bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl shadow-xl shadow-blue-500/25 active:scale-[0.98] transition-all hover:shadow-blue-500/40"
            >
              {t("landing.cta.btn")}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer Section */}
      <footer id="about" className="relative pt-16 pb-12 px-6 border-t border-[#1f2937]/40 bg-[#0b0f19]/90 z-10">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
            
            {/* Footer brand (5 cols) */}
            <div className="md:col-span-4 flex flex-col items-start text-left">
              <div className="flex items-center gap-3 mb-4">
                <img src={logoAlloc} alt="Alloc Logo" className="h-7 w-auto" />
                <span className="text-lg font-bold tracking-wider text-white">Alloc</span>
              </div>
              <p className="text-sm text-[#cbd5e1] max-w-sm mb-6 leading-relaxed">
                {t("landing.footer.desc")}
              </p>
              
              {/* Language selection in footer */}
              <button 
                onClick={() => changeLanguage(locale === "vi" ? "en" : "vi")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1f2937] hover:border-white/20 transition-all text-xs font-semibold text-[#cbd5e1]"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{locale === "vi" ? "Tiếng Việt (VI) 🇻🇳" : "English (EN) 🇺🇸"}</span>
              </button>
            </div>

            {/* Sitemap directories (8 cols divided in 3 sub-columns) */}
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-left">
              
              {/* Col 1 */}
              <div>
                <h4 className="text-xs uppercase font-bold text-white tracking-widest mb-4">
                  {t("landing.footer.product")}
                </h4>
                <ul className="flex flex-col gap-2.5 text-xs text-[#cbd5e1]">
                  <li><a href="#features" className="hover:text-white transition-colors">{t("landing.nav.features")}</a></li>
                  <li><a href="#tech" className="hover:text-white transition-colors">{t("landing.nav.tech")}</a></li>
                  <li><a href="#ai-demo" className="hover:text-white transition-colors">Alloc AI</a></li>
                </ul>
              </div>

              {/* Col 2 */}
              <div>
                <h4 className="text-xs uppercase font-bold text-white tracking-widest mb-4">
                  {t("landing.footer.company")}
                </h4>
                <ul className="flex flex-col gap-2.5 text-xs text-[#cbd5e1]">
                  <li><a href="#" className="hover:text-white transition-colors">{t("landing.nav.about")}</a></li>
                  <li><span className="text-slate-600 cursor-not-allowed">Careers</span></li>
                  <li><span className="text-slate-600 cursor-not-allowed">Press Kit</span></li>
                </ul>
              </div>

              {/* Col 3 */}
              <div>
                <h4 className="text-xs uppercase font-bold text-white tracking-widest mb-4">
                  {t("landing.footer.resources")}
                </h4>
                <ul className="flex flex-col gap-2.5 text-xs text-[#cbd5e1]">
                  <li><span className="text-slate-600 cursor-not-allowed">Documentation</span></li>
                  <li><span className="text-slate-600 cursor-not-allowed">Guides & Tutorials</span></li>
                  <li><span className="text-slate-600 cursor-not-allowed">Help Center</span></li>
                </ul>
              </div>

              {/* Col 4 */}
              <div>
                <h4 className="text-xs uppercase font-bold text-white tracking-widest mb-4">
                  {t("landing.footer.legal")}
                </h4>
                <ul className="flex flex-col gap-2.5 text-xs text-[#cbd5e1]">
                  <li><span className="text-slate-600 cursor-not-allowed">Privacy Policy</span></li>
                  <li><span className="text-slate-600 cursor-not-allowed">Terms of Service</span></li>
                  <li><span className="text-slate-600 cursor-not-allowed">Security Compliance</span></li>
                </ul>
              </div>

            </div>
          </div>

          <div className="h-[1px] bg-[#1f2937]/50 mb-8" />

          {/* Bottom Copyright details */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#cbd5e1] text-center">
            <span>&copy; 2026 Alloc Inc. {t("landing.footer.rights")}</span>
            <div className="flex items-center gap-4">
              <span className="text-[#3b82f6] font-semibold flex items-center gap-1">
                AllocClientWeb v1.1.0 
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
