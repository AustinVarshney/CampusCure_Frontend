/**
 * Render error boundary (CC-05).
 *
 * Before this, an error thrown during render unmounted the whole React tree
 * and left a blank white page — no message, no recovery, and nothing recorded
 * anywhere. A student hitting it could only report "the site stopped working",
 * which is unactionable.
 *
 * Still a class component: `componentDidCatch` has no hook equivalent, and
 * React has not shipped one. This is the documented exception to the hooks-only
 * rule elsewhere in the codebase.
 */
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "antd";
import { getLastRequestId, reportError } from "@/lib/observability";

interface Props {
  children: ReactNode;
  /** Names the failing area in the report, e.g. "route" or "app". */
  label?: string;
}

interface State {
  error: Error | null;
  requestId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, requestId: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Captured at throw time rather than at render time: by the time the user
    // clicks anything, later requests may have overwritten it.
    const requestId = getLastRequestId();
    this.setState({ requestId });

    reportError(error, {
      component: this.props.label ?? "ErrorBoundary",
      extra: { componentStack: info.componentStack },
    });
  }

  private reset = (): void => {
    this.setState({ error: null, requestId: null });
  };

  private reload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    const { error, requestId } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-xl font-semibold text-foreground">
            Something went wrong on this page
          </h1>

          <p className="text-sm text-muted-foreground">
            The rest of CampusCure is still working. You can go back and try
            again — nothing you had already saved is affected.
          </p>

          {requestId && (
            <p className="text-xs text-muted-foreground">
              If you report this, quote:{" "}
              <code className="font-mono bg-muted px-1.5 py-0.5 rounded">
                {requestId}
              </code>
            </p>
          )}

          {/* Development only. In production this would show a student a
              stack trace they cannot act on, and `import.meta.env.DEV` is
              compiled out of the production bundle entirely. */}
          {import.meta.env.DEV && (
            <pre className="text-left text-xs bg-muted p-3 rounded overflow-auto max-h-48">
              {error.stack ?? error.message}
            </pre>
          )}

          <div className="flex gap-2 justify-center">
            {/* Retries the subtree. Works when the cause was transient - a
                failed lazy chunk, a race - and harmlessly re-throws when it
                was not. */}
            <Button onClick={this.reset}>Try again</Button>
            <Button type="primary" onClick={this.reload}>
              Reload the page
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
