const STORAGE_KEY = "authState";

let state = {
  user: null,
  token: null,
};

function notifyAuthStateChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("authStateChanged"));
  }
}

export function loadAuthState() {
  if (typeof window === "undefined") {
    return state;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return state;
    const parsed = JSON.parse(raw);
    state = {
      user: parsed.user || null,
      token: parsed.token || null,
    };
    if (state.token) {
      localStorage.setItem("authToken", state.token);
    }
    return state;
  } catch (error) {
    return state;
  }
}

export function getAuthState() {
  return state;
}

export function setAuthState(nextState) {
  state = {
    user: nextState.user || null,
    token: nextState.token || null,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (state.token) {
      localStorage.setItem("authToken", state.token);
    } else {
      localStorage.removeItem("authToken");
    }
  }

  notifyAuthStateChange();

  return state;
}

export function clearAuthState() {
  state = { user: null, token: null };

  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("authToken");
  }

  notifyAuthStateChange();

  return state;
}
