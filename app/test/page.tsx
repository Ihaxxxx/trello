// "use client";

// import { useEffect } from "react";
// import { createClient } from "@supabase/supabase-js";
// import { useAuth } from "@clerk/nextjs";

// export default function Page() {
//   const supabase = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//   );
//   const { getToken } = useAuth();

//   useEffect(() => {
//     const linkClerkAndSupabase = async () => {
//       // Get Clerk JWT from a template called "supabase"
//       const clerkToken = await getToken({ template: "supabase" });
//       console.log("Clerk token:", clerkToken);

//       // Give Supabase the Clerk token
//       supabase.auth.setSession({
//         access_token: clerkToken!,
//         refresh_token: "", // Clerk tokens don’t use refresh tokens
//       });

//       // Now Supabase queries run as authenticated user
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       console.log("Supabase sees user:", user);
//     };

//     linkClerkAndSupabase();
//   }, []);

//   return <div>Check console</div>;
// }
