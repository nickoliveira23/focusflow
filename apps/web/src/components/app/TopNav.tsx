import React from "react";
import { UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FocusAccent, SessionMode } from "@/app/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface TopNavProps {
  authUser: { email: string; name: string; avatarUrl: string } | null;
  focusAccent: FocusAccent;
  mode: SessionMode;
  onOpenInsights: () => void;
  onOpenSettings: () => void;
  onOpenAccount: () => void;
  onOpenProfile: () => void;
  onOpenPremium: () => void;
  onLogout: () => void;
  onOpenLoginModal: () => void;
}

export function TopNav({
  authUser,
  onOpenInsights,
  onOpenSettings,
  onOpenAccount,
  onOpenProfile,
  onOpenPremium,
  onLogout,
  onOpenLoginModal
}: TopNavProps) {
  return (
    <header className="top-nav" aria-label="Main navigation">
      <div className="brand">
        <p className="brand-name">Focus Flow</p>
      </div>
      <div className="top-actions">
        <Button type="button" variant="outline" onClick={onOpenInsights}>
          Insights
        </Button>
        <Button type="button" variant="outline" onClick={onOpenSettings}>
          Settings
        </Button>
        {authUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="account-trigger"
                aria-label="Open account menu"
              >
                <img
                  src={authUser.avatarUrl}
                  alt={authUser.name}
                  className="account-avatar-image"
                  referrerPolicy="no-referrer"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="account-dropdown">
              <DropdownMenuItem className="account-dropdown-item" onClick={onOpenAccount}>
                Account
              </DropdownMenuItem>
              <DropdownMenuItem className="account-dropdown-item" onClick={onOpenProfile}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="account-dropdown-item" onClick={onOpenPremium}>
                Pomodoro Premium
              </DropdownMenuItem>
              <DropdownMenuItem className="account-dropdown-item" onClick={onLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="account-trigger"
            onClick={onOpenLoginModal}
            aria-label="Open login modal"
          >
            <span className="account-avatar-fallback account-avatar-placeholder" aria-hidden="true">
              <UserIcon size={16} />
            </span>
          </Button>
        )}
      </div>
    </header>
  );
}
