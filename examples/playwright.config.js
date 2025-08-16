"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const playwright_report_uploader_1 = require("playwright-report-uploader");
exports.default = (0, test_1.defineConfig)({
    testDir: "./tests",
    reporter: [
        ["html", { outputFolder: "playwright-report" }],
        // Add the report uploader as a custom reporter
        [playwright_report_uploader_1.PlaywrightReportUploader, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheXdyaWdodC5jb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwbGF5d3JpZ2h0LmNvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQUFnRDtBQUNoRCwyRUFBc0U7QUFFdEUsa0JBQWUsSUFBQSxtQkFBWSxFQUFDO0lBQzFCLE9BQU8sRUFBRSxTQUFTO0lBQ2xCLFFBQVEsRUFBRTtRQUNSLENBQUMsTUFBTSxFQUFFLEVBQUUsWUFBWSxFQUFFLG1CQUFtQixFQUFFLENBQUM7UUFDL0MsK0NBQStDO1FBQy9DLENBQUMscURBQXdCLEVBQUU7Z0JBQ3pCLFFBQVEsRUFBRSxLQUFLO2dCQUNmLFNBQVMsRUFBRSxxQkFBcUI7Z0JBQ2hDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxXQUFXO2dCQUNoRCxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVO2dCQUNqQyxTQUFTLEVBQUUsV0FBVyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRztnQkFDL0QsWUFBWSxFQUFFLElBQUk7Z0JBQ2xCLGFBQWEsRUFBRSxJQUFJO2FBQ3BCLENBQUM7S0FDSDtJQUNELEdBQUcsRUFBRTtRQUNILEtBQUssRUFBRSxnQkFBZ0I7UUFDdkIsVUFBVSxFQUFFLGlCQUFpQjtLQUM5QjtDQUNGLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJAcGxheXdyaWdodC90ZXN0XCI7XG5pbXBvcnQgeyBQbGF5d3JpZ2h0UmVwb3J0VXBsb2FkZXIgfSBmcm9tIFwicGxheXdyaWdodC1yZXBvcnQtdXBsb2FkZXJcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgdGVzdERpcjogXCIuL3Rlc3RzXCIsXG4gIHJlcG9ydGVyOiBbXG4gICAgW1wiaHRtbFwiLCB7IG91dHB1dEZvbGRlcjogXCJwbGF5d3JpZ2h0LXJlcG9ydFwiIH1dLFxuICAgIC8vIEFkZCB0aGUgcmVwb3J0IHVwbG9hZGVyIGFzIGEgY3VzdG9tIHJlcG9ydGVyXG4gICAgW1BsYXl3cmlnaHRSZXBvcnRVcGxvYWRlciwge1xuICAgICAgcHJvdmlkZXI6IFwiYXdzXCIsXG4gICAgICByZXBvcnREaXI6IFwiLi9wbGF5d3JpZ2h0LXJlcG9ydFwiLFxuICAgICAgYXdzUmVnaW9uOiBwcm9jZXNzLmVudi5BV1NfUkVHSU9OIHx8IFwidXMtZWFzdC0xXCIsXG4gICAgICBhd3NCdWNrZXQ6IHByb2Nlc3MuZW52LkFXU19CVUNLRVQsXG4gICAgICBhd3NQcmVmaXg6IGByZXBvcnRzLyR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KFwiVFwiKVswXX0vYCxcbiAgICAgIHB1YmxpY0FjY2VzczogdHJ1ZSxcbiAgICAgIGdlbmVyYXRlSW5kZXg6IHRydWVcbiAgICB9XVxuICBdLFxuICB1c2U6IHtcbiAgICB0cmFjZTogXCJvbi1maXJzdC1yZXRyeVwiLFxuICAgIHNjcmVlbnNob3Q6IFwib25seS1vbi1mYWlsdXJlXCIsXG4gIH0sXG59KTtcbiJdfQ==