"use client";

import { useAuthContext } from "../contexts/auth-context";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Button,
} from "@ktblog/ui/components";
import { User, LogOut } from "lucide-react";
import { useUser } from "../hooks/use-user";

export function UserNav() {
    const { logout } = useAuthContext();
    const userData = useUser();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-12 w-12 rounded-full bg-primary/10 border border-primary/20 dark:border-primary/20 hover:bg-primary/20">
                    <span className="text-primary font-semibold text-sm">
                        {userData?.initials || "AD"}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {userData?.displayName || "Admin User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {userData?.email || "admin@drkatangablog.com"}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
