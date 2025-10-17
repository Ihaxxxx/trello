"use client";
import { useUser } from "@clerk/nextjs";
import {
  boardDataService,
  boardsService,
  columnService,
  notificationServices,
  taskService,
  teamDataServices,
  teamServices,
} from "../services";
import { useEffect, useState } from "react";
import {
  Board,
  Column,
  ColumnWithTask,
  Task,
  Team,
  User,
} from "../supabase/modals";
import { useSupabase } from "../supabase/SupabaseProvider";
import { cp } from "fs";

// Multiple Boards
export function useBoards() {
  const { user } = useUser();
  const { supabase } = useSupabase();
  const [boards, setBoards] = useState<Board[]>([]);
  const [taskCount, setTaskCount] = useState<
    { boardId: string; taskCount: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadBoards();
  }, [user, supabase]);

  async function loadBoards() {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const boardsData = await boardsService.getBoards(supabase!, user.id);
      const taskCounts = await Promise.all(
        boardsData.map(async (board) => {
          const tasks = await taskService.getTasksByBoard(supabase!, board.id);
          return {
            boardId: board.id,
            taskCount: tasks.length,
          };
        })
      );

      setTaskCount(taskCounts);
      setBoards(boardsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load boards");
    } finally {
      setLoading(false);
    }
  }

  async function createBoard(boardData: {
    title: string;
    description?: string;
    color?: string;
  }) {
    if (!user) throw new Error("user not authenticated");

    try {
      const newBoard = await boardDataService.createBoardWithDefaultColumns(
        supabase!,
        {
          ...boardData,
          userId: user.id,
        }
      );
      const row = [{ user_id: user.id, board_id: newBoard.id, role: "admin" }];
      const addUser = await boardDataService.addUserToUsersBoards(
        supabase!,
        row
      );
      setBoards((prev) => [newBoard, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create board");
    }
  }

  async function deleteBoard(boardId: string) {
    try {
      const updatedBoard = await boardsService.deleteBoard(supabase!, boardId);
      setBoards((prevBoards) =>
        prevBoards.filter((board) => board.id !== boardId)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete board");
    }
  }

  return { boards, loading, taskCount, error, createBoard, deleteBoard };
}

// Single board Data

export function useBoard(boardId: string) {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const [board, setBoard] = useState<Board | null>();

  const [teamDetailsWithUsers, setTeamDetailsWithUsers] = useState<{
    team_details: Team;
    users: User[];
  } | null>(null);

  const [assignedTeamId, setAssignedTeamId] = useState<string | null>();

  const [columns, setColumns] = useState<ColumnWithTask[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBoardDetails() {
      if (boardId) {
        loadBoard();
        getAssignedTeamId();
        if (assignedTeamId) {
          loadTeam(assignedTeamId);
        }
      }
    }
    loadBoardDetails();
  }, [boardId, supabase, assignedTeamId]);

  async function loadBoard() {
    setLoading(true);
    setError(null);
    if (!boardId) return;
    try {
      const data = await boardDataService.getBoardWithColumns(
        supabase!,
        boardId
      );

      setBoard(data.board);
      setColumns(data.columnsWithTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load boards");
    } finally {
      setLoading(false);
    }
  }

  async function getAssignedTeamId() {
    if (!boardId) return;
    try {
      const team_id = await boardDataService.getTeamAssignedTeamId(
        supabase!,
        boardId
      );

      if (team_id !== null) {
        setAssignedTeamId(team_id);
      } else {
        setAssignedTeamId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get the team");
    }
  }

  async function loadTeam(teamId: string) {
    if (!user) return;
    try {
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
      setTeamDetailsWithUsers({
        team_details: team_normal_details,
        users: usersArray,
      });
      return usersArray
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch team");
    }
  }

  async function updateBoard(boardId: string, updates: Partial<Board>) {
    try {
      const updateBoard = await boardsService.updateBoard(
        supabase!,
        boardId,
        updates
      );
      setBoard(updateBoard);
      return updateBoard;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update the board"
      );
    }
  }

  async function createRealTask(
    columnId: string,
    taskData: {
      title: string;
      description?: string;
      assignee?: string;
      dueDate?: string;
      priority: "low" | "medium" | "high";
    }
  ) {
    try {
      const newTask = await taskService.createTask(supabase!, {
        title: taskData.title,
        description: taskData.description || null,
        assignee: taskData.assignee || null,
        due_date: taskData.dueDate || null,
        column_id: columnId,
        sort_order:
          columns?.find((col) => col.id === columnId)?.tasks.length || 0,
        priority: taskData.priority || "medium",
      });
      setColumns((prev) =>
        prev?.map((col) =>
          col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col
        )
      );

      return newTask;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create the task"
      );
    }
  }

  async function moveTask(
    taskId: string,
    newColumnId: string,
    newOrder: number
  ) {
    try {
      await taskService.moveTask(supabase!, taskId, newColumnId, newOrder);
      setColumns((prev) => {
        const newColumns = [...prev];
        // Find and remove the task from old coumns

        let taskToMove: Task | null = null;
        for (const col of newColumns) {
          const taskIndex = col.tasks.findIndex((task) => task.id === taskId);
          if (taskIndex !== -1) {
            taskToMove = col.tasks[taskIndex];
            col.tasks.splice(taskIndex, 1);
            break;
          }
        }

        if (taskToMove) {
          // add task to the new column
          const targetColumn = newColumns.find((col) => col.id === newColumnId);
          if (targetColumn) {
            targetColumn.tasks.splice(newOrder, 0, taskToMove);
          }
        }
        return newColumns;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move the task");
    }
  }

  async function createColumn(title: string) {
    if (!board || !user) throw new Error("Board not loaded");
    try {
      const newColumn = await columnService.createColumn(supabase!, {
        title,
        board_id: board.id,
        sort_order: columns.length,
        user_id: user.id,
      });
      setColumns((prev) => [...prev, { ...newColumn, tasks: [] }]);
      return newColumn;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create column");
    }
  }

  async function updateColumn(columnId: string, title: string) {
    try {
      const updatedColumn = await columnService.updateColumnTitle(
        supabase!,
        columnId,
        title
      );
      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId ? { ...col, ...updatedColumn } : col
        )
      );
      return updatedColumn;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create column");
    }
  }

  async function deleteTask(taskId: string, columnId: string) {
    try {
      const updatedBoard = await taskService.deleteTask(supabase!, taskId);
      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId
            ? { ...col, tasks: col.tasks.filter((task) => task.id !== taskId) }
            : col
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete Task");
    }
  }

  async function editedTask(
    taskId: number,
    editedTaskData: Task,
    columnId: string
  ) {
    const allowed = [
      "id",
      "created_at",
      "title",
      "description",
      "assignee",
      "due_date",
      "priority",
      "sort_order",
      "column_id",
    ];
    const validTaskData = Object.fromEntries(
      Object.entries(editedTaskData).filter(([key]) => allowed.includes(key))
    );
    try {
      const updatedTask = await taskService.editTask(
        supabase!,
        taskId,
        validTaskData as any
      );
      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId
            ? {
                ...col,
                tasks: col.tasks.map((task) =>
                  Number(task.id) === taskId ? editedTaskData : task
                ),
              }
            : col
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update Task");
    }
  }

  async function assignTeamABoard(team_id: string) {
    try {
      const assignedTeam = await boardDataService.AssignTeamABoard(
        supabase!,
        team_id,
        boardId
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update Task");
    }
  }

  async function AssignedTeamUsersBoards(TeamUsers: User[]) {
    try {
      const rows = TeamUsers.map((u) => ({
        user_id: u.id,
        board_id: boardId,
        role: "assignee",
      }));
      const response = await boardDataService.addUserToUsersBoards(
        supabase!,
        rows
      );


    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add users");
    }
  }

  async function sendAssignedBoardNotification(
    board_name: string,
    user_emails : string[]
  ) {
    try {
      const rows = user_emails.map((u) => ({
        email : u,
        type : "team_assign",
        message : `You have been assigned board ${board_name}` , 
        metadata: { board_name },
      }))
      const res = await notificationServices.sendTeamAssigningNotification(supabase!,rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add users");
    }
  }

  return {
    board,
    columns,
    loading,
    error,
    updateBoard,
    createRealTask,
    setColumns,
    moveTask,
    createColumn,
    updateColumn,
    deleteTask,
    editedTask,
    assignTeamABoard,
    assignedTeamId,
    loadTeam,
    teamDetailsWithUsers,
    AssignedTeamUsersBoards,
    sendAssignedBoardNotification
  };
}
