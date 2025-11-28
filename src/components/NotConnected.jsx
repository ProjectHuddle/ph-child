import React, { useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { __ } from "@wordpress/i18n";
import { useConnection } from "../hooks/useConnection.js";
import { APP_URLS } from "../api/apiurls.js";
import defaultConnectionImg from "../../../../assets/images/settings/default-connection.svg";

const NotConnected = () => {
  const { initiateConnection, isLoading, error } = useConnection();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    // Get project ID from localized data (optional)
    const projectId = window.sureFeedbackAdmin?.project_id;
    
    // Redirect to SureFeedback app for connection
    // The app will handle authentication and redirect back with OAuth token
    initiateConnection(projectId);
  };

  return (
    <div className="flex justify-center items-start bg-background p-4 pt-8">
      <Card className="shadow-sm text-center max-w-2xl w-full rounded-lg border border-border">
        <CardContent className="flex flex-col justify-center items-center space-y-6 px-6 py-8 min-h-[400px]">
          {/* Icon */}
          <img src={defaultConnectionImg} alt="Not Connected" className="w-18 h-18" />
          
          {/* Content */}
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-semibold text-[#0F172A]">
              {__("SureFeedback Not Connected!", "surefeedback")}
            </h2>
            <p className="text-muted-foreground text-sm max-w-[300px] mx-auto">
              {__(
                'Click "Connect Website" to authorize this website with SureFeedback.',
                "surefeedback"
              )}
            </p>
            
            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>
          
          {/* Action Button */}
          <Button
            onClick={handleConnect}
            disabled={isConnecting || isLoading}
            className="bg-primary w-[300px] h-[48px] text-sm rounded-lg disabled:opacity-50"
          >
            {isConnecting || isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {__("Connecting...", "surefeedback")}
              </>
            ) : (
              <>
                {__("Connect Website", "surefeedback")}
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotConnected;
