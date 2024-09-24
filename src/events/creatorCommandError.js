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
const { EmbedBuilder } = require('discord.js');

module.exports = class ListenerCreatorCommandError extends Listener {
    constructor () {
        super('creatorCommandError', {
            emitter: 'creator',
            event: 'commandError'
        });
    }

    async exec (command, err, ctx) {
        await ctx.defer();

        switch (err.type) {
        case 'NO_DMS_ALLOWED': {
            return this.client.ui.reply(ctx, 'no', 'This command cannot be used in Direct Messages.');
        }
        default: {
            const commandName = `/${command.commandName} ${`${ctx.subcommands[0]} ` ?? ''}${ctx.subcommands[1] ?? ''}`;
            const bruhMoment = new EmbedBuilder()
                .setColor('FF0000')
                .setDescription('💢 Bruh Moment')
                .setFooter({
                    text: 'Something bad happened. An error report was sent to the bot owner.'
                });

            await ctx.send({ embeds: [bruhMoment] });
            this.client.ui.recordError(this.client, commandName, 'Command Error', err);
            this.client.logger.error(`[SlashCreator] Error in slash command "${command.commandName}"\n${err.stack}`);
        }
        }
    }
};
