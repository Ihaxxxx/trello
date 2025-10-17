import { UserResource } from "@clerk/types";
import { useSupabase } from "../supabase/SupabaseProvider";
import { useEffect, useState } from "react";
import { notificationServices, userDataServices } from "../services";

export function useNotifications(user: UserResource | null | undefined) {
  const { supabase } = useSupabase();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications , setNotifications] = useState<any | null>(null)

  useEffect(() => {
    if (!user) {
        return
    } else {
      getNotifications(user)
    }
  }, [user, supabase]);

  async function getNotifications(user: UserResource) {
    try {
      const response = await notificationServices.getNotifications(  
        supabase!,
        user.emailAddresses[0].emailAddress
      );

      setNotifications(response)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get notifications");
    }
  }

  async function readNotifications(user: UserResource) {
    try {
      const response = await notificationServices.readNotifications(  
        supabase!,
        user.emailAddresses[0].emailAddress
      );
      setNotifications(response)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read notifications");
    }
  }

  



  return {
    readNotifications,
    notifications,
    
  }
}
