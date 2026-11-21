import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@we-arrange/database/types";

export interface TableQueryResult {
  data?: unknown;
  error?: { code?: string; message?: string } | null;
  count?: number | null;
}

export type QueryHandler = (
  table: string,
  op: "select" | "insert" | "update" | "upsert" | "delete",
  state: {
    filters: Array<{ method: string; args: unknown[] }>;
    payload?: unknown;
    columns?: string;
  }
) => TableQueryResult | Promise<TableQueryResult>;

export function createMockSupabaseClient(options: {
  user?: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null;
  authError?: { message: string; status?: number } | null;
  onQuery?: QueryHandler;
  authMocks?: Partial<{
    signUp: (...args: unknown[]) => unknown;
    signInWithPassword: (...args: unknown[]) => unknown;
    signOut: (...args: unknown[]) => unknown;
    refreshSession: (...args: unknown[]) => unknown;
    resetPasswordForEmail: (...args: unknown[]) => unknown;
    exchangeCodeForSession: (...args: unknown[]) => unknown;
    updateUser: (...args: unknown[]) => unknown;
    verifyOtp: (...args: unknown[]) => unknown;
  }>;
}): SupabaseClient<Database> {
  const queryHandler: QueryHandler =
    options.onQuery ?? (() => ({ data: [], error: null, count: 0 }));

  const makeBuilder = (table: string) => {
    const state: {
      op: "select" | "insert" | "update" | "upsert" | "delete";
      filters: Array<{ method: string; args: unknown[] }>;
      payload?: unknown;
      columns?: string;
    } = {
      op: "select",
      filters: [],
    };

    const exec = async () => queryHandler(table, state.op, state);

    const builder: Record<string, unknown> = {
      select: (columns?: string) => {
        state.columns = columns;
        return builder;
      },
      insert: (payload: unknown) => {
        state.op = "insert";
        state.payload = payload;
        return builder;
      },
      update: (payload: unknown) => {
        state.op = "update";
        state.payload = payload;
        return builder;
      },
      upsert: (payload: unknown) => {
        state.op = "upsert";
        state.payload = payload;
        return builder;
      },
      delete: () => {
        state.op = "delete";
        return builder;
      },
      maybeSingle: async () => {
        const res = await exec();
        if (Array.isArray(res.data)) {
          return { data: res.data[0] ?? null, error: res.error ?? null };
        }
        return { data: res.data ?? null, error: res.error ?? null };
      },
      single: async () => {
        const res = await exec();
        if (res.error) return { data: null, error: res.error };
        const row = Array.isArray(res.data) ? res.data[0] : res.data;
        if (!row) {
          return { data: null, error: { code: "PGRST116", message: "0 rows" } };
        }
        return { data: row, error: null };
      },
      then: (resolve: (val: TableQueryResult) => unknown, reject: (err: unknown) => unknown) =>
        Promise.resolve(exec()).then(resolve, reject),
    };

    for (const m of [
      "eq",
      "neq",
      "gt",
      "gte",
      "lt",
      "lte",
      "like",
      "ilike",
      "in",
      "is",
      "or",
      "not",
      "contains",
      "order",
      "limit",
      "range",
    ]) {
      builder[m] = (...args: unknown[]) => {
        state.filters.push({ method: m, args });
        return builder;
      };
    }

    return builder;
  };

  return {
    from: (table: string) => makeBuilder(table),
    auth: {
      getUser: async () => ({
        data: { user: options.user ?? null },
        error: options.authError ?? null,
      }),
      signUp: async (...args: unknown[]) =>
        options.authMocks?.signUp
          ? options.authMocks.signUp(...args)
          : { data: { user: { id: "u-new" }, session: null }, error: null },
      signInWithPassword: async (...args: unknown[]) =>
        options.authMocks?.signInWithPassword
          ? options.authMocks.signInWithPassword(...args)
          : { data: { user: options.user ?? { id: "u-1" }, session: {} }, error: null },
      signOut: async (...args: unknown[]) =>
        options.authMocks?.signOut
          ? options.authMocks.signOut(...args)
          : { error: null },
      refreshSession: async (...args: unknown[]) =>
        options.authMocks?.refreshSession
          ? options.authMocks.refreshSession(...args)
          : { data: { session: { expires_at: 9999999999 }, user: options.user ?? null }, error: null },
      resetPasswordForEmail: async (...args: unknown[]) =>
        options.authMocks?.resetPasswordForEmail
          ? options.authMocks.resetPasswordForEmail(...args)
          : { data: {}, error: null },
      exchangeCodeForSession: async (...args: unknown[]) =>
        options.authMocks?.exchangeCodeForSession
          ? options.authMocks.exchangeCodeForSession(...args)
          : { data: {}, error: null },
      updateUser: async (...args: unknown[]) =>
        options.authMocks?.updateUser
          ? options.authMocks.updateUser(...args)
          : { data: { user: options.user ?? { id: "u-1" } }, error: null },
      verifyOtp: async (...args: unknown[]) =>
        options.authMocks?.verifyOtp
          ? options.authMocks.verifyOtp(...args)
          : { data: { user: options.user ?? { id: "u-1" } }, error: null },
    },
  } as unknown as SupabaseClient<Database>;
}

