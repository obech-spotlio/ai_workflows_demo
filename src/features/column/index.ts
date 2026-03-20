// Types & schemas
// Note: `Column` entity type is intentionally not re-exported here to avoid
// name collision with the `Column` component below. Import it directly from
// `@/features/board/types/index` or `@/features/column/types` when needed.
export type {
  CreateColumnInput,
  UpdateColumnInput,
} from "@/features/column/types";
export {
  ColumnSchema,
  createColumnSchema,
  updateColumnSchema,
} from "@/features/column/types";

// Service
export * as columnService from "@/features/column/column.service";

// Hook
export { useColumns } from "@/features/column/hooks/use-columns";

// Components
export { Column } from "@/features/column/components/column";
export { ColumnHeader } from "@/features/column/components/column-header";
export { AddColumn } from "@/features/column/components/add-column";
