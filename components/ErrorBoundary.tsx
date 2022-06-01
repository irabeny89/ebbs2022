import { Component, ErrorInfo, ReactNode } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    return this.state.hasError ? (
      <Alert variant="danger">
        <Alert.Heading>Oops, there is an error!</Alert.Heading>
        <Button
          type="button"
          onClick={() => this.setState({ hasError: false })}
        >
          Try again?
        </Button>
      </Alert>
    ) : (
      this.props.children
    );
  }
}

export default ErrorBoundary;
