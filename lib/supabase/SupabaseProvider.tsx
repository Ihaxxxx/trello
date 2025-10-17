"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useAuth, useSession } from "@clerk/nextjs";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type SupabaseContext = {
  supabase: SupabaseClient | null;
  isLoaded: boolean;
};

const Context = createContext<SupabaseContext>({
  supabase: null,
  isLoaded: false,
});

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = useSession();


//   const { getToken } = useAuth();
//   const logToken = async () => {
//       const token = await getToken({ template: "supabase" });
//       console.log("JWT Token:", token);
//     };
//     logToken()



  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  useEffect(() => {
    if (!session) return;
    const client = createClient(supabaseUrl!, supabaseKey!, {
      accessToken: async () => session?.getToken() ?? null,
    });
    setSupabase(client);
    setIsLoaded(true);
  }, [session]);
  return (
    <Context.Provider value={{ supabase, isLoaded }}>
      {" "}
      {children}{" "}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error("use supababse needs to be inside the provider");
  }
  return context;
};

