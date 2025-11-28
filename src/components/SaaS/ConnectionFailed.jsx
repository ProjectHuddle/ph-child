import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { useConnection } from "../../hooks/useConnection.js";

// WordPress i18n fallback
const __ = (text, domain) => {
  if (typeof window !== 'undefined' && window.wp && window.wp.i18n) {
    return window.wp.i18n.__(text, domain);
  }
  return text;
};

const ConnectionFailed = ({ error }) => {
  const { initiateConnection } = useConnection();

  const handleRetry = () => {
    const projectId = window.sureFeedbackAdmin?.project_id;
    if (projectId) {
      initiateConnection(projectId);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex justify-center items-start bg-background p-4 pt-8">
      <Card className="shadow-sm text-center max-w-2xl w-full rounded-lg border border-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            {__("Connection Failed", "surefeedback")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center space-y-6 px-6 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || __("Failed to connect to SureFeedback. Please try again.", "surefeedback")}
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleRetry}
            className="bg-primary w-[300px] h-[48px] text-sm rounded-lg"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {__("Try Again", "surefeedback")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionFailed;
