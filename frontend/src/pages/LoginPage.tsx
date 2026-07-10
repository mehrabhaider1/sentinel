import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm"
        >
          <div className="flex items-center gap-2 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--brand)]">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-display text-lg font-bold">Sentinel AI</span>
            </div>
          </div>

          <h1 className="font-display text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mb-8">
            Sign in to your account to continue
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--critical-subtle)] border border-[var(--critical)]/30 text-[var(--critical)] text-sm rounded-lg px-4 py-3 mb-4"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <Input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<Mail size={16} />}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  icon={<Lock size={16} />}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-tertiary)] hover:text-[var(--foreground)]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border)] text-[var(--brand)] focus:ring-[var(--brand)]"
                />
                <span className="text-sm text-[var(--foreground-secondary)]">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-[var(--brand)] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full group" size="lg" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <p className="text-sm text-[var(--foreground-secondary)] text-center mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[var(--brand)] hover:underline font-medium">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-[var(--background-secondary)] items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-subtle opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-glow)] to-[var(--cyber-glow)]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 text-center max-w-md px-8"
        >
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-[var(--brand)] mx-auto mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-3">
            AI-Powered Security
          </h2>
          <p className="text-[var(--foreground-secondary)] leading-relaxed">
            Analyze your documents with advanced AI agents to detect vulnerabilities,
            ensure compliance, and protect your enterprise.
          </p>
          <div className="flex items-center justify-center gap-6 mt-8 text-xs text-[var(--foreground-tertiary)]">
            <span className="flex items-center gap-1">🔒 SOC 2</span>
            <span className="flex items-center gap-1">🛡️ GDPR</span>
            <span className="flex items-center gap-1">✅ HIPAA</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
