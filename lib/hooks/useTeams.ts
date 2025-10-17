import { useAuth, useUser } from "@clerk/nextjs";
import { useSupabase } from "../supabase/SupabaseProvider";
import { useEffect, useState } from "react";
import { Team, TeamWithUsers, User } from "../supabase/modals";
import {
  notificationServices,
  teamDataServices,
  teamServices,
} from "../services";
import { EmailTemplate } from "@/components/email-template";

export function useTeams() {
  const { supabase } = useSupabase();
  const { user } = useUser();

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    if (user) loadTeams();
  }, [user, supabase]);

  async function loadTeams() {
    if (!user) return;

    try {
      setError(null);
      const teamData = await teamServices.getTeams(supabase!, user.id);
      setTeams(teamData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  }

  async function createTeam(
    teamName: string,
    description: string,
    imageData: File | null
  ) {
    if (!user) return;
    try {
      const createdTeam = await teamServices.createTeam(
        supabase!,
        user.id,
        teamName,
        description,
        user.firstName + " " + user.lastName,
        imageData
      );

      setTeams((prev) => [createdTeam, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create team");
    }
  }

  async function deleteTeam(teamId: string) {
    try {
      const deletedTeam = await teamServices.deleteTeam(supabase!, teamId);
      setTeams((prevTeams) => prevTeams.filter((team) => team.id !== teamId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete board");
    }
  }

  async function joinTeamWithCode(
    inviteCode: string,
    userEmail: string,
    userId: string
  ) {
    try {
      const teamId = await teamDataServices.getTeamOfTheInviteCode(
        supabase!,
        inviteCode,
        userEmail
      );

      const joinedUser = await teamDataServices.addToTeamUsers(
        supabase!,
        userId,
        teamId
      );

      const teamData = await teamServices.getTeams(supabase!, userId);

      setTeams(teamData);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join team");
    }
  }

  return { teams, createTeam, deleteTeam, joinTeamWithCode, loading };
}

export function useTeam(teamId: string) {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState<boolean>();
  const [error, setError] = useState<string | null>(null);
  const [teamDetailsWithUsers, setTeamDetailsWithUsers] = useState<{
    team_details: Team;
    users: User[];
  } | null>(null);

  const { user } = useUser();

  useEffect(() => {
    if (!user || !teamId) return;
    setLoading(true);
    setError(null);
    if (user) loadTeam();
  }, [user, supabase, teamId]);

  async function loadTeam() {
    if (!user) return []; 

    try {
      setLoading(true);
      setError(null);

      const team_normal_details = await teamServices.getTeamDetails(
        supabase!,
        teamId
      );
      const team_users_details = await teamServices.getTeamUsersDetails(
        supabase!,
        teamId
      );

      const usersArray: User[] = team_users_details.flatMap(
        (item) => item.users
      );

      console.log(usersArray)


      setTeamDetailsWithUsers({
        team_details: team_normal_details,
        users: usersArray,
      });


    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch team");
      
    } finally {
      setLoading(false);
    }
  }

  async function editTeamTitle(team_name: string) {
    try {
      const teamData = await teamDataServices.editTeamName(
        supabase!,
        team_name,
        teamId
      );
      setTeamDetailsWithUsers((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          team_details: {
            ...prev.team_details,
            team_name: team_name,
          },
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update team");
    }
  }

  async function removeUserFromTeam(team_id: string, user_id: string) {
    try {
      const removedUser = await teamDataServices.removeUserFromTeam(
        supabase!,
        user_id,
        team_id
      );
      setTeamDetailsWithUsers((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          users: prev.users.filter((user) => user.id !== user_id),
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update team");
    }
  }

  async function addInvitationUser(email: string, team_name: string) {
    try {
      const inviteCode = await teamDataServices.inviteUser(
        supabase!,
        email,
        teamId
      );

      if (inviteCode) {
        const sendInviteNotification =
          await notificationServices.sendInviteNotification(
            supabase!,
            inviteCode,
            email,
            team_name
          );

        return true;
      }
    } catch (err: any) {
      if (err.code === "23505") {
        setError("This user is already invited to the team.");
      } else {
        setError(err.message ?? "Something went wrong while inviting user");
      }
    }
  }

  async function leaveTeam(team_id: string, user_id: string) {
    try {
      await teamDataServices.removeUserFromTeam(supabase!, user_id, team_id);
    } catch (err) {
      throw new Error("Intentional test error");
    }
  }

  return {
    loading,
    error,
    editTeamTitle,
    teamDetailsWithUsers,
    removeUserFromTeam,
    addInvitationUser,
    leaveTeam,
    loadTeam,
  };
}
