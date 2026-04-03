import { createSupabaseServerClient } from "../../lib/supabaseServer";

export async function POST({ request, cookies }) {
  const formData = await request.formData();

  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  const supabase = createSupabaseServerClient({ cookies });

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
  });
}
