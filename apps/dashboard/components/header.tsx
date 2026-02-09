"use client";

import * as React from "react";
import { ThemeToggle } from "./theme-toggle";
import { UserNav } from "./user-nav";
import { Menu } from "lucide-react";
import { Button } from "@ktblog/ui/components";

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-primary/20 dark:border-primary/20 bg-background px-6 shadow-sm">
            <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={onMenuClick}
            >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
            </Button>
            <div className="flex flex-1 items-center justify-end gap-4">
                <ThemeToggle />
                <UserNav />
            </div>
        </header>
    );
}
