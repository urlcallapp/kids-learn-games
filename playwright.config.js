import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'tests/e2e',use:{baseURL:'http://127.0.0.1:4173',viewport:{width:390,height:844},launchOptions:{...(process.env.CHROME_BIN?{executablePath:process.env.CHROME_BIN}:{}),args:['--no-sandbox']}},webServer:{command:'python3 -m http.server 4173',url:'http://127.0.0.1:4173',reuseExistingServer:true}});
