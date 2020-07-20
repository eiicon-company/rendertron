/*
 * Copyright 2018 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 not
 * use this file except in compliance with the License. You may obtain a copy
 of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 under
 * the License.
 */

'use strict';

import * as fse from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

const CONFIG_PATH = path.resolve(__dirname, '../config.json');


export type Config = {
    cache: string | null;
    cacheConfig: { [key: string]: string };
    timeout: number;
    port: string;
    host: string
    width: number;
    height: number;
    headers: { [key: string]: string };
    puppeteerArgs: Array<string>;
};

export class ConfigManager {
    public static config: Config = {
        cache: process.env.RENDERTRON_CACHE || null,
        cacheConfig: {
            snapshotDir: process.env.RENDERTRON_CACHE_DIR || path.join(os.tmpdir(), 'rendertron'),
            cacheDurationMinutes: process.env.RENDERTRON_CACHE_DURATION || (60 * 24).toString(),
            cacheMaxEntries: process.env.RENDERTRON_CACHE_ENTRIES || '100'
        },
        timeout: Number(process.env.RENDERTRON_TIMEOUT || 10000),
        port: process.env.RENDERTRON_PORT || '3000',
        host: process.env.RENDERTRON_HOST || '0.0.0.0',
        width: Number(process.env.RENDERTRON_WIDTH || 1000),
        height: Number(process.env.RENDERTRON_HEIGHT || 1000),
        headers: JSON.parse(process.env.RENDERTRON_HEADERS || '{}'),
        puppeteerArgs: JSON.parse(process.env.RENDERTRON_ARGS || `[
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--disable-setuid-sandbox",
          "--ignore-certificate-errors",
          "--no-first-run",
          "--no-sandbox",
          "--no-zygote",
          "--single-process"
        ]`)
    };

    static async getConfiguration(): Promise<Config> {
        // Load config.json if it exists.
        if (fse.pathExistsSync(CONFIG_PATH)) {
            const configJson = await fse.readJson(CONFIG_PATH);

            // merge cacheConfig
            const cacheConfig = Object.assign(ConfigManager.config.cacheConfig, configJson.cacheConfig);

            ConfigManager.config = Object.assign(ConfigManager.config, configJson);

            ConfigManager.config.cacheConfig = cacheConfig;
        }
        return ConfigManager.config;
    }
}

