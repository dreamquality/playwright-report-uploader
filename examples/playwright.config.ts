import { defineConfig } from "@playwright/test";
import { PlaywrightReportUploader } from "playwright-report-uploader";

export default defineConfig({
  testDir: "./tests",
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    // Add the report uploader as a custom reporter
    [PlaywrightReportUploader, {
      provider: "aws",
      reportDir: "./playwright-report",
      awsRegion: process.env.AWS_REGION || "us-east-1",
      awsBucket: process.env.AWS_BUCKET,
      awsPrefix: `reports/${new Date().toISOString().split("T")[0]}/`,
      publicAccess: true,
      generateIndex: true
    }]
  ],
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
});
