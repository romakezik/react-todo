import { Component, type ReactNode } from "react";

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
          <div className="empty-state">
            <h1 className="page-title">Что-то сломалось</h1>
            <p className="empty-state__text">{String(this.state.error)}</p>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Перезагрузить
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
