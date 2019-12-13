/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
const path = require('path');
const Configuration = require('../common/configuration').Configuration;
Configuration.setConfig(path.join(__dirname, './conf/config.json'));

class ServiceBase {
    constructor() {
        this._config = undefined;

        Object.defineProperty(this, 'config', {
            enumerable: true,
            configurable: false,
            get: () => {
                if (!this._config) {
                    this._config = Configuration.getInstance();
                }
                return this._config;
            },
            set: (config) => {
                this._config = config;
            }
        });
    }

    resetConfig() {
        this.config = Configuration.getInstance();
    }
}

module.exports.ServiceBase = ServiceBase;