import { Resend } from "resend";
import { Board, Column, Task, Team, User } from "./supabase/modals";
import { SupabaseClient } from "@supabase/supabase-js";
import React, { ReactElement } from "react";
import { EmailTemplate, EmailTemplateProps } from "@/components/email-template";
import { resend } from "./resend/resend";
// const supabase = createClient();

export const boardsService = {
  // Get single board

  async getBoard(supabase: SupabaseClient, boardId: string): Promise<Board> {
    const { data: poly1, error: poly2 } =
      await supabase!.rpc("requesting_user_id");
    console.log(poly1);

    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("id", boardId)
      .single();
    if (error) throw error;
    return data;
  },
  // Get multiple boards
  async getBoards(supabase: SupabaseClient, user_id: string): Promise<Board[]> {
    // Step 1: Get board IDs assigned to this user
    const { data: assignedBoards, error: assignedError } = await supabase
      .from("users_board")
      .select("board_id")
      .eq("user_id", user_id);

    if (assignedError) throw assignedError;

    const assignedBoardIds = assignedBoards?.map((b) => b.board_id) || [];

    // Step 2: Get boards where user is creator OR assigned
    const { data: boards, error: boardsError } = await supabase
      .from("boards")
      .select("*")
      .in("id", assignedBoardIds.length > 0 ? assignedBoardIds : [-1]) // fallback if no assigned boards
      .or(`user_id.eq.${user_id}`) // include boards user created
      .order("created_at", { ascending: false });

    if (boardsError) throw boardsError;
    console.log(boards)
    return boards || [];
  },
  // Create board
  async createBoard(
    supabase: SupabaseClient,
    board: Omit<Board, "id" | "created_at" | "updated_at">
  ): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .insert(board)
      .select()
      .single();
    if (error) throw error;
    return data || [];
  },

  // Update Board
  async updateBoard(
    supabase: SupabaseClient,
    boardId: string,
    updates: Partial<Board>
  ): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", boardId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Delete board

  async deleteBoard(supabase: SupabaseClient, boardId: string): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .delete()
      .eq("id", boardId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// Columns Services
export const columnService = {
  async getColumns(
    supabase: SupabaseClient,
    boardId: string
  ): Promise<Column[]> {
    const { data, error } = await supabase
      .from("columns")
      .select("*")
      .eq("board_id", boardId)
      .order("sort_order", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createColumn(
    supabase: SupabaseClient,
    column: Omit<Column, "id" | "created_at">
  ): Promise<Column> {
    const { data, error } = await supabase
      .from("columns")
      .insert(column)
      .select()
      .single();
    if (error) throw error;
    return data || [];
  },

  async updateColumnTitle(
    supabase: SupabaseClient,
    columnId: string,
    title: string
  ): Promise<Column> {
    const { data, error } = await supabase
      .from("columns")
      .update({ title })
      .eq("id", columnId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// Task Services
export const taskService = {
  async getTasksByBoard(
    supabase: SupabaseClient,
    boardId: string
  ): Promise<Task[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
          * , columns!inner(board_id)
        `
      )
      .eq("columns.board_id", boardId)
      .order("sort_order", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createTask(
    supabase: SupabaseClient,
    task: Omit<Task, "id" | "created_at" | "updated_at">
  ): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .insert(task)
      .select()
      .single();
    if (error) throw error;
    return data || [];
  },

  async moveTask(
    supabase: SupabaseClient,
    taskId: string,
    newColumnId: string,
    newOrder: number
  ) {
    const { data, error } = await supabase
      .from("tasks")
      .update({ column_id: newColumnId, sort_order: newOrder })
      .eq("id", taskId);
    if (error) throw error;
    return data;
  },

  async deleteTask(supabase: SupabaseClient, taskId: string): Promise<Board> {
    const { data, error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async editTask(
    supabase: SupabaseClient,
    taskId: number,
    taskData: any
  ): Promise<Board> {
    const { data, error } = await supabase
      .from("tasks")
      .update(taskData)
      .eq("id", Number(taskId))
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// Board Data services single data shit
export const boardDataService = {
  async getBoardWithColumns(supabase: SupabaseClient, boardId: string) {
    const [board, columns] = await Promise.all([
      boardsService.getBoard(supabase, boardId),
      columnService.getColumns(supabase, boardId),
    ]);

    if (!board) throw new Error("Board not found");

    const tasks = await taskService.getTasksByBoard(supabase, boardId);
    const columnsWithTasks = columns.map((column) => ({
      ...column,
      tasks: tasks.filter((task) => task.column_id === column.id),
    }));
    return {
      board,
      columnsWithTasks,
    };
  },

  async createBoardWithDefaultColumns(
    supabase: SupabaseClient,
    boardData: {
      title: string;
      description?: string;
      color?: string;
      userId: string;
    }
  ) {
    const board = await boardsService.createBoard(supabase, {
      title: boardData.title,
      description: boardData.description || null,
      color: boardData.color || "bg-blue-500",
      user_id: boardData.userId,
    });

    const defaultColumns = [
      { title: "To Do", sort_order: 0 },
      { title: "In Progress", sort_order: 1 },
      { title: "Review", sort_order: 2 },
      { title: "Done", sort_order: 3 },
    ];

    await Promise.all(
      defaultColumns.map((column) =>
        columnService.createColumn(supabase, {
          ...column,
          board_id: board.id,
          user_id: boardData.userId,
        })
      )
    );
    return board;
  },

  async AssignTeamABoard(
    supabase: SupabaseClient,
    team_id: string,
    board_id: string
  ) {
    const { data, error } = await supabase
      .from("team_boards")
      .insert({
        team_id: team_id,
        board_id: board_id,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getTeamAssignedTeamId(supabase: SupabaseClient, board_id: string) {
    const { data, error } = await supabase
      .from("team_boards")
      .select("*")
      .eq("board_id", board_id)
      .maybeSingle();

    if (error) throw error;
    return data ? data.team_id : null;
  },

  async addUserToUsersBoards(supabase: SupabaseClient, rows: any[]) {
    console.log(rows);
    const { data, error } = await supabase.from("users_board").insert(rows);
    console.log(error);
    if (error) throw error;
  },
};

export const userDataServices = {
  async createUser(supabase: SupabaseClient, userDetails: User) {
    const { data, error } = await supabase
      .from("users")
      .upsert({
        id: userDetails.id,
        email: userDetails.email,
        first_name: userDetails.first_name,
        last_name: userDetails.last_name,
        image_url: userDetails.image_url,
        created_at: userDetails.created_at,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const teamServices = {
  async getTeams(supabase: SupabaseClient, userId: string): Promise<Team[]> {
    const { data, error } = await supabase
      .from("team_users")
      .select(`team_details!inner(*)`)
      .eq("user_id", userId);

    if (error) throw error;

    return (data ?? []).map((row: any) => ({
      id: row.team_details.id,
      team_name: row.team_details.team_name,
      admin_id: row.team_details.admin_id,
      created_at: new Date(row.team_details.created_at),
      description: row.team_details.description,
      admin_name: row.team_details.admin_name,
      image_url: row.team_details.image_url || "",
    }));
  },

  async createTeam(
    supabase: SupabaseClient,
    adminId: string,
    teamName: string,
    description: string,
    adminName: string,
    imageData: File | null
  ): Promise<Team> {
    if (!imageData || imageData.size === 0) {
      const { data, error } = await supabase
        .from("team_details")
        .insert({
          team_name: teamName,
          admin_id: adminId,
          description: description,
          admin_name: adminName,
        })
        .select()
        .single();

      if (error) throw error;
      await teamDataServices.addToTeamUsers(supabase, adminId, data.id);
      return data;
    } else {
      const fileName = await teamDataServices.addImageToBucket(
        supabase,
        imageData,
        adminId
      );
      const fileUrl = await teamDataServices.getImagePublicUrl(
        supabase,
        fileName
      );
      const { data, error } = await supabase
        .from("team_details")
        .insert({
          team_name: teamName,
          admin_id: adminId,
          description: description,
          admin_name: adminName,
          image_url: fileUrl,
        })
        .select()
        .single();

      if (error) throw error;
      await teamDataServices.addToTeamUsers(supabase, adminId, data.id);
      return data;
    }
  },

  async deleteTeam(supabase: SupabaseClient, teamId: string): Promise<Team> {
    //  getting the file path
    const { data: team, error: fetchError } = await supabase
      .from("team_details")
      .select("*")
      .eq("id", teamId)
      .single();
    if (fetchError) throw fetchError;

    //  deleting the image
    if (team.image_url) {
      const filePath = team.image_url.split("/object/public/team_images/")[1];
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from("team_images")
          .remove([filePath]);
        if (storageError) {
          console.warn("Failed to delete image:", storageError);
        }
      }
    }

    // deleteting the whole row
    const { data, error } = await supabase
      .from("team_details")
      .delete()
      .eq("id", teamId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTeamDetails(
    supabase: SupabaseClient,
    team_id: string
  ): Promise<Team> {
    const { data: team_details, error: team_details_error } = await supabase
      .from("team_details")
      .select("*")
      .eq("id", team_id)
      .single();

    if (team_details_error) throw team_details_error;

    return team_details;
  },

  async getTeamUsersDetails(supabase: SupabaseClient, team_id: string) {
    const { data: team_details, error: team_details_error } = await supabase
      .from("team_users")
      .select(
        `
  users!inner(*)
`
      )
      .eq("team_id", team_id);

    if (team_details_error) throw team_details_error;

    return team_details;
  },
};

export const teamDataServices = {
  async addToTeamUsers(
    supabase: SupabaseClient,
    userId: string,
    teamId: string
  ) {
    const { data, error } = await supabase
      .from("team_users")
      .insert({
        team_id: teamId,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async addImageToBucket(
    supabase: SupabaseClient,
    File: File | null,
    admin_id: string
  ) {
    if (!File) {
      throw new Error("No file provided for upload.");
    }
    const fileName = `${Date.now()}-${File.name}`;
    const { data, error } = await supabase.storage
      .from("team_images")
      .upload(fileName, File, {
        cacheControl: "3600",
        upsert: false,
        metadata: {
          owner: admin_id,
        },
      });
    if (error) throw error;
    return fileName;
  },

  async getImagePublicUrl(supabase: SupabaseClient, fileName: string) {
    const { data: publicUrlData } = await supabase.storage
      .from("team_images")
      .getPublicUrl(fileName);
    return publicUrlData.publicUrl;
  },

  async editTeamName(
    supabase: SupabaseClient,
    teamName: string,
    team_id: string
  ) {
    const { data, error } = await supabase
      .from("team_details")
      .update({ team_name: teamName })
      .eq("id", team_id)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async removeUserFromTeam(
    supabase: SupabaseClient,
    user_id: string,
    team_id: string
  ) {
    const { data, error } = await supabase
      .from("team_users")
      .delete()
      .eq("team_id", team_id)
      .eq("user_id", user_id)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async inviteUser(supabase: SupabaseClient, email: string, team_id: string) {
    const { data, error } = await supabase
      .from("team_invitations")
      .insert([{ team_id: team_id, email: email }])
      .select()
      .single();

    if (error) {
      throw error;
    } else {
      return data.invite_code;
    }
  },

  async getTeamOfTheInviteCode(
    supabase: SupabaseClient,
    inviteCode: string,
    email: string
  ) {
    const { data, error } = await supabase
      .from("team_invitations")
      .select("team_id")
      .eq("invite_code", inviteCode)
      .eq("email", email)
      .single();

    if (error) {
      throw error;
    } else {
      return data.team_id;
    }
  },
};

export const notificationServices = {
  async sendInviteNotification(
    supabase: SupabaseClient,
    inviteCode: string,
    email: string,
    team_name: string
  ) {
    const message = `You have been invited to join the team "${team_name}". Use the invite code: ${inviteCode} to accept the invitation.`;

    const { error } = await supabase.from("notifications").insert([
      {
        email,
        type: "team_invite",
        message,
        metadata: { inviteCode, team_name },
      },
    ]);

    console.log(error);

    if (error) throw error;
  },

  async readNotifications(supabase: SupabaseClient, user_email: string) {
    const { data, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("email", user_email)
      .eq("read", false)
      .select("*");

    if (error) throw error;

    return data;
  },

  async getNotifications(supabase: SupabaseClient, userEmail: string) {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("email", userEmail)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async sendTeamAssigningNotification(supabase: SupabaseClient, rows: any[]) {
    console.log(rows);
    const { data, error } = await supabase.from("notifications").insert(rows);
    console.log(error);
    if (error) throw error;
  },
};
