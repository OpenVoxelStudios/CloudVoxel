import { auth } from "@/auth";
import { getPartitions } from "@/lib/api";
import { NextResponse } from "next/server";

export const GET = auth(async (req: NextRequest): Promise<NextResponse> => {
  if (!req.auth || !req.auth.user || !req.auth.user.email)
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const partitions = await getPartitions(req.auth.user.email);

  return NextResponse.json(
    partitions == "undefined"
      ? "undefined"
      : partitions.map((R) => ({
          name: R.name,
          displayName: R.displayName,
        })),
    { status: 200 },
  );
});
