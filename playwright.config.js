// Browser tests of the GUI: `npm install`, `npx playwright install`, then `npm test`.
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests',
    timeout: 120000,
    fullyParallel: true,
    reporter: process.env.CI ? 'github' : 'list',
    use: {
        baseURL: 'http://127.0.0.1:8123/',
        viewport: { width: 1600, height: 950 },
    },
    webServer: {
        command: 'python3 -m http.server 8123 --bind 127.0.0.1',
        url: 'http://127.0.0.1:8123/LogicUS.html',
        reuseExistingServer: !process.env.CI,
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1600, height: 950 } } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1600, height: 950 } } },
        { name: 'webkit', use: { ...devices['Desktop Safari'], viewport: { width: 1600, height: 950 } } },
    ],
});
