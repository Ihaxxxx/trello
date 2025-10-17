"use client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTeam } from "@/lib/hooks/useTeams";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import {
  Crown,
  Loader,
  Loader2,
  Trello,
  Users,
  UserStar,
  UserX,
} from "lucide-react";
import { TeamWithUsers, User } from "@/lib/supabase/modals";
import { useAuth, useUser } from "@clerk/nextjs";
import { UserResource } from "@clerk/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function TeamList({
  teamDetailsWithUsers,
  onRemoveUser,
  clertkUser,
  onInviteUser,
  error,
}: {
  teamDetailsWithUsers: TeamWithUsers;
  onRemoveUser: (team_id: string, user_id: string) => void;
  onInviteUser: (user_email: string) => void;
  clertkUser: UserResource;
  error: string | null;
}) {
  const { user } = useUser();
  const [removeUserDialog, setRemoveUserDialog] = useState({
    dialogOpen: false,
    memberName: "",
    user_id: "",
  });

  const [inviteTeamDialog, setInviteTeamDialog] = useState(false);
  const [inviationError, setInvitationError] = useState("");

  const [backendInvitationError, setBackendInvitationError] = useState<
    string | null
  >(error);

  function handleInviteUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const inputUserEmail = formData.get("email") as string;

    if (clertkUser.emailAddresses[0].emailAddress === inputUserEmail) {
      setInvitationError("You cannot invite your self to the team");
      return;
    }

    const foundUser = teamDetailsWithUsers?.users.find(
      (user) => user.email === inputUserEmail
    );

    if (foundUser) {
      setInvitationError("User already present in the team");
      return;
    } else {
      onInviteUser(inputUserEmail);
      setBackendInvitationError(error);
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex sm:flex-wrap">
        {/* Admin on top */}
        {teamDetailsWithUsers?.users.map((user) =>
          user.id === teamDetailsWithUsers.team_details.admin_id ? (
            <div
              key={user.id}
              className={`m-2 flex flex-col border-2 p-4 rounded w-full sm:w-auto ${
                teamDetailsWithUsers.team_details.admin_id === clertkUser.id
                  ? "border-blue-500"
                  : "border-[#ffbf00]"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={user.image_url || "/placeholder.png"}
                    alt={user.first_name + " " + user.last_name}
                    className="h-16 w-16 sm:h-20 sm:w-20 lg:h-32 lg:w-32 aspect-square rounded-md object-cover"
                  />
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-gray-900">
                      {user.first_name} {user.last_name}
                    </h4>
                    {user.email && (
                      <p className="text-sm text-gray-500">{user.email}</p>
                    )}
                  </div>
                </div>
                <Crown />
              </div>
            </div>
          ) : null
        )}

        {/* Current user */}
        {teamDetailsWithUsers?.users.map((user) =>
          user.id === clertkUser.id &&
          user.id !== teamDetailsWithUsers.team_details.admin_id ? (
            <div
              key={user.id}
              className="m-2 flex flex-col border-2 border-blue-500 p-4 rounded w-full sm:w-auto"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={user.image_url || "/placeholder.png"}
                    alt={user.first_name + " " + user.last_name}
                    className="h-16 w-16 sm:h-20 sm:w-20 lg:h-32 lg:w-32 aspect-square rounded-md object-cover"
                  />
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-gray-900">
                      {user.first_name} {user.last_name}
                    </h4>
                    {user.email && (
                      <p className="text-sm text-gray-500">{user.email}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null
        )}

        {/* Other team members */}
        {teamDetailsWithUsers?.users.map((user) =>
          user.id !== teamDetailsWithUsers.team_details.admin_id &&
          user.id !== clertkUser.id ? (
            <div
              key={user.id}
              className="m-2 flex flex-col border p-4 rounded shadow-sm w-full sm:w-auto"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={user.image_url || "/placeholder.png"}
                    alt={user.first_name + " " + user.last_name}
                    className="h-16 w-16 sm:h-20 sm:w-20 lg:h-32 lg:w-32 aspect-square rounded-md object-cover"
                  />
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-gray-900">
                      {user.first_name} {user.last_name}
                    </h4>
                    {user.email && (
                      <p className="text-sm text-gray-500">{user.email}</p>
                    )}
                  </div>
                </div>
                {teamDetailsWithUsers.team_details.admin_id ===
                  clertkUser.id && (
                  <button
                    onClick={() =>
                      setRemoveUserDialog({
                        dialogOpen: true,
                        memberName:
                          (user.first_name + " " + user.last_name).trim()
                            .length === 0
                            ? user.email
                            : user.first_name + " " + user.last_name,
                        user_id: user.id,
                      })
                    }
                    className="p-2 rounded hover:bg-gray-100 transition"
                  >
                    <UserX />
                  </button>
                )}
              </div>
            </div>
          ) : null
        )}

        {teamDetailsWithUsers?.team_details.admin_id === user?.id ? (
          <div className="w-full">
            <Button
              className="w-full mt-4"
              onClick={() => {
                setInviteTeamDialog(true);
              }}
            >
              Invite someone to your team
            </Button>
          </div>
        ) : (
          ""
        )}
      </div>

      {/* Dialog to remove a member */}
      <Dialog
        open={!!removeUserDialog.dialogOpen}
        onOpenChange={(open) =>
          setRemoveUserDialog((prev) => ({
            ...prev,
            dialogOpen: open,
          }))
        }
      >
        <DialogContent className="w-[95vw] max-width-[425px] mx-auto">
          <DialogHeader>
            <DialogTitle>
              Do you want to remove {removeUserDialog.memberName} from the team
            </DialogTitle>
          </DialogHeader>
          <form action="" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setRemoveUserDialog((prev) => ({
                      ...prev,
                      dialogOpen: false,
                    }))
                  }
                >
                  No
                </Button>
                <Button
                  type="button"
                  variant={"destructive"}
                  onClick={() => {
                    setRemoveUserDialog({
                      dialogOpen: false,
                      memberName: "",
                      user_id: "",
                    });
                    onRemoveUser(
                      teamDetailsWithUsers.team_details.id,
                      removeUserDialog.user_id
                    );
                  }}
                >
                  Yes
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog to invite a memeber */}
      <Dialog
        open={inviteTeamDialog}
        onOpenChange={(open) => {
          // setBackendInvitationError("")
          setInvitationError("");
          setInviteTeamDialog(open);
        }}
      >
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
          <DialogHeader>
            <DialogTitle>Add member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInviteUser}>
            <div className="space-y-2">
              <div className="space-y-4">
                <Label>Enter the email id of the member</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter email  here"
                />
              </div>
              {inviationError !== "" ? (
                <p className="text-xs font-bold text-red-600">
                  {inviationError}
                </p>
              ) : (
                ""
              )}

              {backendInvitationError !== "" ? (
                <p className="text-xs font-bold text-red-600">
                  {backendInvitationError}
                </p>
              ) : (
                ""
              )}
            </div>
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteTeamDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant={"default"}>
                Add
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TeamPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const {
    editTeamTitle,
    teamDetailsWithUsers,
    removeUserFromTeam,
    addInvitationUser,
    error,
    loading,
    leaveTeam,
  } = useTeam(id);

  const { user } = useUser();

  const [teamEditTitleDialog, setTeamEditTitleDialog] = useState(false);
  const [teamTitle, setTeamTitle] = useState<string | undefined>(
    teamDetailsWithUsers?.team_details.team_name
  );

  const [teamLeaveDialog, setTeamLeaveDialog] = useState<boolean>(false);

  const [inviationError, setInvitationError] = useState<string | null>("");

  function handleUpdateTeam(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!teamTitle!.trim() || !teamDetailsWithUsers?.team_details.team_name)
      return;
    editTeamTitle(teamTitle!);
    setTeamEditTitleDialog(false);
  }

  async function handleRemoveUser(team_id: string, user_id: string) {
    await removeUserFromTeam(team_id, user_id);
  }

  async function handleLeaveTeam() {
    const promise = leaveTeam(id, user?.id!);
    toast.promise(promise, {
      loading: "Leaving team...",
      success: () => {
        setTeamLeaveDialog(false);
        router.push("/teams?leftTeam=1");
        return "Successfully left the team";
      },
      error: "Failed to leave the team",
    });
  }

  async function handleInviteUser(user_email: string) {
    setInvitationError("");
    // console.log(teamDetailsWithUsers?.team_details.team_name!);
    await addInvitationUser(
      user_email,
      teamDetailsWithUsers?.team_details.team_name!
    );
    setInvitationError(error);
  }

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
    <>
      <Navbar
        isMember={teamDetailsWithUsers?.team_details.admin_id !== user?.id}
        teamName={teamDetailsWithUsers?.team_details.team_name}
        onEditTeam={() => {
          setTeamEditTitleDialog(true);
          setTeamTitle(teamDetailsWithUsers?.team_details.team_name ?? "");
        }}
        onLeaveTeamClick={() => setTeamLeaveDialog(true)}
      />

      <main>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-4">
          <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center">
                {/* Image and team Name */}
                <div className="flex justify-center items-center gap-2">
                  {teamDetailsWithUsers?.team_details.image_url! ? (
                    <img
                      alt=""
                      src={teamDetailsWithUsers?.team_details.image_url!}
                      className="size-14 shrink-0 rounded-md bg-gray-300 outline-1 -outline-offset-1 outline-black/5"
                    />
                  ) : (
                    <Users className="size-12 " />
                  )}
                  <div className="flex flex-col">
                    <span>Team</span>
                    <h1 className="text-xl font-bold">
                      {teamDetailsWithUsers?.team_details.team_name}
                    </h1>
                  </div>
                </div>

                {/* Admin name */}
                <div className="flex flex-row gap-3">
                  <UserStar /> {teamDetailsWithUsers?.team_details.admin_name}
                </div>
              </div>
            </div>
            <div className="px-4 py-4 sm:px-6">
              <TeamList
                teamDetailsWithUsers={teamDetailsWithUsers!}
                onRemoveUser={handleRemoveUser}
                clertkUser={user!}
                onInviteUser={handleInviteUser}
                error={inviationError}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Dialogs Edit team Name*/}
      <Dialog open={teamEditTitleDialog} onOpenChange={setTeamEditTitleDialog}>
        <DialogContent className="w-[95vw] max-width-[425px] mx-auto">
          <DialogHeader>
            <DialogTitle>Edit team name</DialogTitle>
          </DialogHeader>
          <form action="" className="space-y-4" onSubmit={handleUpdateTeam}>
            <div className="space-y-2">
              <Label htmlFor="boardTitle">Team name</Label>
              <Input
                id="boardTitle"
                value={teamTitle}
                onChange={(e) => setTeamTitle(e.target.value)}
                placeholder="Enter board title...."
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTeamEditTitleDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* to leave team */}
      <Dialog open={teamLeaveDialog} onOpenChange={setTeamLeaveDialog}>
        <DialogContent className="w-[95vw] max-width-[425px] mx-auto">
          <DialogHeader>
            <DialogTitle>Are you sure you want to leave the team</DialogTitle>
          </DialogHeader>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setTeamLeaveDialog(false)}
            >
              No
            </Button>
            <Button
              variant={"destructive"}
              type="button"
              onClick={handleLeaveTeam}
            >
              Yes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TeamPage;
