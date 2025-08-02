declare module 'papaparse' {
  export interface UnparseConfig {
    columns?: string[];
    delimiter?: string;
    newline?: string;
    quotes?: boolean;
    quoteChar?: string;
    escapeChar?: string;
    header?: boolean;
  }

  export function unparse(input: any, config?: UnparseConfig): string;
}
