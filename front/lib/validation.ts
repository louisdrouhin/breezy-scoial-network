// Règles de validation du formulaire d'inscription.
// Alignées sur les contraintes des modèles (username/displayName en STRING(30)/
// STRING(50), email en STRING(255)) et dupliquées côté auth-svc pour une
// défense en profondeur — le front valide pour l'UX, le back fait foi.

export const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface RegisterFields {
  username: string;
  displayName: string;
  email: string;
}

// Renvoie le premier message d'erreur rencontré, ou null si tout est valide.
// Le mot de passe n'a volontairement aucune contrainte de format.
export function validateRegister({ username, displayName, email }: RegisterFields): string | null {
  if (!USERNAME_RE.test(username)) {
    return "Le nom d'utilisateur doit faire 3 à 30 caractères (lettres, chiffres et underscore uniquement).";
  }
  const trimmedDisplayName = displayName.trim();
  if (trimmedDisplayName.length < 1 || trimmedDisplayName.length > 50) {
    return 'Le nom affiché doit faire entre 1 et 50 caractères.';
  }
  if (email.length > 255 || !EMAIL_RE.test(email)) {
    return "L'adresse e-mail n'est pas valide.";
  }
  return null;
}
