/**
 * Mapa determinístico de retratos artísticos individuais (reis e juízes).
 * As imagens são arquivos locais empacotados no build — funcionam offline/PWA
 * e não dependem de serviços externos. São representações artísticas,
 * nunca fotografias reais de pessoas.
 */
const modules = import.meta.glob<{ default: string }>("../assets/portraits/*.jpg", {
  eager: true,
});

export const CHARACTER_PORTRAITS: Record<string, string> = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => [
    path.split("/").pop()!.replace(/\.jpg$/, ""),
    mod.default,
  ]),
);

export function portraitFor(id: string): string | undefined {
  return CHARACTER_PORTRAITS[id];
}
