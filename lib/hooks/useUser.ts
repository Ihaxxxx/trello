import { UserResource } from "@clerk/types";
import { useSupabase } from "../supabase/SupabaseProvider";
import { useEffect, useState } from "react";
import { userDataServices } from "../services";

export function useUsers(user: UserResource | null | undefined) {
  const { supabase } = useSupabase();
  const [error, setError] = useState<string | null>(null);
  const [notifications , setNotifications] = useState<any | null>(null)

  useEffect(() => {
    if (!user) {
        return
    } else {
      addUserToSupabaseDB(user);
    }
  }, [user, supabase]);

  async function addUserToSupabaseDB(user: UserResource) {
    try {
      const userDetails = {
        id: user.id,
        email: user.emailAddresses[0].emailAddress,
        first_name: user.firstName,
        last_name: user.lastName,
        image_url: user.imageUrl,
        created_at: user.createdAt,
      };
      const response = await userDataServices.createUser(  
        supabase!,
        userDetails
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create board");
    }
  }
}
