"use client";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, User, UserIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBoard } from "@/lib/hooks/useBoards";
import { ColumnWithTask, Task, User as UserType } from "@/lib/supabase/modals";
import {
  Calendar,
  Loader,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash,
  User as UseIcon,
  UserRoundPen,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import { title } from "process";
import React, { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useTeam, useTeams } from "@/lib/hooks/useTeams";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { useNotifications } from "@/lib/hooks/useNotifications";
const Colors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-green-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-rose-500",
];

function DroppableColumn({
  column,
  children,
  onCreateTask,
  onEditColumn,
}: {
  column: ColumnWithTask;
  children: React.ReactNode;
  onCreateTask: (taskData: any, columnId: string) => Promise<void>;
  onEditColumn: (column: ColumnWithTask) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <>
      <div
        ref={setNodeRef}
        className={`w-full lg:flex-shrink-0 lg:w-80 ${
          isOver ? "bg-blue-500 rounded-lg" : ""
        }`}
      >
        <div
          className={`bg-white rounded-lg shadow-sm border ${
            isOver ? "ring-2 ring-blue-300" : ""
          }`}
        >
          {/* Column Header */}
          <div className="p-3 sm:p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                  {column.title}
                </h3>
                <Badge variant={"secondary"} className="flex-shrink-0 text-xs">
                  {column.tasks.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="flex-shrink-0"
                onClick={() => onEditColumn(column)}
              >
                <MoreHorizontal />
              </Button>
            </div>
          </div>

          {/* Column Content */}
          <div className="p-2">
            {children}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant={"ghost"}
                  className="w-full mt-3 text-gray-500 hover:text-gray-700"
                >
                  <Plus />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-width-[425px] mx-auto">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <p className="text-sm text-gray-600">
                    add a task to the board
                  </p>
                </DialogHeader>
                <form
                  className="space-y-4"
                  onSubmit={(e) => onCreateTask(e, column.id)}
                >
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter Task title"
                    ></Input>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Enter Task Description"
                      rows={3}
                      wrap="soft"
                      className="w-full min-w-0 resize-y overflow-x-hidden"
                      style={{
                        whiteSpace: "pre-wrap", // wrap text
                        wordBreak: "break-word", // break long words
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Assignee</Label>
                    <Input
                      id="assignee"
                      name="assignee"
                      placeholder="Who should do this"
                    ></Input>
                  </div>

                  <div>
                    <Label>Priority</Label>
                    <Select name="priority" defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                        <SelectContent>
                          {["low", "medium", "high"].map((priority, key) => (
                            <SelectItem key={key} value={priority}>
                              {priority.charAt(0).toUpperCase() +
                                priority.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectTrigger>
                    </Select>
                  </div>

                  <div>
                    <Label>Due Date</Label>
                    <Input type="date" id="dueDate" name="dueDate" />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="submit">Create Task</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  );
}

function SortableTask({
  task,
  boardId,
  columnId,
  onDeleteTask,
  onEditTask,
}: {
  task: Task;
  boardId: string | undefined;
  columnId: string;
  onDeleteTask: (taskId: string, columnId: string) => Promise<void>;
  onEditTask: (
    taskId: number,
    editedTask: Task,
    columnId: string
  ) => Promise<void>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  // for editing task
  const [viewTask, setViewTask] = useState<boolean>(false);

  const [editedTask, setEditedTask] = useState(task);

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  const styles = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  function grtPriotiyColor(priority: "low" | "medium" | "high"): string {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-yellow-500";
    }
  }

  // Handle Changes for the tasks
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setEditedTask((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmitEditTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (JSON.stringify(editedTask) !== JSON.stringify(task)) {
      onEditTask(Number(task.id), editedTask, columnId);
      setViewTask(false);
    } else {
      setEditedTask(task);
      setViewTask(false);
    }
  }

  return (
    <>
      <div
        className=""
        ref={setNodeRef}
        style={styles}
        {...listeners}
        {...attributes}
      >
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-2 sm:space-y-3">
              {/* Task header */}
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 text-sm leading-tight min-w-0 pr-2">
                    {task.title}
                  </h4>
                </div>
                <div>
                  <Button
                    variant={"ghost"}
                    onClick={() => onDeleteTask(task.id, columnId)}
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                  <Button variant={"ghost"} onClick={() => setViewTask(true)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {/* Task description */}
              <p className="text-xs text-gray-600 line-clamp-2">
                {task.description || "No description."}
              </p>

              {/* Task Meta data */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                  {task.assignee && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <User className="h-3 w-3" />
                      <span className="truncate">{task.assignee}</span>
                    </div>
                  )}
                  {task.due_date && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />{" "}
                      <span className="truncate">{task.due_date}</span>{" "}
                    </div>
                  )}
                </div>
                <div
                  className={`w-2 h-2 mr-4 rounded-full flex-shrink-0 ${grtPriotiyColor(
                    task.priority
                  )}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* dialog for view Task Edits */}
      <Dialog open={viewTask} onOpenChange={setViewTask}>
        <DialogContent className="w-[95vw] max-width-[425px] mx-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <p className="text-sm text-gray-600">Enter the changes</p>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmitEditTask}>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                id="title"
                name="title"
                value={editedTask.title || ""}
                onChange={handleChange}
                placeholder="Enter Task title"
              ></Input>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                id="description"
                name="description"
                value={editedTask.description || ""}
                onChange={handleChange}
                placeholder="Enter Task Description"
                rows={3}
                wrap="soft"
                className="w-full min-w-0 resize-y overflow-x-hidden"
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Input
                value={editedTask.assignee || ""}
                id="assignee"
                name="assignee"
                placeholder="Who should do this"
                onChange={handleChange}
              ></Input>
            </div>

            <div>
              <Label>Priority</Label>
              <Select name="priority" defaultValue={editedTask.priority}>
                <SelectTrigger>
                  <SelectValue />
                  <SelectContent>
                    {["low", "medium", "high"].map((priority, key) => (
                      <SelectItem key={key} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectTrigger>
              </Select>
            </div>

            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                id="dueDate"
                name="dueDate"
                value={editedTask.due_date || ""}
                placeholder={` ${
                  editedTask.assignee === ""
                    ? "No assignee"
                    : editedTask.assignee
                }`}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TaskOverlay({ task }: { task: Task }) {
  function grtPriotiyColor(priority: "low" | "medium" | "high"): string {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-yellow-500";
    }
  }

  return (
    <>
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-2 sm:space-y-3">
            {/* Task header */}
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1 min-w-0 pr-2">
                {task.title}
              </h4>
            </div>
            {/* Task description */}
            <p className="text-xs text-gray-600 line-clamp-2">
              {task.description || "No description."}
            </p>

            {/* Task Meta data */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                {task.assignee && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <User className="h-3 w-3" />
                    <span className="truncate">{task.assignee}</span>
                  </div>
                )}
                {task.due_date && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />{" "}
                    <span className="truncate">{task.due_date}</span>{" "}
                  </div>
                )}
              </div>
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${grtPriotiyColor(
                  task.priority
                )}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const {
    board,
    updateBoard,
    columns,
    createRealTask,
    setColumns,
    moveTask,
    createColumn,
    updateColumn,
    deleteTask,
    editedTask,
    loading: loadingBoard,
    assignTeamABoard,
    assignedTeamId,
    loadTeam,
    teamDetailsWithUsers,
    AssignedTeamUsersBoards,
    sendAssignedBoardNotification,
  } = useBoard(id);

  const { user: ClerkUser } = useUser();

  const { teams } = useTeams();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState("");

  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  const [isCreatingColumn, setIsCreatingColumn] = useState<boolean>(false);

  const [isEditingColumn, setIsEditingColumn] = useState<boolean>(false);

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [openAddTeamDialog, setOpenAddTeamDialog] = useState<boolean>(false);

  const [filters, setFilters] = useState({
    priority: [] as string[],
    assignee: [] as string[],
    dueDate: null as string | null,
  });

  function handleFilterChange(
    type: "priority" | "assignee" | "dueDate",
    value: string | string[] | null
  ) {
    setFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  }

  function clearFilters() {
    setFilters({
      priority: [] as string[],
      assignee: [] as string[],
      dueDate: null as string | null,
    });
  }

  const [newColumnTitle, setNewColumnTitle] = useState<string>("");
  const [editingColumnTitle, setEditingColumnTitle] = useState("");
  const [editingColumn, setEditingColumn] = useState<ColumnWithTask | null>(
    null
  );

  const sesors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  async function handleUpdateBoard(e: React.FormEvent) {
    e.preventDefault();

    if (!newTitle.trim() || !board) return;
    try {
      await updateBoard(board.id, {
        title: newTitle.trim(),
        color: newColor || board.color,
      });
      setIsEditingTitle(false);
    } catch (error) {}
  }

  async function createTask(
    taskData: {
      title: string;
      description?: string;
      assignee?: string;
      dueDate?: string;
      priority: "low" | "medium" | "high";
    },
    columnId: string
  ) {
    const targetColumn = columns![0];
    if (!targetColumn) {
      throw new Error("No column available to add task");
    }
    if (columnId === "0") {
      await createRealTask(targetColumn.id, taskData);
    } else {
      await createRealTask(columnId, taskData);
    }
  }
  async function handleCreateTask(
    e: React.FormEvent<HTMLFormElement>,
    columnId: string
  ) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const taskData = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      assignee: (formData.get("assignee") as string) || undefined,
      dueDate: (formData.get("dueDate") as string) || undefined,
      priority:
        (formData.get("priority") as "low" | "medium" | "high") || "medium",
    };

    if (taskData.title.trim()) {
      await createTask(taskData, columnId);
    }

    const trigger = document.querySelector(
      '[data-state="open"]'
    ) as HTMLElement;
    if (trigger) trigger.click();
  }

  // Moving Stuff

  function handleDragStart(event: DragStartEvent) {
    const taskId = event.active.id as string;
    const task = columns
      .flatMap((col) => col.tasks)
      .find((task) => task.id === taskId);

    if (task) {
      setActiveTask(task);
    }
  }
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceColumn = columns.find((col) =>
      col.tasks.some((task) => task.id == activeId)
    );

    const targetColumn = columns.find((col) =>
      col.tasks.some((task) => task.id == overId)
    );

    if (!sourceColumn || !targetColumn) return;

    if (sourceColumn.id === targetColumn.id) {
      const activeIndex = sourceColumn.tasks.findIndex(
        (task) => task.id === activeId
      );

      const overIndex = targetColumn.tasks.findIndex(
        (task) => task.id === overId
      );

      if (activeIndex !== overIndex) {
        setColumns((prev: ColumnWithTask[]) => {
          const newColumns = [...prev];
          const column = newColumns.find((col) => col.id === sourceColumn.id);
          if (column) {
            const tasks = [...column.tasks];
            const [removed] = tasks.splice(activeIndex, 1);
            tasks.splice(overIndex, 0, removed);
            column.tasks = tasks;
          }
          return newColumns;
        });
      }
    }
  }
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    const targetColumn = columns.find((col) => col.id == overId);

    if (targetColumn) {
      const sourceColumn = columns.find((col) =>
        col.tasks.some((task) => task.id == taskId)
      );

      if (sourceColumn && sourceColumn.id !== targetColumn.id) {
        await moveTask(taskId, targetColumn.id, targetColumn.tasks.length);
      }
    } else {
      //  Check to see if we are dropping on another task
      const sourceColumn = columns.find((col) =>
        col.tasks.some((task) => task.id == taskId)
      );

      const targetColumn = columns.find((col) =>
        col.tasks.some((task) => task.id == overId)
      );

      if (sourceColumn && targetColumn) {
        const oldIndex = sourceColumn.tasks.findIndex(
          (task) => task.id === taskId
        );

        const newIndex = targetColumn.tasks.findIndex(
          (task) => task.id === overId
        );

        if (oldIndex !== newIndex) {
          await moveTask(taskId, targetColumn.id, newIndex);
        }
      }
    }
  }

  async function handleCreateColumn(e: React.FormEvent) {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    await createColumn(newColumnTitle.trim());

    setNewColumnTitle("");
    setIsCreatingColumn(false);
  }

  async function handleUpdateColumn(e: React.FormEvent) {
    e.preventDefault();

    if (!editingColumnTitle.trim() || !editingColumn) return;

    await updateColumn(editingColumn?.id, editingColumnTitle.trim());

    setEditingColumnTitle("");
    setIsEditingColumn(false);
    setEditingColumn(null);
  }

  function handleEditColumn(column: ColumnWithTask) {
    setIsEditingColumn(true);
    setEditingColumn(column);
    setEditingColumnTitle(column.title);
  }

  const filteredColumns = columns.map((columns) => ({
    ...columns,
    tasks: columns.tasks.filter((task) => {
      // Filter by priority
      if (
        filters.priority.length > 0 &&
        !filters.priority.includes(task.priority.toLowerCase())
      ) {
        return false;
      }

      // filter by due date

      if (filters.dueDate && task.due_date) {
        const taskDate = new Date(task.due_date).toDateString();
        const filteredDate = new Date(filters.dueDate).toDateString();
        if (taskDate !== filteredDate) {
          return false;
        }
      }

      return true;
    }),
  }));

  async function handleTaskDelete(taskId: string, columnId: string) {
    await deleteTask(taskId, columnId);
  }

  async function handleTaskEdit(
    taskId: number,
    editedTaskData: Task,
    columnId: string
  ) {
    await editedTask(taskId, editedTaskData, columnId);
  }
  

  async function handleAssignTeam(team_id: string) {
    try {
      toast.loading("Assigning team...");

      // Step 1: Assign the team to the board
      await assignTeamABoard(team_id);

      setOpenAddTeamDialog(false);
      toast.success("Team assigned successfully!");

      // Step 2: Load team details
      toast.loading("Loading team details...");
      const teamData = await loadTeam(team_id);
      toast.success("Team details loaded!");

      if (!teamData) throw new Error("No team data returned");

      // Step 3: Filter out the admin
      const usersWithoutAdmin = teamData.filter(
        (user) => user.id !== ClerkUser?.id
      );

      // Step 4: Assign users to board
      toast.loading("Assigning users to board...");
      await AssignedTeamUsersBoards(usersWithoutAdmin);
      toast.success("Users assigned successfully!");

      // Step 5: Send notifications
      const emails = usersWithoutAdmin.map((user) => user.email);
      await sendAssignedBoardNotification(board?.title!, emails);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (loadingBoard) {
    return (
      <div className="flex items-center flex-col justify-center w-screen h-screen gap-2">
        <Loader className="text-gray-400 h-20 w-20 animate-spin" />
        <span>Loading your Boards</span>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Navbar
          boardTitle={board?.title}
          onEditBoard={() => {
            setNewTitle(board?.title ?? "");
            setNewColor(board?.color ?? "");
            setIsEditingTitle(true);
          }}
          onfilterClick={() => setIsFilterOpen(true)}
          filterCount={Object.values(filters).reduce(
            (count, v) =>
              count + (Array.isArray(v) ? v.length : v !== null ? 1 : 0),
            0
          )}
        />

        <Dialog open={isEditingTitle} onOpenChange={setIsEditingTitle}>
          <DialogContent className="w-[95vw] max-width-[425px] mx-auto">
            <DialogHeader>
              <DialogTitle>Edit Board</DialogTitle>
            </DialogHeader>
            <form action="" className="space-y-4" onSubmit={handleUpdateBoard}>
              <div className="space-y-2">
                <Label htmlFor="boardTitle">Board Title</Label>
                <Input
                  id="boardTitle"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Enter board title...."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="boardColor">Board Colour</Label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {Colors.map((color, key) => (
                    <button
                      type="button"
                      key={key}
                      className={`w-8 h-8 rounded-full ${color} ${
                        color === newColor ? "ring-2 ring-offset-2" : ""
                      }`}
                      onClick={() => setNewColor(color)}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditingTitle(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DialogContent className="w-[95vw] max-width-[425px] mx-auto">
            <DialogHeader>
              <DialogTitle>Filter Tasks</DialogTitle>
              <p className="text-sm text-gray-600">
                Filter tasks by priority , assignee , or due date
              </p>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <div className="flex flex-wrap gap-2">
                  {["low", "medium", "high"].map((priority, key) => (
                    <Button
                      key={key}
                      variant={
                        filters.priority.includes(priority)
                          ? "outline"
                          : "default"
                      }
                      size={"sm"}
                      onClick={() => {
                        const newPriorities = filters.priority.includes(
                          priority
                        )
                          ? filters.priority.filter((p) => p !== priority)
                          : [...filters.priority, priority];
                        handleFilterChange("priority", newPriorities);
                      }}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              {/* <div className="space-y-2">
                <Label>Assignee</Label>
                <div className="flex flex-wrap gap-2">
                  {["low", "medium", "high"].map((priority, key) => (
                    <Button key={key} variant={"outline"} size={"sm"}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Button>
                  ))}
                </div>
              </div> */}
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={filters.dueDate || ""}
                  onChange={(e) =>
                    handleFilterChange("dueDate", e.target.value || null)
                  }
                />
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant={"outline"}
                    onClick={clearFilters}
                  >
                    Clear Filter
                  </Button>
                  <Button type="button" onClick={() => setIsFilterOpen(false)}>
                    Apply Filter
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Board Content */}
        <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 ">
          {/* Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
            <div className="flex flex-col flex-wrap gap-4">
              {teamDetailsWithUsers ? (
                <div className="flex flex-row items-center gap-2">
                  {teamDetailsWithUsers.team_details.image_url ? (
                    <img
                      src={teamDetailsWithUsers.team_details.image_url}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <Users className="w-8 h-8" />
                  )}
                  <span className="font-medium text-2xl">
                    {teamDetailsWithUsers.team_details.team_name}
                  </span>
                </div>
              ) : null}

              <div className="text-sm text-gray-600">
                <span className="font-medium">Total Tasks: </span>
                {columns?.reduce((sum, col) => sum + col.tasks.length, 0)}
              </div>
            </div>
            <div className="flex gap-2">
              {!teamDetailsWithUsers ? (
                <Dialog
                  open={openAddTeamDialog}
                  onOpenChange={setOpenAddTeamDialog}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">
                      <Plus />
                      Assign Team
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-width-[425px] mx-auto">
                    <DialogHeader className="items-center">
                      <DialogTitle>Your Teams</DialogTitle>
                    </DialogHeader>
                    <fieldset>
                      <div className="mt-4 divide-y divide-gray-200 border-b border-t border-gray-200">
                        {teams.map((team, idx) => (
                          <div
                            key={idx}
                            className="relative flex items-center flex-1 gap-3 py-4 flex-row justify-between"
                          >
                            <div className="min-w-0 text-sm/6 flex flex-row gap-3">
                              <div>
                                {team.image_url !== "" ? (
                                  <img src={team.image_url!} />
                                ) : (
                                  <Users className="size-5" />
                                )}
                              </div>
                              <div>
                                <label
                                  htmlFor={`person-${team.id}`}
                                  className="select-none font-medium text-gray-900"
                                >
                                  {team.team_name}
                                </label>
                              </div>
                            </div>
                            <div>
                              <Button
                                className="bg-blue-600"
                                onClick={() => handleAssignTeam(team.id)}
                              >
                                Assign
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </fieldset>
                  </DialogContent>
                </Dialog>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-blue-600 sm:w-auto">
                      View Team
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-width-[425px] mx-auto">
                    <DialogHeader className="items-center">
                      <DialogTitle>Your Team</DialogTitle>
                    </DialogHeader>

                    <fieldset>
                      <div className="mt-4 divide-y divide-gray-200 border-b border-t border-gray-200">
                        {[
                          // Place the admin first, others after
                          ...teamDetailsWithUsers.users.filter(
                            (u) =>
                              u.id ===
                              teamDetailsWithUsers.team_details.admin_id
                          ),
                          ...teamDetailsWithUsers.users.filter(
                            (u) =>
                              u.id !==
                              teamDetailsWithUsers.team_details.admin_id
                          ),
                        ].map((user, idx) => {
                          const isAdmin =
                            user.id ===
                            teamDetailsWithUsers.team_details.admin_id;
                          const isYou = user.id === ClerkUser?.id;

                          return (
                            <div
                              key={idx}
                              className={`relative flex items-center gap-3 py-3 px-2 flex-row justify-between rounded-md
            ${isYou ? "border border-blue-500 bg-blue-50" : "hover:bg-gray-50"}`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                  {user.image_url ? (
                                    <img
                                      src={user.image_url}
                                      alt={user.email}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <UserIcon className="w-5 h-5 text-gray-500" />
                                  )}
                                </div>
                                <div className="flex items-center gap-1 truncate">
                                  <span className="font-medium text-gray-900 truncate">
                                    {isYou ? "You" : user.email}
                                  </span>
                                  {isAdmin && (
                                    <Crown className="w-4 h-4 text-yellow-500" />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </fieldset>
                  </DialogContent>
                </Dialog>
              )}
              {/* Assign to a team */}

              {/* Add Task */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-width-[425px] mx-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <p className="text-sm text-gray-600">
                      add a task to the board
                    </p>
                  </DialogHeader>
                  {/* This one is the global task create to first column so thats why passing columnId 0 */}
                  <form
                    className="space-y-4"
                    onSubmit={(e) => handleCreateTask(e, "0")}
                  >
                    <div className="space-y-2">
                      <Label>Title *</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="Enter Task title"
                      ></Input>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Enter Task Description"
                        rows={3}
                        wrap="soft"
                        className="w-full min-w-0 resize-y overflow-x-hidden"
                        style={{
                          whiteSpace: "pre-wrap", // wrap text
                          wordBreak: "break-word",
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Assignee</Label>
                      <Input
                        id="assignee"
                        name="assignee"
                        placeholder="Who should do this"
                      ></Input>
                    </div>

                    <div>
                      <Label>Priority</Label>
                      <Select name="priority" defaultValue="medium">
                        <SelectTrigger>
                          <SelectValue />
                          <SelectContent>
                            {["low", "medium", "high"].map((priority, key) => (
                              <SelectItem key={key} value={priority}>
                                {priority.charAt(0).toUpperCase() +
                                  priority.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </SelectTrigger>
                      </Select>
                    </div>

                    <div>
                      <Label>Due Date</Label>
                      <Input type="date" id="dueDate" name="dueDate" />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="submit">Create Task</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Board Columns */}

          <DndContext
            sensors={sesors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div
              className="flex flex-col lg:flex-row lg:space-x-6 lg:overflow-x-auto 
            lg:pb-6 lg:px-2 lg:-mx-2 lg:[&::-webkit-scrollbar]:h-2 
            lg:[&::-webkit-scrollbar-track]:bg-gray-100 
            lg:[&::-webkit-scrollbar-thumb]:bg-gray-300 lg:[&::-webkit-scrollbar-thumb]:rounded-full 
            space-y-4 lg:space-y-0"
            >
              {filteredColumns.map((column, key) => (
                <DroppableColumn
                  key={key}
                  column={column}
                  onCreateTask={handleCreateTask}
                  onEditColumn={handleEditColumn}
                >
                  <SortableContext
                    items={column.tasks.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {column.tasks.map((task, key) => (
                        <SortableTask
                          task={task}
                          boardId={board?.id}
                          columnId={column.id}
                          key={key}
                          onDeleteTask={handleTaskDelete}
                          onEditTask={handleTaskEdit}
                        ></SortableTask>
                      ))}
                    </div>
                  </SortableContext>
                </DroppableColumn>
              ))}

              <div className="w-full flex-shrink-0 lg:w-80">
                <Button
                  variant={"outline"}
                  className="w-full h-full min-h-[200px] border-dashed border-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setIsCreatingColumn(true)}
                >
                  <Plus />
                  Add another list
                </Button>
              </div>

              <DragOverlay>
                {activeTask ? <TaskOverlay task={activeTask} /> : null}
              </DragOverlay>
            </div>
          </DndContext>
        </main>
      </div>

      {/* Creating a new column */}
      <Dialog open={isCreatingColumn} onOpenChange={setIsCreatingColumn}>
        <DialogContent className="w-[95vw] max-width-[425px] mx-auto">
          <DialogHeader>
            <DialogTitle>Create new Column</DialogTitle>
            <p className="text-sm text-gray-600">
              Add new column to organize your tasks
            </p>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateColumn}>
            <div className="space-y-2">
              <Label>Column Title</Label>
              <Input
                id="columnTitle"
                value={editingColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Enter column title... "
                required
              />
            </div>
            <div className="space-x-4 flex justify-end">
              <Button
                type="button"
                onClick={() => setIsCreatingColumn(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button type="submit">Create Column</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* change the name of the column */}

      <Dialog open={isEditingColumn} onOpenChange={setIsEditingColumn}>
        <DialogContent className="w-[95vw] max-width-[425px] mx-auto">
          <DialogHeader>
            <DialogTitle>Edit Column</DialogTitle>
            <p className="text-sm text-gray-600">
              Update the title of your column
            </p>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleUpdateColumn}>
            <div className="space-y-2">
              <Label>Column Title</Label>
              <Input
                id="columnTitle"
                value={editingColumnTitle}
                onChange={(e) => setEditingColumnTitle(e.target.value)}
                placeholder="Enter column title... "
                required
              />
            </div>
            <div className="space-x-4 flex justify-end">
              <Button
                type="button"
                onClick={() => {
                  setIsEditingColumn(false);
                  setEditingColumnTitle("");
                  setEditingColumn(null);
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button type="submit">Edit Column</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default BoardPage;
