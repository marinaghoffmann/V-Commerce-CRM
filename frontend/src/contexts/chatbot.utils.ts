import type { ChatMessage, ChatbotApiResponse, StoredChatState } from "./chatbot.types";

export const CHAT_STORAGE_KEY = "ai_chat_state_v1";
export const SESSION_TTL_MS = 30 * 60 * 1000;
export const MAX_PERSISTED_MESSAGES = 20;

export const DEFAULT_SUGGESTIONS = [
  "Quais clientes geraram mais receita este ano?",
  "Mostre o top 10 produtos mais vendidos.",
  "Qual o produto com maior ticket médio?",
  "Mostre os top 10 produtos com mais tickets, com a quantidade.",
];

export const PAGE_SUGGESTIONS: Record<string, string[]> = {
  dashboard: [
    "Qual o mês com maior receita total?",
    "Qual o estado com mais vendas totais?",
    "Qual o ano tem mais entregas no prazo?",
    "Qual categoria tem mais pedidos?",
  ],
  clientes: [
    "Qual o cliente com maior ticket médio?",
    "Qual a % de clientes inativos?",
    "Qual cliente fez mais pedidos?",
    "Qual cliente fez o pedido mais recente?",
  ],
  pedidos: [
    "Qual o pedido mais caro?",
    "Qual a % de pedidos aprovados?",
    "Qual o cliente que fez mais pedidos?",
    "Qual o produto com mais pedidos?",
  ],
  produtos: [
    "Qual o produto mais caro?",
    "Qual o top 3 produtos menos vendidos?",
    "Qual a categoria que tem mais produtos?",
    "Qual a produto tem mais receita?",
  ],
  suporte: [
    "Qual cliente abriu mais tickets?",
    "Qual a % de tickets abertos?",
    "Qual o mês que resolveu mais tickets?",
    "Qual a % de tickets fechados?",
  ],
};

export function getInitialSuggestionsForPage(pathSegment?: string): string[] {
  if (!pathSegment) return DEFAULT_SUGGESTIONS;
  const key = pathSegment.replace(/^\//, "").split("/")[0].toLowerCase();
  return PAGE_SUGGESTIONS[key] ?? DEFAULT_SUGGESTIONS;
}

const TABLE_LABELS: Record<string, string> = {
  tickets: "Tickets de suporte",
  clientes: "Clientes",
  pedidos: "Pedidos",
  produtos: "Produtos",
  itens_pedido: "Itens de pedido",
  orders: "Pedidos",
  customers: "Clientes",
  products: "Produtos",
  support_tickets: "Tickets de suporte",
};

function extractTablesFromSQL(sql: string): string[] {
  if (!sql) return [];

  const tableRegex = /(?:FROM|JOIN)\s+([`"[\w]+)/gi;
  const found = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = tableRegex.exec(sql)) !== null) {
    const raw = match[1].replace(/[`"\]]/g, "").toLowerCase();
    found.add(raw);
  }

  return Array.from(found).map(
    (tableName) =>
      TABLE_LABELS[tableName] ??
      tableName.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase()),
  );
}

export function buildBotMessage(data: ChatbotApiResponse): ChatMessage {
  const sourceTables = extractTablesFromSQL(data.final_sql ?? "");

  return {
    type: "bot",
    content: data.is_valid
      ? `Encontrei ${data.rows?.length || 0} resultados.`
      : `Erro: ${data.error_message || "Não consegui processar sua pergunta."}`,
    timestamp: Date.now(),
    sql: data.final_sql,
    isValid: data.is_valid,
    rows: data.rows,
    error: data.error_message,
    errorType: data.error_type,
    sourceTables,
  };
}

export function createFreshChatState(): StoredChatState {
  return {
    sessionId: crypto.randomUUID(),
    expiresAt: Date.now() + SESSION_TTL_MS,
    messages: [],
  };
}

export function readStoredChatState(): StoredChatState {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) {
      return createFreshChatState();
    }

    const parsed = JSON.parse(raw) as Partial<StoredChatState>;
    const isSessionIdValid = typeof parsed.sessionId === "string" && parsed.sessionId.length > 0;
    const isExpiresAtValid = typeof parsed.expiresAt === "number" && parsed.expiresAt > Date.now();

    if (!isSessionIdValid || !isExpiresAtValid) {
      return createFreshChatState();
    }

    return {
      sessionId: parsed.sessionId!,
      expiresAt: parsed.expiresAt!,
      messages: Array.isArray(parsed.messages) ? parsed.messages.slice(-MAX_PERSISTED_MESSAGES) : [],
    };
  } catch {
    return createFreshChatState();
  }
}

export function persistStoredChatState(state: StoredChatState) {
  try {
    localStorage.setItem(
      CHAT_STORAGE_KEY,
      JSON.stringify({
        sessionId: state.sessionId,
        expiresAt: state.expiresAt,
        messages: state.messages.slice(-MAX_PERSISTED_MESSAGES),
      }),
    );
  } catch {
    // Ignore storage failures so the chat keeps working.
  }
}