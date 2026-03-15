import React, { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Home, ShieldAlert } from 'lucide-react';
import { Button, Card } from './ui/Common';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private parseFirestoreError(errorMessage: string) {
    try {
      const parsed = JSON.parse(errorMessage);
      if (parsed && typeof parsed === 'object' && 'error' in parsed && 'operationType' in parsed) {
        return parsed;
      }
    } catch (e) {
      // Not a JSON error
    }
    return null;
  }

  public render() {
    if (this.state.hasError) {
      const firestoreError = this.state.error ? this.parseFirestoreError(this.state.error.message) : null;

      return (
        <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full border-rose-500/20 bg-rose-500/5">
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mx-auto">
                <ShieldAlert size={32} />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Application Error</h2>
                <p className="text-slate-400">Something went wrong while processing your request.</p>
              </div>

              {firestoreError ? (
                <div className="bg-slate-900 rounded-xl p-6 text-left border border-slate-800 space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-rose-500 shrink-0 mt-1" size={18} />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-rose-500 uppercase tracking-wider">Security Violation</p>
                      <p className="text-white font-medium">{firestoreError.error}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Operation</p>
                      <p className="text-xs font-mono text-slate-300">{firestoreError.operationType}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Resource Path</p>
                      <p className="text-xs font-mono text-slate-300">{firestoreError.path || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">User Identity</p>
                      <p className="text-xs font-mono text-slate-300">
                        {firestoreError.authInfo.email || 'Anonymous'} ({firestoreError.authInfo.userId || 'No UID'})
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 rounded-xl p-4 text-left border border-slate-800">
                  <p className="text-xs font-mono text-slate-400 break-all">
                    {this.state.error?.message || 'An unknown error occurred'}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  className="flex-1 gap-2" 
                  onClick={() => window.location.reload()}
                >
                  <RefreshCcw size={18} />
                  Reload Application
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2" 
                  onClick={() => window.location.href = '/'}
                >
                  <Home size={18} />
                  Back to Home
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    const { children } = this.props;
    return children;
  }
}
