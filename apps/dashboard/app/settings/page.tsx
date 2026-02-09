"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/components/toast";
import {
    Input,
    Button,
    Textarea,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@digibit/ui/components";
import {
    Save,
    Globe,
    Mail,
    Bell,
    Shield,
    Palette,
    Database,
    Key,
    User,
    Building,
} from "lucide-react";

interface SettingsSection {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}

const sections: SettingsSection[] = [
    {
        id: "general",
        title: "General Settings",
        description: "Basic configuration for the dashboard",
        icon: <Globe className="h-5 w-5" />,
    },
    {
        id: "company",
        title: "Company Information",
        description: "Manage company details and branding",
        icon: <Building className="h-5 w-5" />,
    },
    {
        id: "notifications",
        title: "Notifications",
        description: "Configure email and push notifications",
        icon: <Bell className="h-5 w-5" />,
    },
    {
        id: "security",
        title: "Security",
        description: "Security and authentication settings",
        icon: <Shield className="h-5 w-5" />,
    },
    {
        id: "api",
        title: "API Configuration",
        description: "Manage API keys and integrations",
        icon: <Key className="h-5 w-5" />,
    },
];

export default function SettingsPage() {
    const { success, error } = useToast();
    const [activeSection, setActiveSection] = React.useState("general");
    const [isLoading, setIsLoading] = React.useState(false);

    // Settings state
    const [settings, setSettings] = React.useState({
        // General
        siteName: "Global Digitalbit Dashboard",
        siteUrl: "https://dashboard.globaldigibit.com",
        timezone: "UTC",
        language: "en",

        // Company
        companyName: "Global Digitalbit Limited",
        companyEmail: "connect@globaldigibit.com",
        companyPhone: "+971 4 123 4567",
        companyAddress: "Dubai, United Arab Emirates",

        // Notifications
        emailNotifications: true,
        newContactAlert: true,
        weeklyReport: true,
        systemAlerts: true,

        // Security
        twoFactorEnabled: false,
        sessionTimeout: "30",
        ipWhitelist: "",

        // API
        apiKey: "sk_live_xxxxxxxxxxxxxxxxxxxxx",
        webhookUrl: "",
        rateLimitPerMinute: "100",
    });

    const handleChange = (key: string, value: string | boolean) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            success("Settings saved", "Your settings have been updated successfully.");
        } catch {
            error("Error", "Failed to save settings. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderSection = () => {
        switch (activeSection) {
            case "general":
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Site Name
                            </label>
                            <Input
                                value={settings.siteName}
                                onChange={(e) => handleChange("siteName", e.target.value)}
                                placeholder="Dashboard name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Site URL
                            </label>
                            <Input
                                value={settings.siteUrl}
                                onChange={(e) => handleChange("siteUrl", e.target.value)}
                                placeholder="https://dashboard.example.com"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Timezone
                                </label>
                                <Select
                                    value={settings.timezone}
                                    onValueChange={(value) => handleChange("timezone", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="UTC">UTC</SelectItem>
                                        <SelectItem value="Asia/Dubai">Dubai (GMT+4)</SelectItem>
                                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                                        <SelectItem value="America/New_York">New York (EST)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Language
                                </label>
                                <Select
                                    value={settings.language}
                                    onValueChange={(value) => handleChange("language", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="ar">Arabic</SelectItem>
                                        <SelectItem value="fr">French</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                );

            case "company":
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Company Name
                            </label>
                            <Input
                                value={settings.companyName}
                                onChange={(e) => handleChange("companyName", e.target.value)}
                                placeholder="Your company name"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Email
                                </label>
                                <Input
                                    type="email"
                                    value={settings.companyEmail}
                                    onChange={(e) => handleChange("companyEmail", e.target.value)}
                                    placeholder="info@company.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Phone
                                </label>
                                <Input
                                    value={settings.companyPhone}
                                    onChange={(e) => handleChange("companyPhone", e.target.value)}
                                    placeholder="+1 234 567 890"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Address
                            </label>
                            <Textarea
                                value={settings.companyAddress}
                                onChange={(e) => handleChange("companyAddress", e.target.value)}
                                placeholder="Company address"
                                rows={3}
                            />
                        </div>
                    </div>
                );

            case "notifications":
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            {[
                                { key: "emailNotifications", label: "Email Notifications", description: "Receive important updates via email" },
                                { key: "newContactAlert", label: "New Contact Alerts", description: "Get notified when someone submits a contact form" },
                                { key: "weeklyReport", label: "Weekly Reports", description: "Receive weekly summary reports" },
                                { key: "systemAlerts", label: "System Alerts", description: "Get notified about system status changes" },
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-zinc-900 dark:text-white">{item.label}</p>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{item.description}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleChange(item.key, !settings[item.key as keyof typeof settings])}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${settings[item.key as keyof typeof settings]
                                                ? "bg-primary"
                                                : "bg-zinc-300 dark:bg-zinc-600"
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings[item.key as keyof typeof settings] ? "translate-x-6" : ""
                                                }`}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case "security":
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                            <div>
                                <p className="font-medium text-zinc-900 dark:text-white">Two-Factor Authentication</p>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">Add an extra layer of security to your account</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleChange("twoFactorEnabled", !settings.twoFactorEnabled)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${settings.twoFactorEnabled
                                        ? "bg-primary"
                                        : "bg-zinc-300 dark:bg-zinc-600"
                                    }`}
                            >
                                <span
                                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.twoFactorEnabled ? "translate-x-6" : ""
                                        }`}
                                />
                            </button>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Session Timeout (minutes)
                            </label>
                            <Select
                                value={settings.sessionTimeout}
                                onValueChange={(value) => handleChange("sessionTimeout", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15">15 minutes</SelectItem>
                                    <SelectItem value="30">30 minutes</SelectItem>
                                    <SelectItem value="60">1 hour</SelectItem>
                                    <SelectItem value="120">2 hours</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                IP Whitelist
                            </label>
                            <Textarea
                                value={settings.ipWhitelist}
                                onChange={(e) => handleChange("ipWhitelist", e.target.value)}
                                placeholder="Enter IP addresses (one per line)"
                                rows={4}
                            />
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Leave empty to allow all IP addresses
                            </p>
                        </div>
                    </div>
                );

            case "api":
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                API Key
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    type="password"
                                    value={settings.apiKey}
                                    onChange={(e) => handleChange("apiKey", e.target.value)}
                                    className="font-mono"
                                    readOnly
                                />
                                <Button variant="outline" onClick={() => success("API Key copied", "API key has been copied to clipboard.")}>
                                    Copy
                                </Button>
                                <Button variant="outline">Regenerate</Button>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Keep your API key secure. Do not share it publicly.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Webhook URL
                            </label>
                            <Input
                                value={settings.webhookUrl}
                                onChange={(e) => handleChange("webhookUrl", e.target.value)}
                                placeholder="https://your-server.com/webhook"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Rate Limit (requests per minute)
                            </label>
                            <Select
                                value={settings.rateLimitPerMinute}
                                onValueChange={(value) => handleChange("rateLimitPerMinute", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="60">60 requests/min</SelectItem>
                                    <SelectItem value="100">100 requests/min</SelectItem>
                                    <SelectItem value="200">200 requests/min</SelectItem>
                                    <SelectItem value="500">500 requests/min</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-4">
                            <h4 className="font-medium text-zinc-900 dark:text-white mb-2">API Documentation</h4>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                                Access the full API documentation to integrate with your applications.
                            </p>
                            <a
                                href="https://docs.globaldigibit.com/api"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline"
                            >
                                View API Documentation &rarr;
                            </a>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Settings"
                description="Manage your dashboard configuration and preferences"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Settings" },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <nav className="lg:w-64 flex-shrink-0">
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeSection === section.id
                                            ? "bg-primary/10 text-primary border-l-2 border-primary"
                                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                                        }`}
                                >
                                    {section.icon}
                                    <span className="font-medium text-sm">{section.title}</span>
                                </button>
                            ))}
                        </div>
                    </nav>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
                                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                    {sections.find((s) => s.id === activeSection)?.title}
                                </h2>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    {sections.find((s) => s.id === activeSection)?.description}
                                </p>
                            </div>
                            <div className="p-6">
                                {renderSection()}
                            </div>
                            <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-end">
                                <Button onClick={handleSave} isLoading={isLoading}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
