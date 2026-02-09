"use client";

import * as React from "react";
import {
    Button,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@ktblog/ui/components";
import { Modal } from "../modal";
import { UserStatus } from "../../types/user";

interface StatusModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentStatus: UserStatus;
    userName: string;
    onStatusChange: (status: UserStatus) => Promise<void>;
}

export function StatusModal({
    open,
    onOpenChange,
    currentStatus,
    userName,
    onStatusChange,
}: StatusModalProps) {
    const [selectedStatus, setSelectedStatus] = React.useState<UserStatus>(currentStatus);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        setSelectedStatus(currentStatus);
    }, [currentStatus, open]);

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onStatusChange(selectedStatus);
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to update status", error);
        } finally {
            setIsLoading(false);
        }
    };

    const statusOptions = [
        { label: "Active", value: UserStatus.ACTIVE, color: "text-emerald-600" },
        { label: "Inactive", value: UserStatus.INACTIVE, color: "text-zinc-500" },
        { label: "Pending", value: UserStatus.PENDING, color: "text-amber-500" },
        { label: "Suspended", value: UserStatus.SUSPENDED, color: "text-red-500" },
    ];

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title="Update User Status"
            description={`Change the account status for ${userName}`}
            size="sm"
            footer={
                <div className="flex gap-3 w-full">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading || selectedStatus === currentStatus}
                        isLoading={isLoading}
                        className="flex-1"
                    >
                        Update Status
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Status
                    </label>
                    <Select
                        value={selectedStatus}
                        onValueChange={(value) => setSelectedStatus(value as UserStatus)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    <span className={option.color}>{option.label}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {selectedStatus === UserStatus.SUSPENDED ? (
                        <span className="text-red-500 font-medium">Warning: Suspended users cannot log in to the dashboard.</span>
                    ) : (
                        "Updating the status will take effect immediately."
                    )}
                </p>
            </div>
        </Modal>
    );
}
