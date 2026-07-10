import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Building2,
  Bell,
  Lock,
  Key,
  Save,
  Moon,
  Sun,
  Monitor,
  Shield,
  CheckCircle2,
  Copy,
  Clock,
  Globe,
  Palette,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { PageHeader } from "../components/shared/PageHeader";
import { useTheme } from "../context/ThemeContext";
import { cn } from "../lib/utils";

const tabs = [
  { id: "profile", label: "Profile", icon: User, desc: "Personal information" },
  { id: "organization", label: "Organization", icon: Building2, desc: "Company details" },
  { id: "notifications", label: "Notifications", icon: Bell, desc: "Alert preferences" },
  { id: "security", label: "Security", icon: Lock, desc: "Authentication & 2FA" },
  { id: "api", label: "API Settings", icon: Key, desc: "Integration keys" },
];

export default function SettingsPage() {
  const { resolved, setTheme, theme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Settings"
        description="Manage your account, organization, and preferences"
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-56 space-y-1 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                  activeTab === tab.id
                    ? "bg-[var(--brand-subtle)] text-[var(--brand)]"
                    : "text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                )}
              >
                <Icon size={16} className="shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm">{tab.label}</p>
                  <p className="text-[10px] text-[var(--foreground-tertiary)] truncate">{tab.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--cyber)] flex items-center justify-center text-white text-xl font-bold">
                      JD
                    </div>
                    <div>
                      <Button variant="outline" size="sm">Change Avatar</Button>
                      <p className="text-xs text-[var(--foreground-tertiary)] mt-1">JPG, PNG or GIF. 1MB max.</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Full Name</label>
                      <Input defaultValue="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Email</label>
                      <Input defaultValue="john@company.com" type="email" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Job Title</label>
                      <Input defaultValue="Security Engineer" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Phone</label>
                      <Input defaultValue="+1 (555) 123-4567" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button onClick={handleSave} className="gap-2">
                      {saved ? (
                        <><CheckCircle2 size={14} /> Saved!</>
                      ) : (
                        <><Save size={14} /> Save Changes</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "organization" && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Organization Settings</CardTitle>
                  <CardDescription>Manage your organization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Organization Name</label>
                      <Input defaultValue="TechCorp Inc." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Slug</label>
                      <Input defaultValue="techcorp" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Website</label>
                      <Input defaultValue="https://techcorp.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Industry</label>
                      <Input defaultValue="Technology" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button onClick={handleSave} className="gap-2">
                      {saved ? <><CheckCircle2 size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose what notifications you receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  {[
                    { label: "Critical Findings", desc: "Get notified for critical security findings", default: true },
                    { label: "Analysis Complete", desc: "When an AI analysis finishes processing", default: true },
                    { label: "Weekly Report", desc: "Weekly security summary via email", default: false },
                    { label: "Product Updates", desc: "New features and improvements", default: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--background-secondary)] transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-[var(--foreground-tertiary)]">{item.desc}</p>
                      </div>
                      <Switch defaultChecked={item.default} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>Update your password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Current Password</label>
                    <Input type="password" placeholder="Enter current password" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">New Password</label>
                      <Input type="password" placeholder="At least 8 characters" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
                      <Input type="password" placeholder="Confirm new password" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button onClick={handleSave}>Update Password</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>Add an extra layer of security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--background-secondary)]">
                    <div className="flex items-center gap-3">
                      <Lock size={16} className="text-[var(--low)]" />
                      <div>
                        <p className="text-sm font-medium">Authenticator App</p>
                        <p className="text-xs text-[var(--foreground-tertiary)]">Use an app like Google Authenticator</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--background-secondary)]">
                    <div className="flex items-center gap-3">
                      <Shield size={16} className="text-[var(--brand)]" />
                      <div>
                        <p className="text-sm font-medium">SMS Recovery</p>
                        <p className="text-xs text-[var(--foreground-tertiary)]">Backup codes via text message</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Session Management</CardTitle>
                  <CardDescription>Manage active sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--background-secondary)]">
                    <div className="flex items-center gap-3">
                      <Globe size={16} className="text-[var(--cyber)]" />
                      <div>
                        <p className="text-sm font-medium">Chrome on Windows</p>
                        <p className="text-xs text-[var(--foreground-tertiary)]">Current session &middot; United States</p>
                      </div>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-3 text-[var(--critical)]">
                    Revoke All Sessions
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "api" && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>Manage your API keys for integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Production Key", key: "sk_live_••••••••••••••••••••••••••", status: "Active" as const },
                    { name: "Development Key", key: "sk_test_••••••••••••••••••••••••••", status: "Active" as const },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="p-4 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Key size={14} className="text-[var(--brand)]" />
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <Badge variant="default">{item.status}</Badge>
                      </div>
                      <code className="text-xs font-mono text-[var(--foreground-tertiary)] block mb-3">
                        {item.key}
                      </code>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Copy size={12} /> Copy
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1 text-[var(--critical)]">
                          <Clock size={12} /> Regenerate
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1 text-[var(--critical)]">
                          Revoke
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="gap-2">
                    <Key size={14} /> Generate New Key
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Theme section - always visible */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette size={16} className="text-[var(--brand)]" />
                <CardTitle>Appearance</CardTitle>
              </div>
              <CardDescription>Customize your theme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {[
                  { id: "light", icon: Sun, label: "Light", desc: "Clean & bright" },
                  { id: "dark", icon: Moon, label: "Dark", desc: "Easy on the eyes" },
                  { id: "system", icon: Monitor, label: "System", desc: "Follows your OS" },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id as "light" | "dark" | "system")}
                      className={cn(
                        "flex flex-col items-center gap-2 px-6 py-4 rounded-xl text-sm font-medium transition-all border min-w-[100px]",
                        theme === t.id
                          ? "border-[var(--brand)] bg-[var(--brand-subtle)] text-[var(--brand)] ring-1 ring-[var(--brand)]"
                          : "border-[var(--border)] text-[var(--foreground-secondary)] hover:border-[var(--foreground-tertiary)] hover:bg-[var(--background-secondary)]"
                      )}
                    >
                      <Icon size={24} />
                      <span>{t.label}</span>
                      <span className="text-[10px] text-[var(--foreground-tertiary)]">{t.desc}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
