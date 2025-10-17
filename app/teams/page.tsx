"use client";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePlan } from "@/lib/contexts/PlanContext";
import { useBoard, useBoards } from "@/lib/hooks/useBoards";
import { useTeams } from "@/lib/hooks/useTeams";
import { Board, Column, ColumnWithTask } from "@/lib/supabase/modals";
import { useUser } from "@clerk/nextjs";
import {
  ChartColumn,
  Check,
  Filter,
  Grid3x3,
  List,
  Loader,
  Loader2,
  Plus,
  Rocket,
  Search,
  Trash2,
  Trello,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useNotifications } from "@/lib/hooks/useNotifications";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
type BoardWithOptionalTaskCount = Board & { taskCount?: number };

function DashboardPage() {
  const { isFreeUser } = usePlan();

  // clertk hook
  const { user } = useUser();

  const { teams, createTeam, deleteTeam, joinTeamWithCode } = useTeams();
  // Team Shit

  const [isCreatingTeamDialog, setIsCreatingTeamDialog] =
    useState<boolean>(false);
  const [isComfirmationDeleteDialog, setIsComfirmationDeleteDialog] = useState({
    team_name: "",
    dialogOpen: false,
    team_id: "",
    error: "",
  });

  // Create Team
  const canCreateTeam = !isFreeUser || teams.length < 1;

  const [showUpgradeDialog, setShowUpgradeDialog] = useState<boolean>(false);

  // Opt Dialog

  const [openOtpDialog, setOpenOtpDialog] = useState<boolean>(false);

  // invite code
  const [inviteCode, setInviteCode] = useState("");

  const handleCreateTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const teamName = formData.get("teamName") as string;
    const description = formData.get("description") as string;
    const fileData = formData.get("imageUrl") as File | null;

    await createTeam(teamName.trim(), description.trim(), fileData);

    setIsCreatingTeamDialog(false);
  };
  // To check id user can create a board or not using the plans
  function checkCanCreateTeam() {
    if (canCreateTeam) {
      setIsCreatingTeamDialog(true);
    } else {
      setShowUpgradeDialog(true);
    }
  }

  //   Funtion for openeing the dialog to manage the thing
  async function handleDeleteTeamDialog(teamName: string, teamId: string) {
    setIsComfirmationDeleteDialog((prev) => ({
      team_id: teamId,
      team_name: teamName,
      dialogOpen: true,
      error: "",
    }));
  }

  async function handleDeleteTeam(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const teamName = formData.get("team_name_deletion") as string;

    if (teamName === isComfirmationDeleteDialog.team_name) {
      await deleteTeam(isComfirmationDeleteDialog.team_id);
      setIsComfirmationDeleteDialog({
        team_name: "",
        dialogOpen: false,
        team_id: "",
        error: "",
      });
    } else {
      setIsComfirmationDeleteDialog((prev) => ({
        ...prev,
        error: "Team name doesn't match not able to delete the team",
      }));
    }
  }

  // Notification dialog shit
  const [onOpenNotificationDialog, setOnOpenNotificationDialog] =
    useState<boolean>(false);
  const router = useRouter();

  // Board Shit

  const { createBoard, boards, loading, error, taskCount, deleteBoard } =
    useBoards();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [filters, setFilters] = useState({
    search: "",
    dateRange: {
      start: null as string | null,
      end: null as string | null,
    },
    taskCount: {
      min: null as number | null,
      max: null as number | null,
    },
  });

  const handleTeamInviteCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (inviteCode.length !== 8) {
      toast.error("Please enter the full 8-digit invite code");
      return;
    }

    const promise = joinTeamWithCode(
      inviteCode,
      user?.emailAddresses[0].emailAddress!,
      user?.id!
    );

    toast.promise(promise, {
      loading: "Joining team...",
      success: () => {
        setOpenOtpDialog(false);
        return "Successfully joined the team!";
      },
      error: "Failed to join the team",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center flex-col justify-center w-screen h-screen gap-2">
        <Loader className="text-gray-400 h-20 w-20 animate-spin" />
        <span>Loading your Teams</span>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2>Error Loading Teams</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 ">
      <Navbar showNotification={true} />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back ,{" "}
            {user?.firstName ?? user?.emailAddresses[0].emailAddress}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your Teams
          </p>
        </div>
        {/* Stats */}

        <div className="grid grid-cols-2 lg:grid-cols-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Boards */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    Total Teams
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {teams.length}
                  </p>
                </div>
                <div className="h-10 w-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Trello className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600"></Trello>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    Active Projects
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {/* {teams.length} */}
                  </p>
                </div>
                <div className="h-10 w-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-green-600"></Rocket>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    Recent Activity
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {/* {
                      boards.filter((board) => {
                        const updatedAt = new Date(board.updated_at);
                        const oneWeekAgo = new Date();
                        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                        return updatedAt > oneWeekAgo;
                      }).length
                    } */}
                  </p>
                </div>
                <div className="h-10 w-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ChartColumn className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500"></ChartColumn>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    Total Tasks
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {/* {boardsWithTaskCount.reduce((sum, board) => {
                      return sum + board.taskCount;
                    }, 0)} */}
                  </p>
                </div>
                <div className="h-10 w-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Check className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600"></Check>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Created a txt for the component cause of commentinhg issues  */}

        {/* Teams List */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Your Teams
              </h2>
              <p className="text-gray-600">Manage your teams</p>
              {isFreeUser && (
                <p className="text-gray-500 text-sm mt-1">
                  Free plan : {teams.length}/1 Teams Created or Joined
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center mb-4 sm:mb-6 space-y-2 space-x-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2 rounded-md bg-white border p-1 ">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List />
                </Button>
              </div>

              <Button onClick={() => checkCanCreateTeam()}>
                <Plus />
                Create Team
              </Button>

              <Button onClick={() => setOpenOtpDialog(true)}>
                <Plus />
                Join a team
              </Button>
            </div>
          </div>
          {/* Search Bar */}
          <div className="relative mb-4 sm:mb-6 ">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search boards..."
              className="pl-10"
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>
          {/* Display Boards Grid/List */}
          {teams.length === 0 ? (
            <div>No Team Yet</div>
          ) : viewMode === "grid" ? (
            // Grid View
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
              {teams.map((team, key) => (
                <Link href={`/team/${team.id}`} key={key}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer group ">
                    <CardHeader className="pb-3 ">
                      <div className="flex items-center justify-between">
                        {team.image_url ? (
                          <img
                            src={team.image_url}
                            alt={`${team.team_name} logo`}
                            className="w-10 h-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center">
                            <Users />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteTeamDialog(team.team_name, team.id);
                            }}
                          >
                            {team.admin_id === user?.id ? (
                              <Trash2 className="h-5 w-5" />
                            ) : (
                              ""
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 ">
                      <CardTitle className="text-base sm:text-lg mb-2 group-hover:text-blue-600 transition-colors">
                        {team.team_name}
                      </CardTitle>
                      <CardDescription className="text-xs mb-4">
                        {team.description}
                      </CardDescription>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 space-y-1 mb-4 sm:space-y-0">
                        <span>
                          Created At{" "}
                          {new Date(team.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <CardDescription className="text-xs m-0">
                        <div
                          className={`flex items-center m-0 gap-1 ${
                            team.admin_id === user?.id
                              ? "text-blue-600"
                              : "text-gray-700"
                          }`}
                        >
                          <User
                            className={`h-3 w-3 ${
                              team.admin_id === user?.id
                                ? "text-blue-600"
                                : "text-gray-500"
                            }`}
                          />
                          {team.admin_id === user?.id
                            ? "You"
                            : team.admin_name !== null
                              ? team.admin_name
                              : ""}
                        </div>
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              <Card
                onClick={() => checkCanCreateTeam()}
                className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer"
              >
                <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center h-full min-h-[180px]">
                  <Plus className="h-6 w-6 sm:h-8 text-gray-400 group-hover:text-blue-600 mb-2"></Plus>
                  <p className="text-sm sm:text-base text-gray-600 group-hover:text-blue-600 font-medium">
                    Create new Team
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            // List View
            <div>
              {teams.map((team, key) => (
                <div key={key} className={key > 0 ? "mt-4" : ""}>
                  <Link href={`/team/${team.id}`} key={key}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          {/* Left side: team logo */}
                          <div className="flex items-center gap-2">
                            {team.image_url ? (
                              <img
                                src={team.image_url}
                                alt={`${team.team_name} logo`}
                                className="w-10 h-10 rounded-md object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center">
                                <Users />
                              </div>
                            )}
                          </div>

                          {/* Right side: delete button */}
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteTeamDialog(team.team_name, team.id);
                            }}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent className="p-4 sm:p-6 ">
                        <CardTitle className="text-base sm:text-lg mb-2 group-hover:text-blue-600 transition-colors">
                          {team.team_name}
                        </CardTitle>
                        <CardDescription className="text-xs mb-4">
                          {team.description}
                        </CardDescription>
                        <CardDescription className="text-xs mb-4">
                          {team.admin_name}
                        </CardDescription>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 space-y-1 sm:space-y-0">
                          <span>
                            Created At{" "}
                            {new Date(team.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ))}
              <Card
                onClick={() => checkCanCreateTeam()}
                className="mt-4 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer"
              >
                <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                  <Plus className="h-6 w-6 sm:h-8 text-gray-400 group-hover:text-blue-600 mb-2"></Plus>
                  <p className="text-sm sm:text-base text-gray-600 group-hover:text-blue-600 font-medium">
                    Create new Team
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
          <DialogHeader>
            <DialogTitle>Upgrade to Create More Teams</DialogTitle>
            <p className="text-sm text-gray-600">
              Free users can only create one Teams or Join one team. Upgrade to
              Pro or Enterprise to join/create unlimited teams.
            </p>
          </DialogHeader>
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowUpgradeDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => router.push("/pricing")}>View Plans</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Team Dialog */}
      <Dialog
        open={isCreatingTeamDialog}
        onOpenChange={setIsCreatingTeamDialog}
      >
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
          <DialogHeader>
            <DialogTitle>Create a Team</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTeam}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Enter Team Name</Label>
                <Input id="teamName" name="teamName" required />
              </div>
              <div className="space-y-2">
                <Label>Enter Team Descriptiom</Label>
                <Input id="description" name="description" required />
              </div>
              <div className="space-y-2">
                <Label>Import Team Image</Label>
                <Input
                  type="file"
                  id="imageUrl"
                  name="imageUrl"
                  accept="image/png, image/jpeg"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreatingTeamDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Team</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Otp enter dialog */}
      <Dialog open={openOtpDialog} onOpenChange={setOpenOtpDialog}>
        <DialogContent className="w-[95vw] space-y-4 max-w-[425px] mx-auto">
          <DialogHeader>
            <DialogTitle>Enter the invite code</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTeamInviteCode}>
            <div className="flex justify-center flex-col items-center">
              <InputOTP
                maxLength={8}
                value={inviteCode}
                onChange={setInviteCode}
              >
                <InputOTPGroup>
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <InputOTPSlot key={idx} index={idx} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button variant="default" type="submit">
                Submit
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Verifying for board to be deleted  */}
      <Dialog
        open={isComfirmationDeleteDialog.dialogOpen}
        onOpenChange={(open) =>
          setIsComfirmationDeleteDialog((prev) => ({
            ...prev,
            dialogOpen: open,
          }))
        }
      >
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete the team</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDeleteTeam}>
            <div className="space-y-6">
              <div className="space-y-4">
                <Label>
                  Enter
                  <span className="font-bold">
                    "{isComfirmationDeleteDialog.team_name.trim()}"
                  </span>
                  to delete the team
                </Label>
                <Input
                  id="team_name_deletion"
                  name="team_name_deletion"
                  required
                  placeholder="Input here"
                />
              </div>
              <p className="text-xs text-red-600">
                {isComfirmationDeleteDialog.error !== ""
                  ? isComfirmationDeleteDialog.error
                  : ""}
              </p>
            </div>
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setIsComfirmationDeleteDialog((prev) => ({
                    ...prev,
                    dialogOpen: false,
                  }))
                }
              >
                Cancel
              </Button>
              <Button type="submit" variant={"destructive"}>
                Delete
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DashboardPage;
