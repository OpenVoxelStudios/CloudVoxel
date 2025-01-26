"use client";

import { motion, AnimatePresence } from "motion/react";
import FileItem from "@/app/ui/fileItem";
import { sanitizedFilename, unformatBytes } from "@/lib/functions";
import { sortOptions } from "./fileListWrapper";
import { FetchError, FileElement } from "../api/dashboard/[[...path]]/route";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Suspense, useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DebouncedFunc } from "lodash";

export default function FileList({
  pathParts,
  sortBy,
  sortOrder,
  files,
  fetchFiles,
  partition,
}: {
  pathParts: string[];
  sortBy: (typeof sortOptions)[number];
  sortOrder: boolean;
  files: FileElement[] | FetchError | null;
  fetchFiles: DebouncedFunc<() => Promise<void>>;
  partition: string | undefined;
}) {
  const { toast } = useToast();
  const [shareTo, setShareTo] = useState<{
    to: string;
    url: string | undefined | Promise<string | undefined>;
  } | null>(null);
  const [renameTo, setRenameTo] = useState<{ from: string; to: string } | null>(
    null,
  );

  const moveFolder = async (name: string, folder: string) => {
    const res = await fetch(
      `/api/dashboard/${pathParts.map(encodeURIComponent).join("/")}/${encodeURIComponent(name)}`,
      {
        method: "PATCH",
        headers: {
          "PATCH-move": folder,
          Partition: partition || "",
        },
      },
    );

    if (res.status == 200) {
      toast({
        title: `Moved "${name}" ${folder == "../" ? "back" : `to "${folder}"`}.`,
      });
      return fetchFiles();
    }

    const json = await res.json();
    toast({
      title: `Could not move "${name}" ${folder == "../" ? "back" : `to "${folder}"`}.`,
      description: `${json?.error || "No error message"}`,
      variant: "destructive",
    });
  };

  return (
    <>
      <Dialog
        defaultOpen={false}
        open={shareTo !== null}
        onOpenChange={(open) => !open && setShareTo(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share link</DialogTitle>
            <DialogDescription>
              {shareTo?.to == "Everyone"
                ? "Anyone who has this link will be able to view this."
                : "Only logged in users will be able to access with this link."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="filelist-link" className="sr-only">
                Link
              </Label>
              <Suspense
                fallback={
                  <Input
                    id="filelist-link"
                    defaultValue="Loading..."
                    readOnly
                  />
                }
              >
                {shareTo?.url instanceof Promise ? (
                  shareTo.url.then(
                    (url) => (
                      setShareTo({ to: shareTo.to, url: url }),
                      (
                        <Input
                          id="filelist-link"
                          defaultValue={url || "Something went wrong!"}
                          readOnly
                        />
                      )
                    ),
                  )
                ) : (
                  <Input
                    id="filelist-link"
                    defaultValue={shareTo?.url || "Something went wrong!"}
                    readOnly
                  />
                )}
              </Suspense>
            </div>
            <Button
              type="submit"
              size="sm"
              className="px-3"
              onClick={async () => {
                const url = await shareTo?.url;
                if (!url) return;
                try {
                  await navigator.clipboard.writeText(url);
                  toast({ title: `Copied link to clipboard.` });
                } catch (err) {
                  toast({
                    title: `Failed to copy link to clipboard.`,
                    description: String(err) || "No error message",
                    variant: "destructive",
                  });
                }
              }}
            >
              <span className="sr-only">Copy</span>
              <Copy />
            </Button>
          </div>
          <div className="flex items-center space-x-2 sm:justify-end">
            <Button
              type="submit"
              size="sm"
              className="px-3"
              onClick={async () => {
                const url = await shareTo?.url;
                if (!url) return;
                try {
                  await navigator.clipboard.writeText(
                    `[${decodeURIComponent(new URL(url).pathname.split("/").at(-1) || "file")}](${url})`,
                  );
                  toast({ title: `Copied Discord link to clipboard.` });
                } catch (err) {
                  toast({
                    title: `Failed to copy Discord link to clipboard.`,
                    description: String(err) || "No error message",
                    variant: "destructive",
                  });
                }
              }}
            >
              <span>Discord Copy</span>
              <Copy />
            </Button>
          </div>
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        defaultOpen={false}
        open={renameTo !== null}
        onOpenChange={(open) => !open && setRenameTo(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename file or folder</DialogTitle>
            <DialogDescription>
              Rename &quot;{renameTo?.from}&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Label htmlFor="file-rename" className="sr-only">
              Rename
            </Label>
            <Input
              id="file-rename"
              value={renameTo?.to || ""}
              onChange={(e) =>
                setRenameTo({
                  from: renameTo?.from || "",
                  to: sanitizedFilename(e.target.value),
                })
              }
            />
          </div>
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                type="button"
                variant="default"
                onClick={async () => {
                  if (!renameTo || renameTo.to.trim() == "") return;

                  const res = await fetch(
                    `/api/dashboard/${pathParts.map(encodeURIComponent).join("/")}/${encodeURIComponent(renameTo.from)}`,
                    {
                      method: "PATCH",
                      headers: {
                        "PATCH-rename": renameTo.to,
                        Partition: partition || "",
                      },
                    },
                  );

                  if (res.status == 200) {
                    toast({
                      title: `Renamed "${renameTo.from}" to "${renameTo.to}".`,
                    });
                    return fetchFiles();
                  }

                  const json = await res.json();
                  toast({
                    title: `Could not rename "${renameTo.from}" to "${renameTo.to}".`,
                    description: `${json?.error || "No error message"}`,
                    variant: "destructive",
                  });
                }}
              >
                Rename
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!files ? (
        <div className="flex items-center justify-center p-4 bg-gray-800 border-b border-gray-700 hover:bg-gray-750">
          <h3 className="text-sm font-bold text-gray-100">Loading...</h3>
        </div>
      ) : "error" in files ? (
        <div className="flex items-center justify-center p-4 bg-gray-800 border-b border-gray-700 hover:bg-gray-750">
          <h3 className="text-sm font-bold text-gray-100">{files.error}</h3>
        </div>
      ) : files.length == 0 ? (
        <div className="flex items-center justify-center p-4 bg-gray-800 border-b border-gray-700 hover:bg-gray-750">
          <h3 className="text-sm font-bold text-gray-100">
            Nothing in this folder!
          </h3>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            id="filelist"
            key={`${sortBy}-${sortOrder}`}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative notextselection"
          >
            {files
              .sort((a, b) => {
                const sorting =
                  sortBy == "name"
                    ? a.name.localeCompare(b.name)
                    : sortBy == "date"
                      ? (a.uploadedAt || 0) - (b.uploadedAt || 0)
                      : sortBy == "size"
                        ? unformatBytes(a.size) - unformatBytes(b.size)
                        : sortBy == "type"
                          ? a.directory
                            ? -1
                            : 1
                          : sortBy == "uploader"
                            ? (a.author?.name || "").localeCompare(
                                b.author?.name || "",
                              )
                            : 0;

                return sortOrder ? sorting : -sorting;
              })
              .map((file, index) => (
                <motion.div
                  key={file.name}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.2,
                      delay: index * 0.05,
                    },
                  }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <FileItem
                    pathParts={pathParts}
                    name={file.name}
                    size={file.size}
                    uploadedAt={file.uploadedAt}
                    directory={file.directory}
                    author={file.author}
                    hash={file.hash}
                    code={file.code}
                    onDelete={fetchFiles}
                    setShareTo={setShareTo}
                    setRenameTo={setRenameTo}
                    folders={files
                      .filter((f) => f.directory == 1 && f.name != file.name)
                      .map((f) => f.name)
                      .sort((a, b) => a.localeCompare(b))}
                    moveFolder={moveFolder}
                    partition={partition}
                  />
                </motion.div>
              ))}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}
