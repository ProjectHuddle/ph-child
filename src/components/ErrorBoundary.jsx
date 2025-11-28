/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the component tree and
 * displays a fallback UI instead of crashing the app.
 *
 * @package SureFeedback
 */

import React from 'react';
import { XCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div className="flex justify-center items-center min-h-screen bg-background p-4">
                    <Card className="shadow-sm text-center max-w-md w-full">
                        <CardContent className="space-y-4 p-6">
                            <XCircle className="mx-auto text-destructive h-8 w-8" />
                            <h2 className="text-xl font-semibold text-foreground">
                                Something went wrong
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                There was an error loading the SureFeedback interface.
                                Please refresh the page or contact support if the problem persists.
                            </p>
                            {window.sureFeedbackAdmin?.debug && this.state.error && (
                                <details className="mt-4 text-left">
                                    <summary className="cursor-pointer text-sm font-medium text-foreground">
                                        Show error details
                                    </summary>
                                    <pre className="mt-2 p-3 bg-muted text-xs text-foreground rounded-md overflow-auto">
                                        {this.state.error.toString()}
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                </details>
                            )}
                            <Button
                                size="default"
                                onClick={() => window.location.reload()}
                            >
                                Refresh Page
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;