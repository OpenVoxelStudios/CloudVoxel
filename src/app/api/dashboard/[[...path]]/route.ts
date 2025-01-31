import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  renameSync,
  rmSync,
  Stats,
  statSync,
} from "fs";
import { NextResponse } from "next/server";
import path, { basename, parse } from "path";
import mime from "mime";
import { db } from "@/../data/index";
import {
  apiKeysTable,
  eqLow,
  filesTable,
  ilike,
  usersTable,
} from "@/../data/schema";
import { and, eq, isNotNull, isNull, or, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { formatBytes, sanitizedFilename, unformatBytes } from "@/lib/functions";
import clientconfig from "@/../clientconfig";
import { createHash } from "crypto";
import { getRootAndPermission } from "@/lib/api";
import { root as ROOT } from "@/lib/root";
import validateApi from "@/lib/validateApi";
import { getPartition } from "@/lib/partition";
import logger from "@/lib/logger";

export interface FileElement {
  name: string;
  path: string;
  size: string | null;
  uploadedAt: number | null;
  author: {
    avatar: string;
    name: string;
  } | null;
  directory: number;
  hash?: string;
  code?: string;
}

export interface FetchError {
  error: string;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

function isFileElement(pathStr: string): FetchError | false | Stats {
  if (existsSync(pathStr) === false) return { error: "Path does not exist" };
  const stats = statSync(pathStr);
  if (stats.isDirectory()) return false;

  return stats;
}

async function lsDir(
  pathStr: string,
  partition: string | null,
): Promise<FileElement[]> {
  const results = await db
    .select()
    .from(filesTable)
    .where(
      and(
        eqLow(filesTable.path, pathStr == "" ? "/" : pathStr),
        partition && typeof ROOT !== "string"
          ? eqLow(filesTable.partition, partition!)
          : isNull(filesTable.partition),
      ),
    );
  return (await Promise.all(
    results.map(async (result) => {
      const user = !result.author
        ? null
        : result.author == "server"
          ? {
              name: "Server Admin",
              avatar: clientconfig.websiteLogo,
            }
          : (await db
              .select({
                avatar: usersTable.image,
                name: usersTable.name,
              })
              .from(usersTable)
              .where(eqLow(usersTable.email, result.author))
              .get()) ||
            (await db
              .select({ name: apiKeysTable.name })
              .from(apiKeysTable)
              .where(eqLow(apiKeysTable.key, result.author))
              .get());

      return {
        ...result,
        author: user
          ? {
              name: user.name,
              avatar: "avatar" in user ? user.avatar : clientconfig.websiteLogo,
            }
          : null,
      };
    }),
  )) as FileElement[];
}

async function getPartitionSize(partition: string): Promise<number> {
  const sizes = (
    await db
      .select({ size: filesTable.size })
      .from(filesTable)
      .where(
        and(eqLow(filesTable.partition, partition), isNotNull(filesTable.size)),
      )
      .all()
  ).filter((f) => f.size !== null);
  return sizes.map((s) => unformatBytes(s.size)).reduce((a, b) => a + b, 0);
}

async function handleFileUpload(
  req: NextRequest,
  pathStr: string,
  rawPathStr: string[],
  partition: string | null,
): Promise<NextResponse> {
  const formData = await req.formData();
  const files = formData
    .getAll("files")
    .concat(formData.get("file") || [])
    .filter((file) => file instanceof File);

  if (!files || files.length === 0)
    return NextResponse.json(
      { error: "No files uploaded." },
      { status: 400, statusText: "No files uploaded." },
    );
  if (files.length > 1)
    return NextResponse.json(
      { error: "Only one file can be uploaded at a time." },
      { status: 400, statusText: "Only one file can be uploaded at a time." },
    );
  const file = files[0];

  if (!(file instanceof File))
    return NextResponse.json(
      { error: "Invalid file." },
      { status: 400, statusText: "Invalid file." },
    );

  const fileName = sanitizedFilename(file.name);
  if (fileName == "")
    return NextResponse.json({ error: "File name is empty." }, { status: 400 });
  const fullPath = path.join(pathStr, fileName);
  const filePath = rawPathStr.join("/") == "" ? "/" : rawPathStr.join("/");

  if (existsSync(fullPath))
    return NextResponse.json(
      { error: "File already exists." },
      { status: 400, statusText: "File already exists." },
    );
  if (file.size > unformatBytes(clientconfig.maxFileSize))
    return NextResponse.json(
      { error: `File exceeds the ${clientconfig.maxFileSize} limit.` },
      {
        status: 400,
        statusText: `File exceeds the ${clientconfig.maxFileSize} limit.`,
      },
    );
  if (
    partition &&
    typeof ROOT !== "string" &&
    ROOT[partition].maxPartitionSize &&
    file.size + (await getPartitionSize(partition)) >
      unformatBytes(ROOT[partition].maxPartitionSize)
  )
    return NextResponse.json(
      {
        error: `File exceeds the partition's ${ROOT[partition].maxPartitionSize} size limit.`,
      },
      {
        status: 400,
        statusText: `File exceeds the partition's ${ROOT[partition].maxPartitionSize} size limit.`,
      },
    );

  logger.log(
    `<${req.auth?.user?.email || `API-${req.headers.get("Authorization")}`}> Uploading "${fileName}" file at ${filePath} (${formatBytes(file.size)})`,
  );
  const fileStream = file.stream();
  const writeStream = createWriteStream(fullPath);
  const hashSum = createHash("sha256");

  await new Promise((resolve, reject) => {
    writeStream.on("finish", () => resolve(true));
    writeStream.on("error", (err) => reject(err));

    new ReadableStream({
      start() {
        return new Response(fileStream).body!.pipeTo(
          new WritableStream({
            write(chunk) {
              writeStream.write(chunk);
              hashSum.update(chunk);
            },
            close() {
              writeStream.end();
            },
          }),
        );
      },
    });
  });

  const hash = hashSum.digest("hex");

  await db
    .insert(filesTable)
    .values({
      name: fileName,
      path: filePath,
      directory: 0,
      size: formatBytes(file.size),
      uploadedAt: Date.now(),
      author:
        req?.auth?.user?.email || req.headers.get("Authorization") || "api",
      hash: hash,
      partition: partition && typeof ROOT !== "string" ? partition : undefined,
    })
    .execute();

  return NextResponse.json({ success: true }, { status: 200 });
}

// TODO: Optimize json length by removing user duplicate
export const GET = auth(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ path?: string[] }> },
  ): Promise<NextResponse> => {
    if (req.headers.get("Authorization")) {
      const hasValidToken = await validateApi(
        req.headers.get("Authorization")!,
        ["files:*", "files:get"],
      );
      if (!hasValidToken)
        return NextResponse.json(
          { error: "Unauthorized API key for permission files:get." },
          { status: 401 },
        );
    }
    const root = await getRootAndPermission(req, ROOT);
    if (!root)
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const rawPathStr =
      (await params).path
        ?.map((value) => decodeURIComponent(value).split("/"))
        .flat() || [];
    const pathStr = path.join(root, ...rawPathStr);
    const partition = getPartition(req);

    if (!pathStr.startsWith(root))
      return NextResponse.json(
        { error: "Path is not in root." },
        { status: 403 },
      );

    const isFile = isFileElement(pathStr);

    if (isFile && "error" in isFile)
      return NextResponse.json(isFile, { status: 404 });

    if (!isFile) {
      let files = await lsDir(rawPathStr.join("/"), partition);
      if (req.headers.get("Authorization")) {
        const hasSharePerms = await validateApi(
          req.headers.get("Authorization")!,
          ["files:*", "files:share"],
        );
        if (!hasSharePerms)
          files = files.map((f) => ({ ...f, code: undefined }));
      }

      const response = NextResponse.json(files, { status: 200 });
      response.headers.set(
        "Cache-Control",
        "public, s-maxage=30, stale-while-revalidate=10",
      );
      return response;
    } else {
      const readStream = createReadStream(pathStr);
      const response = new NextResponse(
        readStream as unknown as ReadableStream,
        {
          status: 200,
          headers: {
            "Content-Type":
              (req.nextUrl.searchParams.get("download") == "true"
                ? undefined
                : mime.getType(pathStr)) || "application/octet-stream",
            "Content-Length": isFile.size.toString(),
          },
        },
      );
      response.headers.set(
        "Cache-Control",
        "public, s-maxage=30, stale-while-revalidate=10",
      );
      return response;
    }
  },
);

export const POST = auth(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ path?: string[] }> },
  ): Promise<NextResponse> => {
    if (req.headers.get("Authorization")) {
      const hasValidToken = await validateApi(
        req.headers.get("Authorization")!,
        ["files:*", "files:edit"],
      );
      if (!hasValidToken)
        return NextResponse.json(
          { error: "Unauthorized API key for permission files:edit." },
          { status: 401 },
        );
    } else if (!req.auth || !req.auth.user)
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const root = await getRootAndPermission(req, ROOT);
    if (!root)
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const rawPathStr =
      (await params).path
        ?.map((value) => decodeURIComponent(value).split("/"))
        .flat() || [];
    const pathStr = path.join(root, ...rawPathStr);
    const partition = getPartition(req);

    if (!pathStr.startsWith(root))
      return NextResponse.json(
        { error: "Path is not in root." },
        { status: 403 },
      );

    if (req.nextUrl.searchParams.get("folder") == "true") {
      if (existsSync(pathStr))
        return NextResponse.json(
          { error: "Path already exists." },
          { status: 400 },
        );
      const fName = rawPathStr.pop()!;
      const fPath = rawPathStr.join("/") == "" ? "/" : rawPathStr.join("/");

      logger.log(
        `<${req.auth?.user?.email || `API-${req.headers.get("Authorization")}`}> Creating "${fName}" directory at ${fPath}`,
      );
      mkdirSync(pathStr, { recursive: true });

      await db
        .insert(filesTable)
        .values({
          name: fName,
          path: fPath,
          directory: 1,
          author:
            req?.auth?.user?.email || req.headers.get("Authorization") || "api",
          partition:
            partition && typeof ROOT !== "string" ? partition : undefined,
        })
        .execute();

      return NextResponse.json({ success: true }, { status: 200 });
    } else return handleFileUpload(req, pathStr, rawPathStr, partition);
  },
);

export const PATCH = auth(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ path?: string[] }> },
  ): Promise<NextResponse> => {
    if (req.headers.get("Authorization")) {
      const hasValidToken = await validateApi(
        req.headers.get("Authorization")!,
        ["files:*", "files:edit"],
      );
      if (!hasValidToken)
        return NextResponse.json(
          { error: "Unauthorized API key for permission files:edit." },
          { status: 401 },
        );
    }
    const root = await getRootAndPermission(req, ROOT);
    if (!root)
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    try {
      const renameParam = sanitizedFilename(
        req.headers.get("PATCH-rename") || "",
      );
      const UNSAFE_moveParam = req.headers.get("PATCH-move") || "";

      if (!renameParam && !UNSAFE_moveParam)
        return NextResponse.json(
          {
            error:
              "No operation specified. Either move either rename should be defined in the search params.",
          },
          { status: 400 },
        );
      if (renameParam && UNSAFE_moveParam)
        return NextResponse.json(
          {
            error:
              "Both move and rename operations are not allowed at the same time.",
          },
          { status: 400 },
        );

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
      if (existsSync(pathStr) === false)
        return NextResponse.json(
          { error: "Path does not exist!" },
          { status: 404 },
        );

      const fileName = basename(pathStr);
      const filePath =
        parse(rawPathStr.join("/")).dir == ""
          ? "/"
          : parse(rawPathStr.join("/")).dir;
      const partition = getPartition(req);

      if (renameParam) {
        const renameExists = (
          await db
            .select()
            .from(filesTable)
            .where(
              and(
                eqLow(filesTable.path, filePath),
                eqLow(filesTable.name, renameParam),
                partition && typeof ROOT !== "string"
                  ? eqLow(filesTable.partition, partition!)
                  : isNull(filesTable.partition),
              ),
            )
            .limit(1)
        )[0];
        if (renameExists)
          return NextResponse.json(
            { error: "A file with this name already exists." },
            { status: 400 },
          );
        if (
          existsSync(path.join(root, ...rawPathStr.slice(0, -1), renameParam))
        )
          return NextResponse.json(
            {
              error:
                "File exists on the storage system. Please contact the server administrator if you believe this is a bug.",
            },
            { status: 400 },
          );

        logger.log(
          `<${req.auth?.user?.email || `API-${req.headers.get("Authorization")}`}> Renaming "${fileName}" file to "${renameParam}" at ${filePath}`,
        );

        // Rename the file itself
        await db
          .update(filesTable)
          .set({ name: renameParam })
          .where(
            and(
              eqLow(filesTable.path, filePath),
              eqLow(filesTable.name, fileName),
              partition && typeof ROOT !== "string"
                ? eqLow(filesTable.partition, partition!)
                : isNull(filesTable.partition),
            ),
          )
          .execute();

        // Rename all possible subfiles
        const getFullPath = (base: string, name: string) =>
          base === "/" ? name : `${base}/${name}`;

        const oldPath = getFullPath(filePath, fileName);
        const newPath = getFullPath(filePath, renameParam);

        await db
          .update(filesTable)
          .set({
            path: sql`REPLACE(${filesTable.path}, ${oldPath}, ${newPath})`,
          })
          .where(
            or(
              eqLow(filesTable.path, oldPath),
              ilike(filesTable.path, `${oldPath}/%`),
              partition && typeof ROOT !== "string"
                ? eqLow(filesTable.partition, partition!)
                : isNull(filesTable.partition),
            ),
          )
          .execute();

        // Actually rename
        renameSync(
          pathStr,
          path.join(root, ...rawPathStr.slice(0, -1), renameParam),
        );

        return NextResponse.json({ success: true }, { status: 200 });
      } else if (UNSAFE_moveParam) {
        const moveParam = sanitizedFilename(UNSAFE_moveParam);
        const destination = rawPathStr.slice(0, -1);
        if (UNSAFE_moveParam != "../") destination.push(moveParam);
        if (UNSAFE_moveParam != "../" && moveParam == "")
          return NextResponse.json(
            { error: "Destination folder name is empty." },
            { status: 400 },
          );
        else destination.pop();

        const newPath =
          destination.join("/") == "" ? "/" : destination.join("/");

        const folderExists =
          destination.length == 0
            ? []
            : (
                await db
                  .select()
                  .from(filesTable)
                  .where(
                    and(
                      eqLow(
                        filesTable.path,
                        parse(destination.join("/")).dir == ""
                          ? "/"
                          : parse(destination.join("/")).dir,
                      ),
                      eqLow(filesTable.name, basename(newPath)),
                      partition && typeof ROOT !== "string"
                        ? eqLow(filesTable.partition, partition!)
                        : isNull(filesTable.partition),
                      eq(filesTable.directory, 1),
                    ),
                  )
                  .limit(1)
              )[0];

        if (!folderExists)
          return NextResponse.json(
            { error: "Destination folder does not exist." },
            { status: 404 },
          );

        const moveExists = (
          await db
            .select()
            .from(filesTable)
            .where(
              and(
                eqLow(filesTable.path, newPath),
                eqLow(filesTable.name, fileName),
                partition && typeof ROOT !== "string"
                  ? eqLow(filesTable.partition, partition!)
                  : isNull(filesTable.partition),
              ),
            )
            .limit(1)
        )[0];
        if (moveExists)
          return NextResponse.json(
            {
              error: "A file with this name exists in the destination folder.",
            },
            { status: 400 },
          );

        logger.log(
          `<${req.auth?.user?.email || `API-${req.headers.get("Authorization")}`}> Moving "${fileName}" file at ${filePath} ${UNSAFE_moveParam == "../" ? "back" : `to folder "${moveParam}"`}`,
        );

        // Edit path in the database
        let oldPath = rawPathStr.slice(0, -1).join("/");
        if (oldPath == "") oldPath = "/";

        // The file itself
        await db
          .update(filesTable)
          .set({
            path: sql`REPLACE(${filesTable.path}, ${oldPath}, ${newPath})`,
          })
          .where(
            and(
              eqLow(filesTable.path, oldPath),
              eqLow(filesTable.name, fileName),
              partition && typeof ROOT !== "string"
                ? eqLow(filesTable.partition, partition!)
                : isNull(filesTable.partition),
            ),
          )
          .execute();

        // All possible subfiles
        const old = `${oldPath == "/" ? "" : oldPath + "/"}${fileName}`;
        const secondNewPath =
          destination.concat(fileName).join("/") == ""
            ? "/"
            : destination.concat(fileName).join("/");

        await db
          .update(filesTable)
          .set({
            path: sql`REPLACE(${filesTable.path}, ${old}, ${secondNewPath})`,
          })
          .where(
            or(
              ilike(filesTable.path, `${old}/%`),
              eqLow(filesTable.path, old),
              partition && typeof ROOT !== "string"
                ? eqLow(filesTable.partition, partition!)
                : isNull(filesTable.partition),
            ),
          )
          .execute();

        // Actually move
        renameSync(pathStr, path.join(root, ...destination, fileName));

        return NextResponse.json({ success: true }, { status: 200 });
      } else {
        return NextResponse.json(
          { error: "Not implemented." },
          { status: 501 },
        );
      }
    } catch (e) {
      logger.error(String(e));
      return NextResponse.json(
        { error: "Something went wrong server side." },
        { status: 500 },
      );
    }
  },
);

export const DELETE = auth(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ path?: string[] }> },
  ): Promise<NextResponse> => {
    if (req.headers.get("Authorization")) {
      const hasValidToken = await validateApi(
        req.headers.get("Authorization")!,
        ["files:*", "files:delete"],
      );
      if (!hasValidToken)
        return NextResponse.json(
          { error: "Unauthorized API key for permission files:delete." },
          { status: 401 },
        );
    }
    const root = await getRootAndPermission(req, ROOT);
    if (!root)
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const rawPathStr =
      (await params).path
        ?.map((value) => decodeURIComponent(value).split("/"))
        .flat() || [];
    const pathStr = path.join(root, ...rawPathStr);
    const partition = getPartition(req);

    if (!pathStr.startsWith(root))
      return NextResponse.json(
        { error: "Path is not in root." },
        { status: 403 },
      );
    if (existsSync(pathStr) === false)
      return NextResponse.json(
        { error: "Path does not exist!" },
        { status: 404 },
      );

    const fileName = basename(pathStr);
    const filePath =
      parse(rawPathStr.join("/")).dir == ""
        ? "/"
        : parse(rawPathStr.join("/")).dir;
    const fileStats = (
      await db
        .select()
        .from(filesTable)
        .where(
          and(
            eqLow(filesTable.path, filePath),
            eqLow(filesTable.name, fileName),
            partition && typeof ROOT !== "string"
              ? eqLow(filesTable.partition, partition!)
              : isNull(filesTable.partition),
          ),
        )
        .limit(1)
    )[0];
    if (!fileStats)
      return NextResponse.json(
        { error: "File not found in database." },
        { status: 404 },
      );

    if (fileStats.directory) {
      const subFiles = await lsDir(rawPathStr.join("/"), partition);

      if (subFiles.length > 0)
        return NextResponse.json(
          { error: "Cannot delete non-empty directories." },
          { status: 400 },
        );
      else {
        logger.log(
          `<${req.auth?.user?.email || `API-${req.headers.get("Authorization")}`}> Deleting "${fileName}" directory at ${filePath}`,
        );

        rmSync(pathStr, { force: true, recursive: true });
        await db
          .delete(filesTable)
          .where(
            and(
              eqLow(filesTable.path, filePath),
              eqLow(filesTable.name, fileName),
              partition && typeof ROOT !== "string"
                ? eqLow(filesTable.partition, partition!)
                : isNull(filesTable.partition),
            ),
          )
          .execute();
        return NextResponse.json({ success: true }, { status: 200 });
      }
    } else {
      try {
        logger.log(
          `<${req.auth?.user?.email || `API-${req.headers.get("Authorization")}`}> Deleting "${fileName}" file at ${filePath}`,
        );

        await db
          .delete(filesTable)
          .where(
            and(
              eqLow(filesTable.path, filePath),
              eqLow(filesTable.name, fileName),
              partition && typeof ROOT !== "string"
                ? eqLow(filesTable.partition, partition!)
                : isNull(filesTable.partition),
            ),
          )
          .execute();
        rmSync(pathStr);

        const response = NextResponse.json({ success: true }, { status: 200 });
        response.headers.set(
          "Cache-Control",
          "public, s-maxage=30, stale-while-revalidate=10",
        );
        return response;
      } catch (error) {
        logger.error(String(error));
        return NextResponse.json({ error: String(error) }, { status: 500 });
      }
    }
  },
);
