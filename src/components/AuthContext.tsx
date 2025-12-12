import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { List, Icon, Action, ActionPanel, Color } from "@raycast/api";
import { isCliInstalled, isAuthenticated, getUser } from "../utils";
import { User, CLINotFoundError, AuthenticationError } from "../types";
import { Guide } from "./Guide";
import { ErrorView } from "./ErrorView";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const checkAuth = () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isCliInstalled()) {
        throw new CLINotFoundError();
      }

      if (!isAuthenticated()) {
        throw new AuthenticationError();
      }

      const userInfo = getUser();
      setUser(userInfo);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (error instanceof CLINotFoundError) {
    return <Guide />;
  }

  if (error instanceof AuthenticationError) {
    return <LoginRequiredView onRetry={checkAuth} />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, error, refresh: checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function LoadingView() {
  return (
    <List isLoading={true}>
      <List.EmptyView
        icon={Icon.Shield}
        title="Connecting to Proton Pass"
        description="Checking authentication..."
      />
    </List>
  );
}

interface LoginRequiredViewProps {
  onRetry: () => void;
}

function LoginRequiredView({ onRetry }: LoginRequiredViewProps) {
  return (
    <List>
      <List.EmptyView
        icon={{ source: Icon.Person, tintColor: Color.Orange }}
        title="Login Required"
        description="Sign in to Proton Pass to continue"
      />
      <List.Section title="Quick Actions">
        <List.Item
          icon={{ source: Icon.ArrowClockwise, tintColor: Color.Blue }}
          title="I've Logged In"
          subtitle="Click to retry after signing in"
          actions={
            <ActionPanel>
              <Action
                title="Retry"
                icon={Icon.ArrowClockwise}
                onAction={onRetry}
              />
            </ActionPanel>
          }
        />
      </List.Section>
      <List.Section title="Sign In Steps">
        <List.Item
          icon={{ source: Icon.Terminal, tintColor: Color.SecondaryText }}
          title="1. Open Terminal"
          subtitle="Launch your terminal app"
        />
        <List.Item
          icon={{ source: Icon.CommandSymbol, tintColor: Color.Blue }}
          title="2. Run Login Command"
          subtitle="pass-cli login"
          accessories={[{ tag: { value: "Copy", color: Color.Blue } }]}
          actions={
            <ActionPanel>
              <Action.CopyToClipboard
                title="Copy Command"
                content="pass-cli login"
              />
            </ActionPanel>
          }
        />
        <List.Item
          icon={{ source: Icon.Globe, tintColor: Color.SecondaryText }}
          title="3. Authenticate in Browser"
          subtitle="Sign in with your Proton account"
        />
        <List.Item
          icon={{ source: Icon.ArrowClockwise, tintColor: Color.Green }}
          title="4. Return & Retry"
          subtitle="Select 'I've Logged In' above"
        />
      </List.Section>
      <List.Section title="Help">
        <List.Item
          icon={Icon.QuestionMark}
          title="Need Help?"
          subtitle="View the CLI documentation"
          actions={
            <ActionPanel>
              <Action.OpenInBrowser
                title="Open Documentation"
                url="https://proton.me/support/pass-cli"
              />
            </ActionPanel>
          }
        />
      </List.Section>
    </List>
  );
}
