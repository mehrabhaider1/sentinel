import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending password reset
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--brand)]">
            <Shield className="w-7 h-7 text-white" />
          </div>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <CheckCircle2 size={48} className="text-[var(--brand)] mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold mb-2">Check your email</h1>
            <p className="text-sm text-[var(--foreground-secondary)] mb-6">
              We've sent a password reset link to <strong className="text-[var(--foreground)]">{email}</strong>
            </p>
            <Button variant="outline" onClick={() => setSent(false)}>
              Send again
            </Button>
          </motion.div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold text-center mb-1">Forgot password?</h1>
            <p className="text-sm text-[var(--foreground-secondary)] text-center mb-8">
              No worries, we'll send you a reset link.
            </p>

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

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>

            <Link
              to="/login"
              className="flex items-center justify-center gap-1.5 text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] mt-6 transition-colors"
            >
              <ArrowLeft size={14} />
              Back to sign in
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
