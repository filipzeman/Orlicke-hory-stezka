import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function sync() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Data!A3:V", // adjust if columns change
  });

  const rows = res.data.values;

  for (const row of rows) {
    const id = row[0];

    // skip empty rows
    if (!id) continue;

    // skip inactive rows
    if (row[21] !== "TRUE" && row[21] !== true) continue;

    const point = {
      id: row[0],
      location_id: row[1],
      location_name: row[2],
      km: parseFloat(row[3]),

      point_name: row[4],
      crossroad_number: row[5],
      category: row[6],
      type: row[7],

      date: row[8],
      author: row[9],
      

      phone: row[10],
      email: row[11],
      website: row[12],
      opening_info: row[13],

      elevation: row[14] ? parseInt(row[14]) : null,
      latitude: row[15] ? parseFloat(row[15]) : null,
      longitude: row[16] ? parseFloat(row[16]) : null,

      navigation_color: row[17],
      note: row[18],

      hikers_welcome: row[19] === "ano",

      photo: row[20],
      active: row[21]
    };

    const { error } = await supabase
      .from("points")
      .upsert(point, { onConflict: "id" });

    if (error) {
      console.error("Error syncing", id, error);
    } else {
      console.log("Synced", id);
    }
  }

  console.log("Sync complete");
}

sync();