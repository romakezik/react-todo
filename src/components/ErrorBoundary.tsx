import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="container">
          <h1>Что-то сломалось</h1>
          <p>{String(this.state.error)}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
