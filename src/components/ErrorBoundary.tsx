import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="mb-3 flex items-center gap-3 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-lg">
              {this.props.fallbackTitle || "This section crashed"}
            </h2>
          </div>
          <p className="mb-4 text-sm text-red-700">
            {this.props.fallbackMessage ||
              "The rest of the dashboard is still running. Retry this section."}
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Section
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

