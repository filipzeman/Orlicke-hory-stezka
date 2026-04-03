import { getSupabase } from "../../lib/supabase";

export async function POST({ request }) {
  const formData = await request.formData();

  const point_id = formData.get("point_id")?.toString();
  const files = formData.getAll("files");

  const supabase = getSupabase();

  for (const file of files) {
    if (!file || typeof file === "string") continue;

    const buffer = new Uint8Array(await file.arrayBuffer());
    const filePath = `points/${point_id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage.from("images").upload(filePath, buffer, {
      contentType: file.type,
    });

    if (uploadError) continue;

    const { data } = supabase.storage.from("images").getPublicUrl(filePath);

    await supabase.from("images").insert({
      point_id,
      url: data.publicUrl,
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
  });
}
