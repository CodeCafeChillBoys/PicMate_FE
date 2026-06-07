import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    // eslint-disable-next-line no-console
    console.error('Uncaught error in component tree:', error, info);
  }

  render() {
    const { error, info } = this.state;
    if (error) {
      return (
        <div style={{ padding: 20 }}>
          <h2>Đã xảy ra lỗi trong ứng dụng</h2>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f8d7da', color: '#721c24', padding: 12 }}>{String(error && error.toString())}</pre>
          {info && info.componentStack && (
            <details style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>
              <summary>Component stack</summary>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{info.componentStack}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
