"use client";

import * as React from "react";
import { PageHeader, PageHeaderButton } from "@/components/page-header";
import { DataTable, Column } from "@/components/data-table";
import { useToast } from "@/components/toast";
import { Button, Input } from "@digibit/ui/components";
import { Plus, Languages, Save } from "lucide-react";

interface Translation {
    id: string;
    key: string;
    en: string;
    ar: string;
    fr: string;
    category: string;
}

const initialTranslations: Translation[] = [
    {
        id: "1",
        key: "common.welcome",
        en: "Welcome",
        ar: "أهلا بك",
        fr: "Bienvenue",
        category: "Common",
    },
    {
        id: "2",
        key: "common.save",
        en: "Save",
        ar: "حفظ",
        fr: "Enregistrer",
        category: "Common",
    },
    {
        id: "3",
        key: "auth.login",
        en: "Login",
        ar: "تسجيل الدخول",
        fr: "Connexion",
        category: "Auth",
    },
    {
        id: "4",
        key: "nav.dashboard",
        en: "Dashboard",
        ar: "لوحة القيادة",
        fr: "Tableau de bord",
        category: "Navigation",
    },
];

export default function TranslationsPage() {
    const { success } = useToast();
    const [translations, setTranslations] = React.useState<Translation[]>(initialTranslations);

    const columns: Column<Translation>[] = [
        {
            key: "key",
            header: "Translation Key",
            sortable: true,
            render: (item) => (
                <div className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded inline-block text-zinc-600 dark:text-zinc-300">
                    {item.key}
                </div>
            ),
        },
        {
            key: "en",
            header: "English (Default)",
            render: (item) => (
                <Input defaultValue={item.en} className="h-8 text-sm" />
            ),
        },
        {
            key: "ar",
            header: "Arabic",
            render: (item) => (
                <Input defaultValue={item.ar} className="h-8 text-sm text-right" dir="rtl" />
            ),
        },
        {
            key: "fr",
            header: "French",
            render: (item) => (
                <Input defaultValue={item.fr} className="h-8 text-sm" />
            ),
        },
    ];

    const handleSave = () => {
        success("Translations saved", "All translation changes have been published.");
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Translations"
                description="Manage diverse language content and localization"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Translations" },
                ]}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleSave}>
                            <Save className="h-4 w-4 mr-2" />
                            Save All
                        </Button>
                        <PageHeaderButton icon={<Plus className="h-4 w-4" />}>
                            Add Key
                        </PageHeaderButton>
                    </div>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <DataTable
                    columns={columns}
                    data={translations}
                    keyField="id"
                    searchPlaceholder="Search keys or content..."
                    searchFields={["key", "en", "ar", "fr"]}
                />
            </div>
        </div>
    );
}
