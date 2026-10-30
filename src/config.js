export const API_URL =
  import.meta.env.VITE_API_URL || "https://aman-ai-assistant-backed-1.onrender.com/response";

export const parseReply = (d) => {
  if (typeof d === "string") return d;

  const reply =
    d?.response ?? d?.answer ?? d?.reply ?? d?.message ?? d?.output ?? d?.text ?? d?.result ??
    d?.data?.response ?? d?.data?.answer;
  if (reply !== undefined) {
    return typeof reply === "string" ? reply : parseReply(reply);
  }

  return JSON.stringify(d) ?? String(d ?? "");
};
