/**
 * Single place that turns a failed Lovable AI Gateway response into a message
 * the user can act on. Without this, every gateway problem (missing key,
 * rejected model, quota) collapsed into a vague "serviço indisponível",
 * which made production incidents impossible to diagnose.
 */
export async function aiGatewayFailureReason(
  res: Response,
  fallback: string,
  scope: string,
): Promise<string> {
  let body = "";
  try {
    body = (await res.text()).slice(0, 500);
  } catch {
    /* body already consumed or unreadable */
  }
  console.error(`[ai-gateway:${scope}] ${res.status} ${res.statusText} ${body}`);

  if (res.status === 429) return "Muitas solicitações agora. Aguarde alguns instantes e tente novamente.";
  if (res.status === 402) return "Os créditos de IA do aplicativo acabaram. Tente novamente mais tarde.";
  if (res.status === 401 || res.status === 403) {
    return "O serviço de IA está com a configuração incompleta no servidor. Já registramos o erro — tente novamente em instantes.";
  }
  if (res.status >= 500) return "O serviço de IA está instável no momento. Tente novamente em instantes.";
  return fallback;
}

/** Reason returned when the server has no AI credential configured at all. */
export const AI_NOT_CONFIGURED =
  "O serviço de IA ainda não está configurado neste servidor. Tente novamente em instantes.";
