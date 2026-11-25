/**
 * PostgREST & SQL query sanitization helpers
 */

/**
 * Sanitizes input text before interpolating into Supabase PostgREST `.or(...)` or `.filter(...)` expressions.
 * Strips PostgREST AST delimiters: parentheses, commas, colons, quotes, backslashes, percent signs.
 * Prevents PostgREST query tree manipulation and filter evasion attacks.
 */
export function sanitizePostgrestFilterTerm(term: string): string {
  if (!term || typeof term !== "string") return "";
  // Strip PostgREST syntax characters: parentheses, commas, colons, quotes, backslashes, percent signs
  return term.replace(/[(),:;'"\\%]/g, " ").trim().replace(/\s+/g, " ");
}
