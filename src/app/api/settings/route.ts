import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, settings } from "@/lib/db";
import { eq } from "drizzle-orm";

// Available settings keys (internal use only)
const SETTINGS_KEYS = [
  "theme",
  "default_model",
  "ollama_base_url",
  "anthropic_api_key",
  "openai_api_key",
  "context_include_docs",
  "context_include_sprint",
  "context_max_docs",
] as const;

const updateSettingsSchema = z.record(z.string(), z.string().nullable());

// GET /api/settings - Get all settings
export async function GET() {
  try {
    const allSettings = await db.select().from(settings);

    // Convert to object format
    const settingsMap: Record<string, string | null> = {};
    for (const setting of allSettings) {
      settingsMap[setting.key] = setting.value;
    }

    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json(
      { error: { code: "FETCH_FAILED", message: "Failed to fetch settings" } },
      { status: 500 }
    );
  }
}

// PATCH /api/settings - Update one or more settings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const result = updateSettingsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", issues: result.error.issues } },
        { status: 400 }
      );
    }

    const updates = result.data;
    const now = new Date();

    for (const [key, value] of Object.entries(updates)) {
      if (value === null) {
        // Delete the setting
        await db.delete(settings).where(eq(settings.key, key));
      } else {
        // Upsert the setting
        const [existing] = await db.select().from(settings).where(eq(settings.key, key));

        if (existing) {
          await db.update(settings)
            .set({ value, updatedAt: now })
            .where(eq(settings.key, key));
        } else {
          await db.insert(settings)
            .values({ key, value, updatedAt: now });
        }
      }
    }

    // Return updated settings
    const allSettings = await db.select().from(settings);
    const settingsMap: Record<string, string | null> = {};
    for (const setting of allSettings) {
      settingsMap[setting.key] = setting.value;
    }

    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json(
      { error: { code: "UPDATE_FAILED", message: "Failed to update settings" } },
      { status: 500 }
    );
  }
}
