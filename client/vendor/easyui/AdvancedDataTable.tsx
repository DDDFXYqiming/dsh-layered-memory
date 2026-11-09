// Adapted from https://github.com/Surajmaurya1/easyui/blob/main/src/components/ui/AdvancedDataTable.tsx
// MIT License, Copyright (c) 2026 Suraj Maurya. See ./LICENSE
//
// Adaptation: the upstream component is reused with its behaviour intact —
// global search across every field, three-state column sorting, expandable
// sub-rows driven by `renderSubComponent`, row selection with select-all and
// indeterminate state, faceted filters, column visibility, pagination, and a
// table/cards view mode that switches automatically below 640px. The upstream
// spring tokens are reused verbatim.
//
// Beyond the Tailwind → DSH-token class replacement and the `cn` helper swap,
// this vendored copy adds optional caller hooks for the parts the component
// cannot know about. All of them are optional — omitting them keeps the
// upstream behaviour:
//   * `searchPlaceholder: null` hides the built-in search field, for callers
//     that own the search semantics (e.g. a server-side query).
//   * `hidePagination` suppresses the internal pager and renders every loaded
//     row, for callers that paginate on the server.
//   * `contentProps` carries the empty/error content interface:
//     `emptyTitle`, `emptyDescription` (null suppresses the paragraph),
//     `emptyActionLabel` (null hides the action button), `onClearFilters`
//     (the caller's reset wins over the component's own client-side reset),
//     `errorTitle` (null hides the heading), `errorDetail` (undefined falls
//     back to the raw error text, null hides the detail) and
//     `errorDetailLabel` (the collapsed technical-detail disclosure).

import React, { useState, useEffect, useMemo, createContext, useContext } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
	ChevronDown,
	ChevronUp,
	ChevronsUpDown,
	Search,
	X,
	SlidersHorizontal,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	Trash2,
	Download,
	AlertCircle,
	LayoutGrid,
	List,
} from "lucide-react";
import { cn } from "./utils";

// =============================================================================
// DESIGN SYSTEM CONSTANTS & SPRING TOKENS
// =============================================================================

const SPRING_PHYSICS = {
	type: "spring" as const,
	stiffness: 300,
	damping: 32,
	mass: 0.6,
};

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export type SortDirection = "asc" | "desc" | null;
export type DataTableViewMode = "auto" | "table" | "cards";

export interface ColumnDef<T> {
	id: string;
	header: string;
	accessorKey?: keyof T;
	accessorFn?: (row: T) => any;
	cell?: (info: { row: T; value: any }) => React.ReactNode;
	sortable?: boolean;
	filterable?: boolean;
	filterOptions?: Array<{ label: string; value: string }>;
	width?: string;
	align?: "left" | "center" | "right";
	priority?: "high" | "medium" | "low";
}

export interface DataTableContextValue<T = any> {
	data: T[];
	columns: ColumnDef<T>[];
	getRowId: (row: T, index: number) => string;
	// View Mode
	viewMode: DataTableViewMode;
	setViewMode: (mode: DataTableViewMode) => void;
	// Sorting
	sortColumn: string | null;
	sortDirection: SortDirection;
	handleSort: (columnId: string) => void;
	// Searching & Filtering
	searchTerm: string;
	setSearchTerm: (term: string) => void;
	activeFilters: Record<string, string[]>;
	toggleFilter: (columnId: string, value: string) => void;
	clearFilters: () => void;
	/** Set when the caller owns the reset — e.g. it clears a server-side query
	 *  the component cannot see. Consumers prefer it over `clearFilters`. */
	onClearFilters?: () => void;
	// Selection
	selectedRowIds: Set<string>;
	toggleRowSelection: (id: string) => void;
	toggleSelectAll: () => void;
	isAllSelected: boolean;
	isIndeterminate: boolean;
	// Expandable Rows
	expandedRowIds: Set<string>;
	toggleRowExpansion: (id: string) => void;
	renderSubComponent?: (row: T) => React.ReactNode;
	// Column Visibility
	hiddenColumnIds: Set<string>;
	toggleColumnVisibility: (columnId: string) => void;
	// Pagination
	currentPage: number;
	setCurrentPage: (page: number) => void;
	pageSize: number;
	setPageSize: (size: number) => void;
	totalPages: number;
	totalFilteredCount: number;
	paginatedData: T[];
	// Loading & State
	isLoading?: boolean;
	error?: string | null;
	accentColor?: string;
}

const DataTableContext = createContext<DataTableContextValue | null>(null);

export function useDataTable<T = any>() {
	const ctx = useContext(DataTableContext);
	if (!ctx) {
		throw new Error("useDataTable must be used within <DataTable>");
	}
	return ctx as DataTableContextValue<T>;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

export interface DataTableToolbarProps {
	title?: string;
	/** `null` hides the built-in search field (callers that own the search
	 *  semantics — e.g. server-side query — pass null explicitly). */
	searchPlaceholder?: string | null;
	onBulkDelete?: (selectedIds: string[]) => void;
	onBulkExport?: (selectedIds: string[]) => void;
	className?: string;
}

export const DataTableToolbar: React.FC<DataTableToolbarProps> = ({
	title,
	searchPlaceholder = "Search...",
	onBulkDelete,
	onBulkExport,
	className,
}) => {
	const {
		searchTerm,
		setSearchTerm,
		selectedRowIds,
		columns,
		hiddenColumnIds,
		toggleColumnVisibility,
		viewMode,
		setViewMode,
	} = useDataTable();

	const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);
	const selectedCount = selectedRowIds.size;
	const shouldReduceMotion = useReducedMotion();

	return (
		<div className={cn("lm-eui-dt-toolbar", className)}>
			<div className="lm-eui-dt-toolbar-row">
				{/* Title or Selection Counter */}
				<div className="lm-eui-dt-toolbar-lead">
					{title && <h3 className="lm-eui-dt-title">{title}</h3>}
					{selectedCount > 0 && (
						<span className="lm-eui-dt-selected-count">
							<span className="lm-eui-dt-selected-dot" />
							{selectedCount} selected
						</span>
					)}
				</div>

				{/* Global Search + Controls */}
				<div className="lm-eui-dt-toolbar-controls">
					{/* Search Input — omitted when the caller passes null */}
					{searchPlaceholder !== null && (
						<div className="lm-eui-dt-search-wrap">
							<Search className="lm-eui-dt-search-icon" />
							<input
								type="text"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder={searchPlaceholder ?? undefined}
								aria-label={searchPlaceholder ?? undefined}
								className="lm-eui-dt-search"
							/>
							{searchTerm && (
								<button
									type="button"
									onClick={() => setSearchTerm("")}
									className="lm-eui-dt-search-clear"
									aria-label="Clear search"
								>
									<X className="lm-eui-icon" />
								</button>
							)}
						</div>
					)}

					{/* View Mode Switcher */}
					<motion.button
						type="button"
						whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
						onClick={() => setViewMode(viewMode === "cards" ? "table" : "cards")}
						className="lm-eui-dt-icon-btn"
						title={viewMode === "cards" ? "Switch to Table view" : "Switch to Cards view"}
						aria-label="Toggle view mode"
					>
						{viewMode === "cards" ? <List className="lm-eui-icon" /> : <LayoutGrid className="lm-eui-icon" />}
					</motion.button>

					{/* Column Visibility Menu */}
					<div className="lm-eui-dt-colmenu-wrap">
						<motion.button
							type="button"
							whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
							onClick={() => setIsColumnPickerOpen(!isColumnPickerOpen)}
							className="lm-eui-dt-icon-btn"
							title="Toggle columns"
							aria-label="Toggle visible columns"
							aria-expanded={isColumnPickerOpen}
						>
							<SlidersHorizontal className="lm-eui-icon" />
						</motion.button>

						{isColumnPickerOpen && (
							<div className="lm-eui-dt-colmenu">
								<div className="lm-eui-dt-colmenu-title">Columns</div>
								<div className="lm-eui-dt-colmenu-list">
									{columns.map((col) => {
										const isVisible = !hiddenColumnIds.has(col.id);
										return (
											<label key={col.id} className="lm-eui-dt-colmenu-item">
												<input
													type="checkbox"
													checked={isVisible}
													onChange={() => toggleColumnVisibility(col.id)}
													aria-label={`Toggle column ${col.header}`}
												/>
												<span className="lm-eui-dt-colmenu-name">{col.header}</span>
											</label>
										);
									})}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Bulk Action Bar */}
			<AnimatePresence>
				{selectedCount > 0 && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={SPRING_PHYSICS}
						className="lm-eui-dt-bulk-clip"
					>
						<div className="lm-eui-dt-bulk">
							<span className="lm-eui-dt-bulk-label">
								{selectedCount} item{selectedCount === 1 ? "" : "s"} selected:
							</span>
							<div className="lm-eui-dt-bulk-actions">
								{onBulkExport && (
									<motion.button
										type="button"
										whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
										onClick={() => onBulkExport(Array.from(selectedRowIds))}
										className="lm-eui-dt-bulk-btn"
									>
										<Download className="lm-eui-icon" />
										<span>Export</span>
									</motion.button>
								)}
								{onBulkDelete && (
									<motion.button
										type="button"
										whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
										onClick={() => onBulkDelete(Array.from(selectedRowIds))}
										className="lm-eui-dt-bulk-btn is-danger"
									>
										<Trash2 className="lm-eui-icon" />
										<span>Delete</span>
									</motion.button>
								)}
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export interface DataTableFiltersProps {
	className?: string;
}

export const DataTableFilters: React.FC<DataTableFiltersProps> = ({ className }) => {
	const { columns, activeFilters, toggleFilter, clearFilters, onClearFilters } = useDataTable();
	const resetFilters = onClearFilters ?? clearFilters;

	const filterableColumns = columns.filter((c) => c.filterable && c.filterOptions && c.filterOptions.length > 0);
	const activeCount = Object.values(activeFilters).reduce((sum, vals) => sum + vals.length, 0);

	if (filterableColumns.length === 0) return null;

	return (
		<div className={cn("lm-eui-dt-filters", className)}>
			<span className="lm-eui-dt-filters-label">Filters:</span>

			{filterableColumns.map((col) => {
				const selectedValues = activeFilters[col.id] || [];
				return (
					<div key={col.id} className="lm-eui-dt-filter-group">
						<span className="lm-eui-dt-filter-label">{col.header}:</span>
						{col.filterOptions?.map((opt) => {
							const isSelected = selectedValues.includes(opt.value);
							return (
								<button
									key={opt.value}
									type="button"
									aria-pressed={isSelected}
									onClick={() => toggleFilter(col.id, opt.value)}
									className={cn("lm-eui-dt-filter-chip", isSelected && "is-on")}
								>
									{opt.label}
								</button>
							);
						})}
					</div>
				);
			})}

			{activeCount > 0 && (
				<button type="button" onClick={resetFilters} className="lm-eui-dt-filter-reset">
					Reset ({activeCount})
				</button>
			)}
		</div>
	);
};

export interface DataTableContentProps {
	className?: string;
	emptyTitle?: string;
	/** `null` or an empty string suppresses the descriptive paragraph
	 *  (the upstream default is a long English sentence). */
	emptyDescription?: string | null;
	/** Label of the empty-state action. `null` hides the button entirely. */
	emptyActionLabel?: string | null;
	/** When provided the caller owns the reset — e.g. it clears a server-side
	 *  query that the component cannot see. Falls back to the component's own
	 *  client-side filter reset when absent. */
	onClearFilters?: () => void;
	/** Short error heading. `null` hides the heading. */
	errorTitle?: string | null;
	/** Technical detail, collapsed behind a disclosure. `undefined` falls back
	 *  to the raw error text; `null` hides the detail entirely. */
	errorDetail?: string | null;
	/** Label of the "show detail" disclosure. */
	errorDetailLabel?: string;
}

export const DataTableContent: React.FC<DataTableContentProps> = ({
	className,
	emptyTitle = "No matching records found",
	emptyDescription = "Try adjusting your search criteria or filters to locate what you are looking for.",
	emptyActionLabel = "Clear filters",
	onClearFilters,
	errorTitle = "Failed to load data",
	errorDetail,
	errorDetailLabel = "Details",
}) => {
	const {
		columns,
		paginatedData,
		hiddenColumnIds,
		getRowId,
		sortColumn,
		sortDirection,
		handleSort,
		selectedRowIds,
		toggleRowSelection,
		toggleSelectAll,
		isAllSelected,
		isIndeterminate,
		expandedRowIds,
		toggleRowExpansion,
		renderSubComponent,
		viewMode,
		isLoading,
		error,
		clearFilters,
		onClearFilters: parentClearFilters,
	} = useDataTable();

	const clearAction = onClearFilters ?? parentClearFilters ?? clearFilters;
	const detailText = errorDetail !== undefined ? errorDetail : error;

	const visibleColumns = useMemo(
		() => columns.filter((col) => !hiddenColumnIds.has(col.id)),
		[columns, hiddenColumnIds],
	);

	if (error) {
		return (
			<div className="lm-eui-dt-error">
				<AlertCircle className="lm-eui-dt-error-icon" />
				{errorTitle ? <p className="lm-eui-dt-error-title">{errorTitle}</p> : null}
				{detailText ? (
					<details className="lm-eui-dt-error-details">
						<summary className="lm-eui-dt-error-summary">{errorDetailLabel}</summary>
						<p className="lm-eui-dt-error-text">{detailText}</p>
					</details>
				) : null}
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="lm-eui-dt-skeleton">
				{[1, 2, 3, 4, 5].map((i) => (
					<div key={i} className="lm-eui-dt-skeleton-row" />
				))}
			</div>
		);
	}

	if (paginatedData.length === 0) {
		return (
			<div className="lm-eui-dt-empty">
				<div className="lm-eui-dt-empty-icon">
					<Search className="lm-eui-icon" />
				</div>
				<h4 className="lm-eui-dt-empty-title">{emptyTitle}</h4>
				{emptyDescription ? <p className="lm-eui-dt-empty-text">{emptyDescription}</p> : null}
				{emptyActionLabel ? (
					<button type="button" onClick={clearAction} className="lm-eui-dt-empty-action">
						{emptyActionLabel}
					</button>
				) : null}
			</div>
		);
	}

	// CARDS VIEW
	if (viewMode === "cards") {
		return (
			<div className={cn("lm-eui-dt-cards", className)}>
				{paginatedData.map((row, index) => {
					const rowId = getRowId(row, index);
					const isSelected = selectedRowIds.has(rowId);
					const isExpanded = expandedRowIds.has(rowId);
					const primaryCol = visibleColumns[0];
					const primaryVal = primaryCol?.accessorKey
						? row[primaryCol.accessorKey]
						: primaryCol?.accessorFn
							? primaryCol.accessorFn(row)
							: null;
					const remainingCols = visibleColumns.slice(1);

					return (
						<div
							key={rowId}
							className={cn("lm-eui-dt-card", isSelected && "is-selected")}
						>
							<div className="lm-eui-dt-card-head">
								<div className="lm-eui-dt-card-lead">
									<input
										type="checkbox"
										checked={isSelected}
										onChange={() => toggleRowSelection(rowId)}
										aria-label={`Select row ${rowId}`}
										className="lm-eui-dt-check"
									/>
									<span className="lm-eui-dt-card-title">
										{primaryCol?.cell
											? primaryCol.cell({ row, value: primaryVal })
											: String(primaryVal ?? "")}
									</span>
								</div>

								{renderSubComponent && (
									<button
										type="button"
										onClick={() => toggleRowExpansion(rowId)}
										className="lm-eui-dt-expand-btn"
										aria-expanded={isExpanded}
										aria-label={isExpanded ? "Collapse row details" : "Expand row details"}
									>
										<motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={SPRING_PHYSICS}>
											<ChevronRight className="lm-eui-icon" />
										</motion.div>
									</button>
								)}
							</div>

							{remainingCols.length > 0 && (
								<div className="lm-eui-dt-card-grid">
									{remainingCols.map((col) => {
										const value = col.accessorKey
											? row[col.accessorKey]
											: col.accessorFn
												? col.accessorFn(row)
												: null;
										return (
											<div key={col.id} className="lm-eui-dt-card-cell">
												<span className="lm-eui-dt-card-cell-label">{col.header}</span>
												<div className="lm-eui-dt-card-cell-value">
													{col.cell ? col.cell({ row, value }) : String(value ?? "—")}
												</div>
											</div>
										);
									})}
								</div>
							)}

							{renderSubComponent && isExpanded && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									transition={SPRING_PHYSICS}
									className="lm-eui-dt-card-detail"
								>
									{renderSubComponent(row)}
								</motion.div>
							)}
						</div>
					);
				})}
			</div>
		);
	}

	// DESKTOP TABLE VIEW
	return (
		<div className={cn("lm-eui-dt-table-wrap", className)}>
			<table className="lm-eui-dt-table">
				<thead>
					<tr className="lm-eui-dt-head-row">
						{/* Checkbox Column */}
						<th className="lm-eui-dt-th lm-eui-dt-th-check">
							<input
								type="checkbox"
								checked={isAllSelected}
								ref={(el) => {
									if (el) el.indeterminate = isIndeterminate;
								}}
								onChange={toggleSelectAll}
								aria-label="Select all rows"
								className="lm-eui-dt-check"
							/>
						</th>

						{/* Expand Column */}
						{renderSubComponent && <th className="lm-eui-dt-th lm-eui-dt-th-expand" />}

						{/* Data Columns */}
						{visibleColumns.map((col) => {
							const isSorted = sortColumn === col.id;
							return (
								<th
									key={col.id}
									style={{ width: col.width }}
									className={cn(
										"lm-eui-dt-th",
										col.align === "right" && "is-right",
										col.align === "center" && "is-center",
									)}
								>
									{col.sortable ? (
										<button
											type="button"
											onClick={() => handleSort(col.id)}
											aria-label={`Sort by ${col.header}`}
											className="lm-eui-dt-th-btn"
										>
											<span>{col.header}</span>
											{isSorted ? (
												sortDirection === "asc" ? (
													<ChevronUp className="lm-eui-icon lm-eui-dt-sort is-on" />
												) : (
													<ChevronDown className="lm-eui-icon lm-eui-dt-sort is-on" />
												)
											) : (
												<ChevronsUpDown className="lm-eui-icon lm-eui-dt-sort" />
											)}
										</button>
									) : (
										<span>{col.header}</span>
									)}
								</th>
							);
						})}
					</tr>
				</thead>

				<tbody>
					{paginatedData.map((row, index) => {
						const rowId = getRowId(row, index);
						const isSelected = selectedRowIds.has(rowId);
						const isExpanded = expandedRowIds.has(rowId);

						return (
							<React.Fragment key={rowId}>
								<tr className={cn("lm-eui-dt-row", isSelected && "is-selected")}>
									{/* Checkbox Cell */}
									<td className="lm-eui-dt-td lm-eui-dt-td-check">
										<input
											type="checkbox"
											checked={isSelected}
											onChange={() => toggleRowSelection(rowId)}
											aria-label={`Select row ${rowId}`}
											className="lm-eui-dt-check"
										/>
									</td>

									{/* Expand Toggle Cell */}
									{renderSubComponent && (
										<td className="lm-eui-dt-td lm-eui-dt-td-expand">
											<button
												type="button"
												onClick={() => toggleRowExpansion(rowId)}
												className="lm-eui-dt-expand-btn"
												aria-expanded={isExpanded}
												aria-label={isExpanded ? "Collapse row details" : "Expand row details"}
											>
												<motion.div
													animate={{ rotate: isExpanded ? 90 : 0 }}
													transition={SPRING_PHYSICS}
												>
													<ChevronRight className="lm-eui-icon" />
												</motion.div>
											</button>
										</td>
									)}

									{/* Data Cells */}
									{visibleColumns.map((col) => {
										const value = col.accessorKey
											? row[col.accessorKey]
											: col.accessorFn
												? col.accessorFn(row)
												: null;

										return (
											<td
												key={col.id}
												className={cn(
													"lm-eui-dt-td",
													col.align === "right" && "is-right",
													col.align === "center" && "is-center",
												)}
											>
												{col.cell ? col.cell({ row, value }) : String(value ?? "")}
											</td>
										);
									})}
								</tr>

								{/* Sub-component Expansion Drawer */}
								{renderSubComponent && isExpanded && (
									<tr className="lm-eui-dt-subrow">
										<td colSpan={visibleColumns.length + 2} className="lm-eui-dt-subrow-cell">
											<motion.div
												initial={{ opacity: 0, height: 0 }}
												animate={{ opacity: 1, height: "auto" }}
												exit={{ opacity: 0, height: 0 }}
												transition={SPRING_PHYSICS}
												className="lm-eui-dt-subrow-inner"
											>
												{renderSubComponent(row)}
											</motion.div>
										</td>
									</tr>
								)}
							</React.Fragment>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};

export interface DataTablePaginationProps {
	pageSizeOptions?: number[];
	className?: string;
}

export const DataTablePagination: React.FC<DataTablePaginationProps> = ({
	pageSizeOptions = [5, 10, 20, 50],
	className,
}) => {
	const {
		currentPage,
		setCurrentPage,
		pageSize,
		setPageSize,
		totalPages,
		totalFilteredCount,
	} = useDataTable();
	const shouldReduceMotion = useReducedMotion();

	const startRecord = totalFilteredCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
	const endRecord = Math.min(currentPage * pageSize, totalFilteredCount);

	return (
		<div className={cn("lm-eui-dt-pager", className)}>
			{/* Count Indicator */}
			<div className="lm-eui-dt-pager-count">
				Showing <span className="lm-eui-dt-pager-strong">{startRecord}–{endRecord}</span> of{" "}
				<span className="lm-eui-dt-pager-strong">{totalFilteredCount}</span> records
			</div>

			{/* Pagination Controls */}
			<div className="lm-eui-dt-pager-side">
				<div className="lm-eui-dt-pagesize-wrap">
					<span className="lm-eui-dt-pagesize-label">Rows per page:</span>
					<select
						value={pageSize}
						onChange={(e) => {
							setPageSize(Number(e.target.value));
							setCurrentPage(1);
						}}
						aria-label="Rows per page"
						className="lm-eui-dt-pagesize"
					>
						{pageSizeOptions.map((opt) => (
							<option key={opt} value={opt}>
								{opt}
							</option>
						))}
					</select>
				</div>

				<div className="lm-eui-dt-pager-nav">
					<motion.button
						type="button"
						whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
						onClick={() => setCurrentPage(1)}
						disabled={currentPage <= 1}
						aria-label="First page"
						className="lm-eui-dt-page-btn"
					>
						<ChevronsLeft className="lm-eui-icon" />
					</motion.button>
					<motion.button
						type="button"
						whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
						onClick={() => setCurrentPage(currentPage - 1)}
						disabled={currentPage <= 1}
						aria-label="Previous page"
						className="lm-eui-dt-page-btn"
					>
						<ChevronLeft className="lm-eui-icon" />
					</motion.button>

					<span className="lm-eui-dt-page-indicator">
						{currentPage}/{totalPages || 1}
					</span>

					<motion.button
						type="button"
						whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
						onClick={() => setCurrentPage(currentPage + 1)}
						disabled={currentPage >= totalPages}
						aria-label="Next page"
						className="lm-eui-dt-page-btn"
					>
						<ChevronRight className="lm-eui-icon" />
					</motion.button>
					<motion.button
						type="button"
						whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
						onClick={() => setCurrentPage(totalPages)}
						disabled={currentPage >= totalPages}
						aria-label="Last page"
						className="lm-eui-dt-page-btn"
					>
						<ChevronsRight className="lm-eui-icon" />
					</motion.button>
				</div>
			</div>
		</div>
	);
};

// =============================================================================
// ROOT COMPOUND CONTAINER & CONTEXT PROVIDER
// =============================================================================

export interface DataTableProps<T = any> {
	data: T[];
	columns: ColumnDef<T>[];
	getRowId?: (row: T, index: number) => string;
	defaultPageSize?: number;
	defaultViewMode?: DataTableViewMode;
	/** Set when the caller paginates on the server: the internal pager is
	 *  suppressed and every loaded row is rendered, so the footer count stays
	 *  the number of loaded rows instead of a second, nested pagination. */
	hidePagination?: boolean;
	/** Optional content interface for the empty and error states. Undefined
	 *  keeps the upstream behaviour. */
	contentProps?: DataTableContentProps;
	accentColor?: string;
	renderSubComponent?: (row: T) => React.ReactNode;
	isLoading?: boolean;
	error?: string | null;
	className?: string;
	children?: React.ReactNode;
}

export function DataTable<T = any>({
	data,
	columns,
	getRowId = (row: any, i) => row.id || `row-${i}`,
	defaultPageSize = 10,
	defaultViewMode = "auto",
	hidePagination = false,
	contentProps,
	accentColor,
	renderSubComponent,
	isLoading,
	error,
	className,
	children,
}: DataTableProps<T>) {
	const [viewMode, setViewMode] = useState<DataTableViewMode>(() => {
		if (defaultViewMode === "auto") {
			if (typeof window !== "undefined" && window.innerWidth < 640) {
				return "cards";
			}
			return "table";
		}
		return defaultViewMode;
	});

	useEffect(() => {
		if (defaultViewMode !== "auto") return;
		const handleResize = () => {
			setViewMode((prev) => {
				const isMobile = window.innerWidth < 640;
				if (isMobile && prev === "table") return "cards";
				if (!isMobile && prev === "cards") return "table";
				return prev;
			});
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [defaultViewMode]);

	const [sortColumn, setSortColumn] = useState<string | null>(null);
	const [sortDirection, setSortDirection] = useState<SortDirection>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
	const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
	const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());
	const [hiddenColumnIds, setHiddenColumnIds] = useState<Set<string>>(new Set());
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(defaultPageSize);

	const handleSort = (columnId: string) => {
		if (sortColumn !== columnId) {
			setSortColumn(columnId);
			setSortDirection("asc");
		} else if (sortDirection === "asc") {
			setSortDirection("desc");
		} else {
			setSortColumn(null);
			setSortDirection(null);
		}
	};

	const toggleFilter = (columnId: string, value: string) => {
		setActiveFilters((prev) => {
			const existing = prev[columnId] || [];
			const updated = existing.includes(value)
				? existing.filter((v) => v !== value)
				: [...existing, value];
			return { ...prev, [columnId]: updated };
		});
		setCurrentPage(1);
	};

	const clearFilters = () => {
		setActiveFilters({});
		setSearchTerm("");
		setCurrentPage(1);
	};

	const toggleRowSelection = (id: string) => {
		setSelectedRowIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const toggleRowExpansion = (id: string) => {
		setExpandedRowIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const toggleColumnVisibility = (columnId: string) => {
		setHiddenColumnIds((prev) => {
			const next = new Set(prev);
			if (next.has(columnId)) next.delete(columnId);
			else next.add(columnId);
			return next;
		});
	};

	const filteredData = useMemo(() => {
		let result = [...data];

		if (searchTerm.trim()) {
			const query = searchTerm.toLowerCase();
			result = result.filter((row: any) =>
				Object.values(row).some((val) =>
					typeof val === "string" || typeof val === "number"
						? String(val).toLowerCase().includes(query)
						: false,
				),
			);
		}

		Object.entries(activeFilters).forEach(([colId, filterVals]) => {
			if (filterVals.length === 0) return;
			const col = columns.find((c) => c.id === colId);
			if (!col) return;

			result = result.filter((row: any) => {
				const val = col.accessorKey
					? row[col.accessorKey]
					: col.accessorFn
						? col.accessorFn(row)
						: "";
				return filterVals.includes(String(val));
			});
		});

		if (sortColumn && sortDirection) {
			const col = columns.find((c) => c.id === sortColumn);
			if (col) {
				result.sort((a, b) => {
					const aVal = col.accessorKey
						? a[col.accessorKey]
						: col.accessorFn
							? col.accessorFn(a)
							: "";
					const bVal = col.accessorKey
						? b[col.accessorKey]
						: col.accessorFn
							? col.accessorFn(b)
							: "";

					if (aVal === bVal) return 0;
					if (aVal === null || aVal === undefined) return 1;
					if (bVal === null || bVal === undefined) return -1;

					const comparison = aVal > bVal ? 1 : -1;
					return sortDirection === "asc" ? comparison : -comparison;
				});
			}
		}

		return result;
	}, [data, columns, searchTerm, activeFilters, sortColumn, sortDirection]);

	const totalFilteredCount = filteredData.length;
	const totalPages = hidePagination ? 1 : Math.ceil(totalFilteredCount / pageSize);
	const paginatedData = useMemo(() => {
		if (hidePagination) return filteredData;
		const start = (currentPage - 1) * pageSize;
		return filteredData.slice(start, start + pageSize);
	}, [filteredData, currentPage, pageSize, hidePagination]);

	const currentPageIds = useMemo(
		() => paginatedData.map((row, i) => getRowId(row, i)),
		[paginatedData, getRowId],
	);
	const selectedOnCurrentPage = currentPageIds.filter((id) => selectedRowIds.has(id));
	const isAllSelected = currentPageIds.length > 0 && selectedOnCurrentPage.length === currentPageIds.length;
	const isIndeterminate = selectedOnCurrentPage.length > 0 && !isAllSelected;

	const toggleSelectAll = () => {
		setSelectedRowIds((prev) => {
			const next = new Set(prev);
			if (isAllSelected) {
				currentPageIds.forEach((id) => next.delete(id));
			} else {
				currentPageIds.forEach((id) => next.add(id));
			}
			return next;
		});
	};

	const contextValue: DataTableContextValue<T> = {
		data,
		columns,
		getRowId,
		viewMode,
		setViewMode,
		sortColumn,
		sortDirection,
		handleSort,
		searchTerm,
		setSearchTerm,
		activeFilters,
		toggleFilter,
		clearFilters,
		onClearFilters: contentProps?.onClearFilters,
		selectedRowIds,
		toggleRowSelection,
		toggleSelectAll,
		isAllSelected,
		isIndeterminate,
		expandedRowIds,
		toggleRowExpansion,
		renderSubComponent,
		hiddenColumnIds,
		toggleColumnVisibility,
		currentPage,
		setCurrentPage,
		pageSize,
		setPageSize,
		totalPages,
		totalFilteredCount,
		paginatedData,
		isLoading,
		error,
		accentColor,
	};

	return (
		<DataTableContext.Provider value={contextValue}>
			<div
				style={
					accentColor
						? ({ "--lm-eui-accent": accentColor } as React.CSSProperties)
						: undefined
				}
				className={cn("lm-eui-dt", className)}
			>
				{children || (
					<>
						<DataTableToolbar />
						<DataTableFilters />
						<DataTableContent {...contentProps} />
						{!hidePagination && <DataTablePagination />}
					</>
				)}
			</div>
		</DataTableContext.Provider>
	);
}

// =============================================================================
// STANDALONE CONVENIENCE COMPONENT
// =============================================================================

export interface AdvancedDataTableProps<T = any> extends DataTableProps<T> {
	title?: string;
	/** `null` hides the built-in search field. */
	searchPlaceholder?: string | null;
	onBulkDelete?: (selectedIds: string[]) => void;
	onBulkExport?: (selectedIds: string[]) => void;
}

export function AdvancedDataTable<T = any>({
	data,
	columns,
	title,
	searchPlaceholder,
	onBulkDelete,
	onBulkExport,
	hidePagination = false,
	contentProps,
	...props
}: AdvancedDataTableProps<T>) {
	return (
		<DataTable data={data} columns={columns} hidePagination={hidePagination} contentProps={contentProps} {...props}>
			<DataTableToolbar
				title={title}
				searchPlaceholder={searchPlaceholder}
				onBulkDelete={onBulkDelete}
				onBulkExport={onBulkExport}
			/>
			<DataTableFilters />
			<DataTableContent {...contentProps} />
			{!hidePagination && <DataTablePagination />}
		</DataTable>
	);
}
