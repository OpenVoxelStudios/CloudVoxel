import { createReadStream, statSync } from "fs";
import { NextResponse } from "next/server";
import path from "path";
import mime from "mime";
import { db } from "@/../data/index";
import { eqLow, filesTable } from "@/../data/schema";
import { and, eq, isNull } from "drizzle-orm";
import { auth } from "@/auth";
import { root as ROOT } from "@/lib/root";
import { getPartition } from "@/lib/partition";
import clientconfig from "@/../clientconfig";

function isBot(userAgent: string | null) {
  if (!userAgent) return false;
  const botPatterns = [
    "bot",
    "crawler",
    "spider",
    "discord",
    "whatsapp",
    "telegram",
    "facebook",
    "twitter",
    "slack",
    "linkedin",
  ];
  return botPatterns.some((pattern) =>
    userAgent.toLowerCase().includes(pattern),
  );
}

export const GET = auth(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ path?: string[] }> },
  ): Promise<NextResponse> => {
    const fileHash = req.nextUrl.searchParams.get("hash");
    const fileCode = req.nextUrl.searchParams.get("code");
    if (!fileHash)
      return NextResponse.json(
        { error: "No hash parameter provided in the URL." },
        { status: 400 },
      );
    if (!fileCode)
      return NextResponse.json(
        { error: "No code parameter provided in the URL." },
        { status: 400 },
      );

    const find = Object.keys(ROOT).find((r) => r == getPartition(req));
    const root =
      typeof ROOT === "string" ? ROOT : find ? ROOT[find].path : undefined;
    if (!root)
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const rawPathStr =
      (await params).path
        ?.map((value) => decodeURIComponent(value).split("/"))
        .flat() || [];
    const pathStr = path.join(root, ...rawPathStr);
    if (!pathStr.startsWith(root))
      return NextResponse.json(
        { error: "Path is not in root." },
        { status: 403 },
      );

    const fileName = rawPathStr.pop()!;
    const filePath = rawPathStr.join("/") == "" ? "/" : rawPathStr.join("/");
    const partition = getPartition(req);

    const file = await db
      .select()
      .from(filesTable)
      .where(
        and(
          eqLow(filesTable.name, fileName),
          eqLow(filesTable.path, filePath),
          partition && typeof ROOT !== "string"
            ? eqLow(filesTable.partition, partition!)
            : isNull(filesTable.partition),
          eq(filesTable.hash, fileHash),
          eq(filesTable.code, fileCode),
          eq(filesTable.directory, 0),
        ),
      )
      .get();

    if (!file)
      return NextResponse.json(
        { error: "File not found or wrong code/hash." },
        { status: 404 },
      );

    const stats = statSync(pathStr);
    const mimeType = mime.getType(pathStr);

    if (
      isBot(req.headers.get("User-Agent")) &&
      !req.nextUrl.searchParams.get("embedded")
    ) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${fileName} on ${clientconfig.websiteName}</title>
            <meta property="og:title" content="${fileName} on ${clientconfig.websiteName}" />
            <meta property="og:url" content="${req.url}" />
            <meta property="og:description" content="File Size: ${file.size}" />
            <meta name="twitter:title" content="${fileName} on ${clientconfig.websiteName}" />
            <meta name="twitter:description" content="File Size: ${file.size}" />
            <meta name="twitter:card" content="summary_large_image">

            ${
              mimeType &&
              (mimeType.startsWith("video/")
                ? [
                    `<meta property="twitter:player:stream" content="${req.url}&embedded=true"/>`,
                    `<meta property="twitter:player:stream:content_type" content="${mimeType}"/>`,
                    `<meta property="og:video" content="${req.url}&embedded=true"/>`,
                    `<meta property="og:video:secure_url" content="${req.url}&embedded=true"/>`,
                    `<meta property="og:video:type" content="${mimeType}"/>`,

                    `<meta property="og:type" content="video.other" />`,
                  ].join("\n")
                : mimeType.startsWith("image/")
                  ? [
                      `<meta property="twitter:image" content="${req.url}&embedded=true"/>`,
                      `<meta property="og:image" content="${req.url}&embedded=true"/>`,

                      `<meta property="og:type" content="image" />`,
                    ].join("\n")
                  : "")
            }
        </head>
        <body />
        </html>`,
        {
          status: 200,
          headers: {
            "Cache-Control": "public, s-maxage=30, stale-while-revalidate=10",
            "Content-Type": "text/html",
          },
        },
      );
    }

    const readStream = createReadStream(pathStr);
    const response = new NextResponse(readStream as unknown as ReadableStream, {
      status: 200,
      headers: {
        "Content-Type":
          (req.nextUrl.searchParams.get("download") == "true"
            ? false
            : mimeType) || "application/octet-stream",
        "Content-Length": stats.size.toString(),
        ETag: `"${fileHash}"`,
        "X-Content-SHA256": fileHash,
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=10",
      },
    });
    return response;
  },
);
