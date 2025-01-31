import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { scripts as scriptsJSON } from "./package.json";

import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env.development" });

// Set webServer.url and use.baseURL with the location of the WebServer
export const baseURL = process.env.AUTH_URL || `http://localhost:3000`;

// Reference: https://playwright.dev/docs/test-configuration
export default defineConfig({
  fullyParallel: false,
  // Timeout per test
  timeout: 30 * 1000,
  // Test directory
  testDir: path.join(__dirname, "test", "e2e"),
  retries: 0,
  // Artifacts folder where screenshots, videos, and traces are stored.
  outputDir: path.join(__dirname, "test", "results"),

  // Run your local dev server before starting the tests:
  // https://playwright.dev/docs/test-advanced#launching-a-development-web-server-during-the-tests
  webServer: {
    command: scriptsJSON.dev,
    url: baseURL,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "ignore",
  },

  use: {
    // Use baseURL so to make navigations relative.
    // More information: https://playwright.dev/docs/api/class-testoptions#test-options-base-url
    baseURL,

    // Retry a test if its failing with enabled tracing. This allows you to analyze the DOM, console logs, network traffic etc.
    // More information: https://playwright.dev/docs/trace-viewer
    trace: "off",

    // All available context options: https://playwright.dev/docs/api/class-browser#browser-new-context
    // contextOptions: {
    //   ignoreHTTPSErrors: true,
    // },
  },

  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "Desktop Chrome",
      use: {
        ...devices["Desktop Chrome"],
        // storageState: path.join(__dirname, "test", "e2e", "storage.json"),
      },
      dependencies: ["setup"],
    },
  ],
});
