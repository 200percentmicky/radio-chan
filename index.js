/// Radio-chan
/// Copyright (C) 2024-present  Micky D. (@200percentmicky)
///
/// This program is free software: you can redistribute it and/or modify
/// it under the terms of the GNU General Public License as published by
/// the Free Software Foundation, either version 3 of the License, or
/// (at your option) any later version.
///
/// This program is distributed in the hope that it will be useful,
/// but WITHOUT ANY WARRANTY; without even the implied warranty of
/// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
/// GNU General Public License for more details.
///
/// You should have received a copy of the GNU General Public License
/// along with this program.  If not, see <https://www.gnu.org/licenses/>.

/* Index File */

require('dotenv').config();
const { ClusterManager } = require('discord-hybrid-sharding');
const logger = require('./src/lib/Logger.js');

if (process.versions.node.split('.')[0] < 18) {
    logger.error(`Radio-chan requires Node.js 18 or later. You currently have ${process.versions.node} installed. Please update your Node.js installation.`);
    process.exit(1);
}

// Say hello!
const { version } = require('./package.json');
logger.info('**************************');
logger.info('* * * * Radio-chan * * * *');
logger.info('**************************');
logger.info('Created by Micky D. (@200percentmicky)');
logger.info(`Version: ${version}`);
logger.info('Loading libraries...');

if (process.env.YOUTUBE_COOKIE) {
    logger.warn('YOUTUBE_COOKIE environment variable has been deprecated. Please switch to the new cookie format by following the instructions at https://distube.js.org/#/docs/DisTube/main/general/cookie. Paste the new cookie in the cookies.json file.');
}

if (process.env.SHARDING) {
    logger.info('Starting client with sharding enabled.');

    const manager = new ClusterManager('./src/bot.js', {
        totalShards: parseInt(process.env.SHARDS) ?? 'auto',
        shardsPerClusters: parseInt(process.env.SHARDS_PER_CLUSTER) ?? 2,
        mode: 'process'
    });

    if (manager.totalShards === 'auto') {
        manager.token = process.env.TOKEN;
    }

    manager.on('clusterCreate', c => logger.info(`Cluster ${c.id} launched.`))
        .on('clusterReady', c => logger.info(`Cluster ${c.id} is ready.`));

    manager.spawn({ timeout: -1 });
} else {
    logger.info('Starting client with sharding disabled.');

    const RadioChan = require('./src/bot.js');

    try {
        new RadioChan().login(process.env.TOKEN);
    } catch (err) {
        logger.error(`RadioChan failed to start! :(\n${err.stack}`);
        process.exit(1);
    }
}
