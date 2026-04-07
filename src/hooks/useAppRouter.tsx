import { createContext, useContext, useEffect, useState, type MouseEvent, type ReactNode } from "react";

type RouterContextValue = {
  path: string;
  search: string;
  navigate: (to: string, options?: { replace?: boolean }) => void;
};

const RouterContext = createContext<RouterContextValue | undefined>(undefined);

const getLocationState = () => ({
  path: window.location.pathname || "/",
  search: window.location.search || "",
});

export function AppRouterProvider({ children }: { children: ReactNode }) {
  const [{ path, search }, setLocationState] = useState(getLocationState);

  useEffect(() => {
    const handlePopState = () => setLocationState(getLocationState());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (to: string, options?: { replace?: boolean }) => {
    const url = new URL(to, window.location.origin);
    const next = `${url.pathname}${url.search}${url.hash}`;

    if (options?.replace) {
      window.history.replaceState({}, "", next);
    } else {
      window.history.pushState({}, "", next);
    }

    setLocationState({ path: url.pathname, search: url.search });
  };

  return (
    <RouterContext.Provider value={{ path, search, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useAppRouter() {
  const context = useContext(RouterContext);
  if (!context) throw new Error("useAppRouter must be used within AppRouterProvider");
  return context;
}

type AppLinkProps = {
  to: string;
  className?: string;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export function AppLink({ to, className, children, onClick }: AppLinkProps) {
  const { navigate } = useAppRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    navigate(to);
  };

  return (
    <a href={to} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
