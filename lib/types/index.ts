// Exercise Types
export * from "./exercise.types";

// Submission Types
export * from "./submission.types";

// User Types
export * from "./user.types";

// AG Grid Types
export interface CellRendererParams<T = unknown> {
  value: unknown;
  data: T;
  node: unknown;
  colDef: unknown;
  column: unknown;
  api: unknown;
  columnApi: unknown;
  context: unknown;
}
