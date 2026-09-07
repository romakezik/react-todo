import { Component } from 'react';

export class ErrorBoundary extends Component {
    state = { error: null };
    static getDerivedStateFromError(error) { return { error }; }
    render() {
        if (this.state.error) {
            return <div className="container"><h1>Что-то сломалось</h1>
                <p>{String(this.state.error)}</p></div>;
        }
        return this.props.children;
    }
}