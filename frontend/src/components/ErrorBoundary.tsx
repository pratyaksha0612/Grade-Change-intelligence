import React, { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px", color: "#ff5555", background: "#0a0a0a", minHeight: "100vh", fontFamily: "monospace" }}>
          <h1 style={{ fontSize: "24px", color: "#E52222", marginBottom: "16px" }}>⚠️ Application Error Caught</h1>
          <div style={{ padding: "20px", background: "#161616", borderRadius: "8px", border: "1px solid #333" }}>
            <p style={{ fontWeight: "bold", fontSize: "16px" }}>{this.state.error && this.state.error.toString()}</p>
            <pre style={{ marginTop: "16px", whiteSpace: "pre-wrap", color: "#aaa", fontSize: "12px" }}>
              {this.state.errorInfo?.componentStack}
            </pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: "20px", padding: "10px 20px", background: "#E52222", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
