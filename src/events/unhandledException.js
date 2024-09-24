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

const { Listener } = require('discord-akairo');

module.exports = class ListenerProcessUnhandledException extends Listener {
    constructor () {
        super('unhandledException', {
            emitter: 'process',
            event: 'unhandledException'
        });
    }

    async exec (error) {
        this.client.logger.error('Radio-chan has crashed! :(');
        this.client.logger.fatal(`[process] [FATAL]\n${error.stack}`);
        this.client.logger.error('Please report this crash to the developer. Shutting down...');
        this.client.die(1);
    }
};
