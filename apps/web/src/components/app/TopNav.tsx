import React from "react";
import { UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import appLogo from "@/assets/logo.svg";
import appLogoOcean from "@/assets/logo-ocean.svg";
import appLogoShortBreak from "@/assets/logo-short-break.svg";
import appLogoLongBreak from "@/assets/logo-long-break.svg";
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
  focusAccent,
  mode,
  onOpenInsights,
  onOpenSettings,
  onOpenAccount,
  onOpenProfile,
  onOpenPremium,
  onLogout,
  onOpenLoginModal
}: TopNavProps) {
  const brandLogo =
    mode === "short_break"
      ? appLogoShortBreak
      : mode === "long_break"
        ? appLogoLongBreak
        : focusAccent === "ocean"
          ? appLogoOcean
          : appLogo;

  return (
    <header className="top-nav" aria-label="Main navigation">
      <div className="brand">
        <div className="brand-logo" aria-hidden="true">
          <img src={brandLogo} alt="" className="brand-logo-image" />
        </div>
        <div>
          <p className="brand-name">Focus Flow</p>
        </div>
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
              <UserIcon size={18} />
            </span>
          </Button>
        )}
      </div>
    </header>
  );
}
