import { Toaster } from "@/components/ui/sonner";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import { Bell, Copy } from "lucide-react";
import { Button } from "./ui/button";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { toast } from "sonner";

export default function NotificationBar() {
  const { user } = useUser();
  const { notifications , readNotifications } = useNotifications(user);

  const [localNotifications, setLocalNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (notifications) {
      setLocalNotifications(notifications);
    }
  }, [notifications]);

  const handleCopy = async (e: React.MouseEvent, inviteCode: string) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(inviteCode);
    toast.success("Invite code copied");
  };

  const handleReadNotifications = async () => {
    const unreadCount = localNotifications.filter((n) => !n.read).length;

    if (unreadCount > 0) {
      console.log("meow")
      readNotifications(user!)
    }

  };

  return (
    <>
      <DropdownMenu
        onOpenChange={(open) => {
          if (open) {
            handleReadNotifications();
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative h-7 w-7 flex-shrink-0 p-0 "
          >
            <Bell className="h-5 w-5" />
            {localNotifications.filter((n) => !n.read).length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                {localNotifications.filter((n) => !n.read).length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-72 max-h-80 overflow-y-auto rounded-xl shadow-lg bg-white border border-gray-200"
        >
          <div className="px-3 py-2 border-b border-gray-100 font-semibold text-gray-700">
            Notifications
          </div>

          {localNotifications.length > 0 ? (
            localNotifications.map((n, idx) => (
              <DropdownMenuItem
                key={idx}
                className={`cursor-pointer px-3 py-2 text-sm rounded-md transition-colors ${
                  n.read
                    ? "text-gray-400 bg-gray-50 hover:bg-gray-100"
                    : "text-gray-900 font-semibold bg-white hover:bg-blue-100"
                }`}
              >
                <span
                  className={`mr-2 h-2 w-2 rounded-full inline-block ${
                    n.read ? "bg-gray-300" : "bg-blue-500"
                  }`}
                ></span>
                {n.message ?? "New notification"}
                {n.type === "team_invite" ? (
                  <div
                    onClick={(e) => {
                      handleCopy(e, n.metadata.inviteCode);
                    }}
                    className="flex items-center gap-1 cursor-pointer text-gray-700 hover:text-blue-700"
                  >
                    <span>Copy Code</span>
                    <Copy className="h-4 w-4" />
                  </div>
                ) : null}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem
              disabled
              className="px-3 py-2 text-sm text-gray-500"
            >
              No notifications
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
