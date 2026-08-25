declare module 'newrelic' {
  export function addCustomAttribute(name: string, value: string | number | boolean): void;
  export function setTransactionName(name: string): void;
  export function noticeError(error: Error, attributes?: Record<string, unknown>): void;
  export function incrementMetric(name: string, count?: number): void;
  export function recordMetric(name: string, value: number): void;
  export function startWebTransaction(name: string, handler: () => Promise<unknown>): Promise<unknown>;
  export function startBackgroundTransaction(name: string, group: string, handler: () => Promise<unknown>): Promise<unknown>;
  export function getTransaction(): Transaction;
  export const config: Record<string, unknown>;

  interface Transaction {
    addCustomAttribute(name: string, value: string | number | boolean): void;
    end(): void;
  }
}
