"use client";

import * as React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Button,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    cn,
} from "@digibit/ui/components";
import {
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    Search,
    Edit,
    Trash2,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

export interface Column<T> {
    key: keyof T | string;
    header: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

export interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyField: keyof T;
    isLoading?: boolean;
    emptyMessage?: string;
    emptyDescription?: string;
    searchable?: boolean;
    searchPlaceholder?: string;
    searchFields?: (keyof T)[];
    pageSize?: number;
    pageSizeOptions?: number[];
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    actions?: (item: T) => React.ReactNode;
    className?: string;
}

type SortDirection = "asc" | "desc" | null;

interface SortState {
    key: string | null;
    direction: SortDirection;
}

export function DataTable<T extends object>({
    columns,
    data,
    keyField,
    isLoading = false,
    emptyMessage = "No data found",
    emptyDescription = "There are no items to display at this time.",
    searchable = true,
    searchPlaceholder = "Search...",
    searchFields,
    pageSize: initialPageSize = 10,
    pageSizeOptions = [5, 10, 25, 50],
    onEdit,
    onDelete,
    actions,
    className,
}: DataTableProps<T>) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [sortState, setSortState] = React.useState<SortState>({
        key: null,
        direction: null,
    });
    const [currentPage, setCurrentPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(initialPageSize);

    // Filter data based on search query
    const filteredData = React.useMemo(() => {
        if (!searchQuery.trim()) return data;

        const query = searchQuery.toLowerCase();
        const fieldsToSearch = searchFields || (columns.map((col) => col.key) as (keyof T)[]);

        return data.filter((item) =>
            fieldsToSearch.some((field) => {
                const value = item[field];
                if (value === null || value === undefined) return false;
                return String(value).toLowerCase().includes(query);
            })
        );
    }, [data, searchQuery, searchFields, columns]);

    // Sort data
    const sortedData = React.useMemo(() => {
        if (!sortState.key || !sortState.direction) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortState.key as keyof T];
            const bValue = b[sortState.key as keyof T];

            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            let comparison = 0;
            if (typeof aValue === "string" && typeof bValue === "string") {
                comparison = aValue.localeCompare(bValue);
            } else if (typeof aValue === "number" && typeof bValue === "number") {
                comparison = aValue - bValue;
            } else {
                comparison = String(aValue).localeCompare(String(bValue));
            }

            return sortState.direction === "desc" ? -comparison : comparison;
        });
    }, [filteredData, sortState]);

    // Paginate data
    const paginatedData = React.useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return sortedData.slice(startIndex, startIndex + pageSize);
    }, [sortedData, currentPage, pageSize]);

    const totalPages = Math.ceil(sortedData.length / pageSize);

    // Reset to first page when search or pageSize changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, pageSize]);

    const handleSort = (key: string) => {
        setSortState((prev) => {
            if (prev.key !== key) {
                return { key, direction: "asc" };
            }
            if (prev.direction === "asc") {
                return { key, direction: "desc" };
            }
            return { key: null, direction: null };
        });
    };

    const getSortIcon = (key: string) => {
        if (sortState.key !== key) {
            return <ChevronsUpDown className="h-4 w-4 text-zinc-400" />;
        }
        if (sortState.direction === "asc") {
            return <ChevronUp className="h-4 w-4 text-primary" />;
        }
        return <ChevronDown className="h-4 w-4 text-primary" />;
    };

    const hasActions = onEdit || onDelete || actions;

    // Loading skeleton
    if (isLoading) {
        return (
            <div className={cn("bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700", className)}>
                {searchable && (
                    <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
                        <div className="h-10 w-64 bg-zinc-200 dark:bg-zinc-700 rounded-lg animate-pulse" />
                    </div>
                )}
                <div className="p-4 space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 bg-zinc-100 dark:bg-zinc-700 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={cn("bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden", className)}>
            {/* Search and filters */}
            {searchable && (
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="relative w-full sm:w-64">
                            <Input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                leftIcon={<Search className="h-4 w-4" />}
                                className="h-10"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                            <span>Show</span>
                            <Select
                                value={String(pageSize)}
                                onValueChange={(value) => setPageSize(Number(value))}
                            >
                                <SelectTrigger className="w-[70px] h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {pageSizeOptions.map((size) => (
                                        <SelectItem key={size} value={String(size)}>
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span>entries</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-zinc-50 dark:bg-zinc-700/50">
                            {columns.map((column) => (
                                <TableHead
                                    key={String(column.key)}
                                    className={cn(
                                        "text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider",
                                        column.sortable && "cursor-pointer select-none hover:bg-zinc-100 dark:hover:bg-zinc-700",
                                        column.className
                                    )}
                                    onClick={column.sortable ? () => handleSort(String(column.key)) : undefined}
                                >
                                    <div className="flex items-center gap-2">
                                        {column.header}
                                        {column.sortable && getSortIcon(String(column.key))}
                                    </div>
                                </TableHead>
                            ))}
                            {hasActions && (
                                <TableHead className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right">
                                    Actions
                                </TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length + (hasActions ? 1 : 0)}
                                    className="h-40 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
                                            <MoreHorizontal className="h-6 w-6 text-zinc-400" />
                                        </div>
                                        <p className="text-zinc-600 dark:text-zinc-300 font-medium">
                                            {emptyMessage}
                                        </p>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                            {emptyDescription}
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((item) => (
                                <TableRow
                                    key={String(item[keyField])}
                                    className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors"
                                >
                                    {columns.map((column) => (
                                        <TableCell
                                            key={String(column.key)}
                                            className={cn("text-sm text-zinc-900 dark:text-white", column.className)}
                                        >
                                            {column.render
                                                ? column.render(item)
                                                : String(item[column.key as keyof T] ?? "")}
                                        </TableCell>
                                    ))}
                                    {hasActions && (
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {actions && actions(item)}
                                                {onEdit && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onEdit(item)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Edit className="h-4 w-4 text-zinc-500 hover:text-primary" />
                                                    </Button>
                                                )}
                                                {onDelete && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onDelete(item)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-zinc-500 hover:text-red-500" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {sortedData.length > 0 && (
                <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        Showing {((currentPage - 1) * pageSize) + 1} to{" "}
                        {Math.min(currentPage * pageSize, sortedData.length)} of{" "}
                        {sortedData.length} results
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <div className="flex items-center gap-1">
                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                let pageNum: number;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <Button
                                        key={pageNum}
                                        variant={currentPage === pageNum ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setCurrentPage(pageNum)}
                                        className="h-8 w-8 p-0"
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DataTable;
