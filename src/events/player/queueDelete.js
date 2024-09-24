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
const { GuildQueueEvent } = require('discord-player');

module.exports = class ListenerQueueDelete extends Listener {
    constructor () {
        super('queueDelete', {
            emitter: 'playerEvents',
            event: GuildQueueEvent.QueueDelete
        });
    }

    async exec (queue) {
        await queue.textChannel.client.utils.setVcStatus(queue.channel, null);
    }
};
