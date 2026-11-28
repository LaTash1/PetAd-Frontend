import i18n, { type BackendModule } from "i18next";
import { initReactI18next } from "react-i18next";
import { pseudoLocalise } from "./pseudo";

type CommonResources = typeof import("./locales/en/common.json");

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: CommonResources;
    };
  }
}

const localeLoaders = import.meta.glob<CommonResources>(
  "./locales/*/*.json",
  { import: "default" },
);

const backend: BackendModule = {
  type: "backend",
  init() {},
  read(language, namespace, callback) {
    const loadLocale = localeLoaders[`./locales/${language}/${namespace}.json`];
    if (!loadLocale) {
      callback(new Error(`Unknown locale: ${language}`), null);
      return;
    }

    void loadLocale()
      .then((resources) => callback(null, resources))
      .catch((error: unknown) =>
        callback(error instanceof Error ? error : new Error(String(error)), null),
      );
  },
};

const messages = {
  home: {
    welcome: "WELCOME PET LOVER!",
    description: "Research has shown that - those who keep pets for emotional support or companionship tend to live a longer life.",
    list: "List For Adoption",
    adopt: "I Want To Adopt",
  },
  notifications: {
    title: "Notifications",
    filters: "Notification filters",
    all: "All",
    unread: "Unread",
    read: "Read",
    Today: "Today",
    Yesterday: "Yesterday",
    Earlier: "Earlier",
    noUnread: "No unread notifications",
    noUnreadDescription: "You're all caught up! New notifications will appear here.",
    noRead: "No read notifications",
    noReadDescription: "Notifications you've opened will appear here.",
    empty: "No notifications yet",
    emptyDescription: "When activity happens on your adoptions, you'll see updates here.",
    reconnecting: "Reconnecting to notification service...",
    disconnected: "Disconnected from notification service",
    reconnect: "Reconnect",
    error: "Something went wrong",
    loadFailed: "Failed to load notifications. Please try again.",
    end: "You've reached the end",
  },
  signIn: {
    welcome: "Welcome Pet Lover!",
    continue: "Sign in to continue:",
    google: "Continue with Google",
    email: "Email Address",
    emailPlaceholder: "Enter your email address",
    password: "Password",
    passwordPlaceholder: "Create your password",
    forgot: "Forget Password?",
    submit: "Sign In",
    noAccount: "Don't have an account?",
    register: "Create Account",
  },
} as const;

function selectLocale(): "en" | "en-XA" {
  if (!import.meta.env.DEV || typeof window === "undefined") return "en";

  const requested = new URLSearchParams(window.location.search).get("locale");
  if (requested === "en" || requested === "en-XA") {
    window.sessionStorage.setItem("petad.locale", requested);
  }
  return window.sessionStorage.getItem("petad.locale") === "en-XA" ? "en-XA" : "en";
}

export const activeLocale = selectLocale();

void i18n
  .use(backend)
  .use(initReactI18next)
  .init({
    lng: "en",
    fallbackLng: "en",
    defaultNS: "common",
    ns: ["common"],
    interpolation: { escapeValue: false },
  })
  .then(() => {
    document.documentElement.lang =
      activeLocale === "en-XA" ? activeLocale : i18n.resolvedLanguage ?? "en";
  });

i18n.on("languageChanged", (language) => {
  document.documentElement.lang =
    activeLocale === "en-XA" ? activeLocale : language;
});

export function localise(text: string): string {
  return activeLocale === "en-XA" ? pseudoLocalise(text) : text;
}

export function t<N extends keyof typeof messages>(
  namespace: N,
  key: keyof (typeof messages)[N],
): string {
  return localise(String(messages[namespace][key]));
}

export default i18n;
