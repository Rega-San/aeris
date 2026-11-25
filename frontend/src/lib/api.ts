const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
export async function apiGet<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(`${apiBase}/api/${path}`, {
    signal,
    cache: "no-store",
  });
  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new Error(
      "Le service météo est inaccessible. Vérifiez que l’API est démarrée puis réessayez.",
    );
  }
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || "La requête a échoué. Réessayez.");
  return result as T;
}
