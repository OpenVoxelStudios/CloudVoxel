import config from "../../config";
import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { styleText } from "node:util";

if (config.logs.folder && !existsSync(config.logs.folder))
  mkdirSync(config.logs.folder, { recursive: true });

export function formatDate(format: string): string {
  const date = new Date();
  return format
    .replace("YYYY", date.getFullYear().toString())
    .replace("YY", date.getFullYear().toString().slice(-2))
    .replace("MM", (date.getMonth() + 1).toString().padStart(2, "0"))
    .replace("DD", date.getDate().toString().padStart(2, "0"))
    .replace("HH", date.getHours().toString().padStart(2, "0"));
}

type LogFunction = "log" | "debug" | "warn" | "error";
function getColorFor(message: string, func: LogFunction): string {
  switch (func) {
    case "warn":
      return styleText("yellow", message);
    case "error":
      return styleText("red", message);
    default:
      return message;
  }
}

function writeLog(
  message: string,
  func: LogFunction,
  forceDisableFile?: boolean,
): void {
  const logMethod: Record<LogFunction, string> = {
    log: "",
    debug: "DEBUG: ",
    warn: "WARN: ",
    error: "ERROR: ",
  };

  if (config.logs.console || process.env.NODE_ENV === "development") {
    console[func](
      getColorFor(
        `[${new Date().toLocaleString()}] ${logMethod[func]}${message}`,
        func,
      ),
    );
  }
  if (forceDisableFile !== true && config.logs.folder) {
    appendFileSync(
      `${config.logs.folder}/${formatDate(config.logs.fileFormat)}`,
      `[${new Date().toLocaleString()}] ${logMethod[func]}${message}\n`,
      { encoding: "utf-8" },
    );
  }
}

export function log(message: string, metadata?: unknown): void {
  writeLog(
    message +
      (metadata
        ? ` (${typeof metadata === "object" && metadata !== null ? JSON.stringify(metadata) : String(metadata)})`
        : ""),
    "log",
  );
}

export function debug(message: string, metadata?: unknown): void {
  writeLog(
    message +
      (metadata
        ? ` (${typeof metadata === "object" && metadata !== null ? JSON.stringify(metadata) : String(metadata)})`
        : ""),
    "debug",
    true,
  );
}

export function warn(code: string): void {
  writeLog(code, "warn");
}

export function error(error: string | Error): void {
  writeLog(
    error instanceof Error
      ? `${error.name}: ${error.message}\nError trace: ${error.stack}`
      : error,
    "error",
  );
}

export default {
  log: log,
  debug: debug,
  warn: warn,
  error: error,
} as {
  debug: (message: string, metadata?: unknown) => void;
  log: (message: string, metadata?: unknown) => void;
  warn: (code: string) => void;
  error: (error: string | Error) => void;
};
