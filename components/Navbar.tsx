"use client";

import NotificationBar from "./NotificationBar";
import {
  SignInButton,
  SignOutButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Filter,
  LogIn,
  MoreHorizontal,
  Trello,
} from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "./ui/badge";

interface Props {
  boardTitle?: string | null;
  onEditBoard?: () => void;
  teamName?: string | null;
  onfilterClick?: () => void;
  filterCount?: number;
  onEditTeam?: () => void;
  showNotification?: boolean;
  onLeaveTeamClick?: () => void;
  isMember?: boolean;
}

function Navbar({
  boardTitle,
  onEditBoard,
  onfilterClick,
  filterCount = 0,
  teamName,
  onEditTeam,
  showNotification,
  onLeaveTeamClick,
  isMember,
}: Props) {
  const { isSignedIn, user } = useUser();
  const pathname = usePathname();

  const isDashboardPage = pathname === "/dashboard";
  const isTeamsPage = pathname === "/teams";
  const isBoardPage = pathname.startsWith("/boards/");
  const isTeamPage = pathname.startsWith("/team/");


  if (isDashboardPage) {
    return (
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link href={"/"}>
            <div className="flex items-center space-x-2">
              <Trello className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 " />{" "}
              <span className="text-xl sm:text-2xl font-bold text-gray-900">
                Trello clone
              </span>
            </div>
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-2">
            <div className="flex items-center justify-center gap-6">
              <UserButton />
              {showNotification && <NotificationBar />}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // is teams page
  if (isTeamsPage) {
    return (
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link href={"/"}>
            <div className="flex items-center space-x-2">
              <Trello className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 " />
              <span className="text-xl sm:text-2xl font-bold text-gray-900">
                Trello clone
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-2">
            <div className="flex items-center justify-center gap-6">
              <UserButton />
              {showNotification && <NotificationBar />}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // if it is a board page

  if (isBoardPage) {
    return (
      <>
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 flex-shrink-0"
                >
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Back to Boards</span>
                  <span className="sm:hidden">Back</span>
                </Link>
                <div className="h-4 sm:h-6 w-px bg-gray-300 hidden sm:block" />
                <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                  <Trello className="text-blue-600" />
                  <div className="items-center space-x-1 sm:space-x-2 min-w-0">
                    <span className="text-lg font-bold text-gray-900 truncate">
                      {boardTitle}
                    </span>
                    {onEditBoard && (
                      <Button
                        variant={"ghost"}
                        size="sm"
                        className="h-7 w-7 flex-shrink-0 p-0"
                        onClick={onEditBoard}
                      >
                        <MoreHorizontal />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              {/* Filter UI */}
              <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                {onfilterClick && (
                  <Button
                    onClick={onfilterClick}
                    variant="outline"
                    size="sm"
                    className={`text-xs sm:text-sm ${
                      filterCount > 0 ? "bg-blue-100 border-blue-200" : ""
                    }`}
                  >
                    <Filter className="h-3 w-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Filter</span>
                    {filterCount > 0 && (
                      <Badge
                        variant="secondary"
                        className={`text-xs ml-1 sm:ml-2 ${
                          filterCount > 0 ? "bg-blue-100 border-blue-200" : ""
                        }`}
                      >
                        {filterCount}
                      </Badge>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>
      </>
    );
  }
  if (isTeamPage) {
    return (
      <>
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              {/* Left Section */}
              <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
                <Link
                  href="/teams"
                  className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 flex-shrink-0"
                >
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Back to team</span>
                  <span className="sm:hidden">Back</span>
                </Link>

                <div className="h-4 sm:h-6 w-px bg-gray-300 hidden sm:block" />

                <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                  <Trello className="text-blue-600" />
                  <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                    <span className="text-lg font-bold text-gray-900 truncate">
                      {teamName}
                    </span>
                    {!isMember
                      ? onEditTeam && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 flex-shrink-0 p-0"
                            onClick={onEditTeam}
                          >
                            <MoreHorizontal />
                          </Button>
                        )
                      : null}
                  </div>
                </div>
              </div>

              {/* Right Section - Leave Team */}
              {isMember ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={onLeaveTeamClick}
                >
                  <LogIn className="h-4 w-4" />
                  Leave team
                </Button>
              ) : (
                ""
              )}
            </div>
          </div>
        </header>
      </>
    );
  }

  // If is Home Page
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Trello className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 " />{" "}
          <span className="text-xl sm:text-2xl font-bold text-gray-900">
            Trello clone
          </span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-2">
          {isSignedIn ? (
            <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                Welcome ,{" "}
                {user.firstName ?? user.emailAddresses[0].emailAddress}
              </span>
              <Link href="/dashboard">
                <Button size="sm" className="text-xs sm:text-sm">
                  Go to Dashboard <ArrowRight />
                </Button>
              </Link>
              <Link href="/teams">
                <Button
                  size="sm"
                  className="text-xs bg-blue-600 sm:text-sm hover:opacity-90 hover:bg-blue-600 "
                >
                  Go to Teams <ArrowRight />
                </Button>
              </Link>

              <SignOutButton>
                <Button size="sm" className="text-xs sm:text-sm">
                  Sign Out
                </Button>
              </SignOutButton>
            </div>
          ) : (
            <div>
              <SignInButton>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button size="sm" className="text-xs sm:text-sm">
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
