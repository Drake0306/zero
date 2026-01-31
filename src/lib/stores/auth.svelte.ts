let userName = $state('');
let loggedIn = $state(false);

export function login(name: string) {
  userName = name;
  loggedIn = true;
}

export function logout() {
  userName = '';
  loggedIn = false;
}

export function isLoggedIn(): boolean {
  return loggedIn;
}

export function getUserName(): string {
  return userName;
}
