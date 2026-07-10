import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("avatar") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "File dan userId wajib diisi." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File harus berupa gambar." },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran maksimal 5MB." },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop() || "jpg";

    const filename = `${userId}-${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filename, Buffer.from(arrayBuffer), {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error(uploadError);

      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filename);

    const avatarUrl = data.publicUrl;

    const user = await db.user.update({
      where: {
        id: userId,
      },
      data: {
        avatar: avatarUrl,
      },
    });

    return NextResponse.json({
      success: true,
      avatarUrl,
      user,
    });

  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message || "Upload avatar gagal",
      },
      {
        status: 500,
      }
    );
  }
}