import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, User, Building2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    organization_name: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
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
            <span className="font-display text-lg font-bold">Sentinel AI</span>
          </div>

          <h1 className="font-display text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mb-8">
            Start your free security analysis journey
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
              <label className="block text-sm font-medium mb-1.5">Full Name</label>
              <Input
                type="text"
                placeholder="John Doe"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                required
                icon={<User size={16} />}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Work Email</label>
              <Input
                type="email"
                placeholder="name@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                icon={<Mail size={16} />}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Organization</label>
              <Input
                type="text"
                placeholder="Your Company Inc."
                value={form.organization_name}
                onChange={(e) => setForm({ ...form, organization_name: e.target.value })}
                required
                icon={<Building2 size={16} />}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
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
              <p className="text-xs text-[var(--foreground-tertiary)] mt-1">
                At least 8 characters
              </p>
            </div>

            <Button type="submit" className="w-full group" size="lg" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <p className="text-sm text-[var(--foreground-secondary)] text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-[var(--brand)] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 bg-[var(--background-secondary)] items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-subtle opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-glow)] to-[var(--cyber-glow)]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 text-center max-w-md px-8"
        >
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--brand)] to-[var(--cyber)] mx-auto mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-3">
            Start Your Security Journey
          </h2>
          <p className="text-[var(--foreground-secondary)] leading-relaxed">
            Join thousands of enterprises using Sentinel AI to protect their
            infrastructure and ensure compliance.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8 text-left">
            {["AI-Powered Analysis", "Real-time Monitoring", "Compliance Reports", "Risk Scoring"].map(
              (item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-[var(--foreground-secondary)]">
                  <Shield size={14} className="text-[var(--brand)] shrink-0" />
                  {item}
                </div>
              )
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
