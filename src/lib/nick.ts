// Nickname persistence for the onboarding gate. The nick lives in
// localStorage; routes read it to gate access and derive the avatar initials.
export const NICK_KEY = "pigeon:nick";

export function getNick(): string | null {
  return localStorage.getItem(NICK_KEY);
}

export function setNick(nick: string): void {
  localStorage.setItem(NICK_KEY, nick);
}
