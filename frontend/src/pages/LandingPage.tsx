import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  Brain,
  FileSearch,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  BarChart3,
  Lock,
  Cloud,
  Zap,
  Users,
  Building2,
  Globe,
  Star,
  Quote,
  FileText,
  Github,
  Twitter,
  Linkedin,
  Mail,
  ChevronRight,
  Upload,
  Activity,
  Cpu,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useNavigate } from "react-router-dom";
import Hero3D from "../components/landing/Hero3D";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0.01]);
  const heroScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.95]);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Enterprise", href: "#enterprise" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <div className="relative min-h-screen bg-[var(--background)]">
      {/* Navigation */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--brand)]">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-lg font-bold">Sentinel AI</span>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                Sign In
              </Button>
              <Button size="sm" onClick={() => navigate("/signup")}>
                Get Started
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-[var(--border)] bg-[var(--background)]"
            >
              <div className="px-4 py-4 space-y-3">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
                <div className="pt-2 space-y-2">
                  <Button variant="outline" className="w-full" onClick={() => navigate("/login")}>
                    Sign In
                  </Button>
                  <Button className="w-full" onClick={() => navigate("/signup")}>
                    Get Started
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        <Hero3D />
        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Badge variant="default" className="mb-6 text-sm px-4 py-1.5 gap-2">
              <Cpu size={14} />
              AI-Powered Security Analysis Platform
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.1]"
          >
            <span className="gradient-text">Intelligent</span>
            <br />
            <span>Cybersecurity for</span>
            <br />
            <span>Modern Enterprise</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-[var(--foreground-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Deploy AI agents that analyze your documents, contracts, and infrastructure
            for security vulnerabilities, compliance gaps, and actionable intelligence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="xl" onClick={() => navigate("/signup")} className="group">
              Start Free Analysis
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-0.5 transition-transform" />
            </Button>
            <Button
              size="xl"
              variant="outline"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
              See How It Works
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="flex items-center justify-center gap-8 mt-16 text-sm text-[var(--foreground-tertiary)]"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[var(--brand)]" /> SOC 2
            </span>
            <span className="flex items-center gap-1.5">
              <Lock size={14} className="text-[var(--cyber)]" /> GDPR
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-[var(--brand)]" /> HIPAA
            </span>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown size={20} className="text-[var(--foreground-tertiary)]" />
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp}>
              <Badge variant="default" className="mb-4">Powerful Features</Badge>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4"
            >
              Enterprise-Grade{" "}
              <span className="gradient-text">Security Analysis</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto"
            >
              Our AI agents analyze your documents and infrastructure to identify
              vulnerabilities, ensure compliance, and provide actionable recommendations.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -4 }}
                className="group relative rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all duration-200 hover:shadow-[var(--card-shadow-hover)] hover:border-[var(--brand)]/30"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--brand-subtle)] text-[var(--brand)] mb-4 group-hover:scale-110 transition-transform duration-200">
                  {feature.icon}
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 md:py-32 bg-[var(--background-secondary)] relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp}>
              <Badge variant="default" className="mb-4">Simple Process</Badge>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4"
            >
              How{" "}
              <span className="gradient-text">Sentinel AI</span> Works
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto"
            >
              Three simple steps to get comprehensive security analysis of your documents.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-1/2 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-[var(--brand)] via-[var(--cyber)] to-[var(--brand)] opacity-20 -translate-y-1/2" />

            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="relative text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--brand-subtle)] text-[var(--brand)] mx-auto mb-6 relative z-10"
                >
                  {step.icon}
                </motion.div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--brand)] text-white text-sm font-bold mx-auto mb-4 relative z-10">
                  {i + 1}
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="text-center"
              >
                <div className="font-display text-3xl md:text-5xl font-bold gradient-text mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-[var(--foreground-secondary)]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section id="enterprise" className="py-24 md:py-32 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp}>
              <Badge variant="default" className="mb-4">Enterprise Ready</Badge>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4"
            >
              Built for{" "}
              <span className="gradient-text">Scale</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto"
            >
              From startups to Fortune 500 companies, Sentinel AI scales with your security needs.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enterpriseFeatures.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="flex items-start gap-4 p-4"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--brand-subtle)] text-[var(--brand)] shrink-0">
                  {feat.icon}
                </div>
                <div>
                  <h4 className="font-display font-semibold mb-1">{feat.title}</h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">{feat.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 md:py-32 bg-[var(--background-secondary)] relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp}>
              <Badge variant="default" className="mb-4">Trusted by Teams</Badge>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4"
            >
              What Our{" "}
              <span className="gradient-text">Customers</span> Say
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={14} className="fill-[var(--brand)] text-[var(--brand)]" />
                  ))}
                </div>
                <Quote size={16} className="text-[var(--foreground-tertiary)] mb-2" />
                <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed mb-4">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--cyber)] flex items-center justify-center text-white text-sm font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-[var(--foreground-tertiary)]">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 md:py-32 relative">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp}>
              <Badge variant="default" className="mb-4">FAQ</Badge>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl md:text-5xl font-bold tracking-tight"
            >
              Frequently Asked{" "}
              <span className="gradient-text">Questions</span>
            </motion.h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.question} answer={faq.answer} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 bg-[var(--background-secondary)] relative">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4"
            >
              Ready to Secure Your{" "}
              <span className="gradient-text">Enterprise?</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto mb-8"
            >
              Start your free analysis today. No credit card required.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="xl" onClick={() => navigate("/signup")} className="group">
                Start Free Analysis
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
              <Button size="xl" variant="outline" onClick={() => navigate("/login")}>
                Sign In to Dashboard
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--brand)]">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-display text-lg font-bold">Sentinel AI</span>
              </div>
              <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed max-w-xs">
                AI-powered cybersecurity analysis platform for modern enterprises.
              </p>
            </div>
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h4 className="font-medium text-sm mb-3">{group.title}</h4>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-[var(--border)] gap-4">
            <p className="text-xs text-[var(--foreground-tertiary)]">
              &copy; 2026 Sentinel AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FAQItem({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      custom={index}
      className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full p-5 text-left"
      >
        <span className="font-medium text-sm">{question}</span>
        <ChevronRight
          size={16}
          className={`text-[var(--foreground-tertiary)] transition-transform duration-200 ${
            open ? "rotate-90" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="px-5 pb-5 text-sm text-[var(--foreground-secondary)] leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const features = [
  {
    icon: <Brain size={24} />,
    title: "AI-Powered Analysis",
    description:
      "Multi-agent AI system that analyzes documents for security vulnerabilities, compliance gaps, and risks with unprecedented accuracy.",
  },
  {
    icon: <ShieldCheck size={24} />,
    title: "Compliance Checking",
    description:
      "Automated compliance verification against SOC 2, HIPAA, GDPR, ISO 27001, and other industry standards.",
  },
  {
    icon: <FileSearch size={24} />,
    title: "Document Intelligence",
    description:
      "Support for PDF, DOCX, and TXT files with intelligent parsing and security analysis of contracts and policies.",
  },
  {
    icon: <AlertTriangle size={24} />,
    title: "Risk Scoring",
    description:
      "Advanced risk scoring system that quantifies security posture and prioritizes remediation efforts.",
  },
  {
    icon: <BarChart3 size={24} />,
    title: "Executive Reporting",
    description:
      "Generate comprehensive security reports with executive summaries, actionable insights, and compliance dashboards.",
  },
  {
    icon: <Activity size={24} />,
    title: "Real-Time Monitoring",
    description:
      "Continuous monitoring and analysis of your security posture with real-time alerts and recommendations.",
  },
];

const steps = [
  {
    icon: <Upload size={24} />,
    title: "Upload Documents",
    description:
      "Upload your security policies, contracts, and infrastructure documents in PDF, DOCX, or TXT format.",
  },
  {
    icon: <Cpu size={24} />,
    title: "AI Analysis",
    description:
      "Our multi-agent AI system analyzes your documents for vulnerabilities, compliance gaps, and risks.",
  },
  {
    icon: <Shield size={24} />,
    title: "Get Insights",
    description:
      "Receive a comprehensive security report with risk scores, compliance status, and actionable recommendations.",
  },
];

const stats = [
  { value: "10K+", label: "Documents Analyzed" },
  { value: "99.9%", label: "Threat Detection Rate" },
  { value: "50+", label: "Compliance Frameworks" },
  { value: "4.9/5", label: "Customer Rating" },
];

const enterpriseFeatures = [
  {
    icon: <Building2 size={20} />,
    title: "Multi-Organization",
    description: "Manage security across multiple departments and business units.",
  },
  {
    icon: <Users size={20} />,
    title: "Team Collaboration",
    description: "Role-based access control with granular permissions for your team.",
  },
  {
    icon: <Cloud size={20} />,
    title: "Cloud-Native",
    description: "Fully cloud-native architecture with 99.99% uptime SLA.",
  },
  {
    icon: <Lock size={20} />,
    title: "Enterprise Security",
    description: "SOC 2 Type II certified with end-to-end encryption.",
  },
  {
    icon: <Globe size={20} />,
    title: "Global Compliance",
    description: "Support for international compliance frameworks and regulations.",
  },
  {
    icon: <Zap size={20} />,
    title: "Fast Integration",
    description: "Seamless integration with your existing security tools and workflows.",
  },
];

const testimonials = [
  {
    quote:
      "Sentinel AI transformed our security review process. What used to take weeks now takes hours. The AI analysis is incredibly accurate.",
    name: "Sarah Chen",
    role: "CISO, TechCorp Global",
  },
  {
    quote:
      "The compliance checking alone saved us months of manual work. We passed our SOC 2 audit with flying colors thanks to Sentinel AI.",
    name: "Marcus Rodriguez",
    role: "VP Engineering, SecureFlow",
  },
  {
    quote:
      "We analyzed over 500 vendor security documents in a week. Sentinel AI's risk scoring helped us prioritize our remediation efforts perfectly.",
    name: "Emily Watson",
    role: "Security Lead, DataVault Inc.",
  },
];

const faqs = [
  {
    question: "What types of documents can Sentinel AI analyze?",
    answer:
      "Sentinel AI supports PDF, DOCX, and TXT file formats. Our intelligent parsing system extracts and analyzes text from your security policies, contracts, vendor assessments, and infrastructure documents.",
  },
  {
    question: "How accurate is the AI analysis?",
    answer:
      "Our multi-agent AI system achieves 99.9% threat detection rate. Each document is analyzed by specialized AI agents for security vulnerabilities, compliance gaps, and risk assessment, then cross-validated for maximum accuracy.",
  },
  {
    question: "Which compliance frameworks do you support?",
    answer:
      "We support SOC 2, HIPAA, GDPR, ISO 27001, PCI DSS, FedRAMP, and 50+ other compliance frameworks. New frameworks are added regularly based on customer requirements.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. Sentinel AI is SOC 2 Type II certified with end-to-end encryption. Your documents are encrypted at rest and in transit, and we never share your analysis data with third parties.",
  },
  {
    question: "Can I integrate Sentinel AI with my existing tools?",
    answer:
      "Yes, we offer REST APIs, webhooks, and integrations with popular security tools including SIEM platforms, ticket systems, and CI/CD pipelines.",
  },
  {
    question: "What kind of support do you offer?",
    answer:
      "We offer 24/7 support for Enterprise plans, including dedicated account managers, technical support engineers, and priority SLA response times.",
  },
];

const footerLinks = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Security", "Integrations", "Changelog"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Press Kit", "Contact"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"],
  },
];
