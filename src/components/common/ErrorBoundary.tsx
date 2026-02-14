import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null
    });
    window.location.href = '/feed';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-fb-bg flex items-center justify-center p-4">
          <div className="bg-fb-card border border-fb-border rounded-lg p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">⚠️</span>
              </div>
              <h1 className="text-2xl font-bold text-[#1a3a2a] mb-2">
                Something went wrong
              </h1>
              <p className="text-[#6b8a7a] text-sm">
                We're sorry for the inconvenience. The application encountered an unexpected error.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                <p className="font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full px-4 py-3 bg-accent text-white rounded-lg hover:bg-[#1e4d35] transition-colors font-medium"
              >
                Go to Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-3 bg-[#e8ede8] text-[#4a6a58] rounded-lg hover:bg-[#d4ddd8] transition-colors font-medium"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
