import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, LogOut, Users, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface AuthUser {
  id: string;
  username: string;
  avatar?: string;
  globalName?: string;
}

interface AuthStatus {
  authenticated: boolean;
  user?: AuthUser;
  hasMHCMembership?: boolean;
  membershipDetails?: any;
}

export function DiscordAuth() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Check auth status
  const { data: authStatus, isLoading: statusLoading } = useQuery<AuthStatus>({
    queryKey: ["/api/auth/status"],
    refetchInterval: 60000, // Refresh every minute
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Logout failed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/status"] });
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of Discord",
      });
    },
    onError: () => {
      toast({
        title: "Logout failed",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Verify membership mutation
  const verifyMembershipMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/verify-membership");
      if (!response.ok) throw new Error("Verification failed");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/status"] });
      if (data.hasMembership) {
        toast({
          title: "Membership verified",
          description: "Your Miles High Club membership is active!",
        });
      } else {
        toast({
          title: "No membership found",
          description: "You don't have an active Miles High Club membership",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Verification failed",
        description: "Failed to verify membership. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle Discord login
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/discord");
      const data = await response.json();
      
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error("No auth URL received");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Failed to initiate Discord login. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  if (statusLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Shield className="w-4 h-4 mr-2" />
        Loading...
      </Button>
    );
  }

  if (!authStatus?.authenticated) {
    return (
      <Button
        variant="default"
        size="sm"
        onClick={handleLogin}
        disabled={isLoading}
        className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
      >
        <Shield className="w-4 h-4 mr-2" />
        {isLoading ? "Redirecting..." : "Login with Discord"}
      </Button>
    );
  }

  const avatarUrl = authStatus.user?.avatar
    ? `https://cdn.discordapp.com/avatars/${authStatus.user.id}/${authStatus.user.avatar}.png`
    : undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="text-xs">
              {authStatus.user?.username?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline-block">
            {authStatus.user?.globalName || authStatus.user?.username}
          </span>
          {authStatus.hasMHCMembership && (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
              MHC
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Discord Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5 text-sm">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">@{authStatus.user?.username}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {authStatus.hasMHCMembership ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  Miles High Club Member
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  No MHC Membership
                </span>
              </>
            )}
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => verifyMembershipMutation.mutate()}
          disabled={verifyMembershipMutation.isPending}
        >
          <Shield className="w-4 h-4 mr-2" />
          {verifyMembershipMutation.isPending ? "Verifying..." : "Verify Membership"}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}