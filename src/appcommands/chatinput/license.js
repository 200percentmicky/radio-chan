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

/*************************************************************************
 * <!> Removal of this command directly violates this program's license! *
 *************************************************************************/

const { SlashCommand } = require('slash-create');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { stripIndents } = require('common-tags');

class CommandLicense extends SlashCommand {
    constructor (creator) {
        super(creator, {
            name: 'license',
            description: "View this program's license."
        });

        this.filePath = __filename;
    }

    async run (ctx) {
        await ctx.defer(true);

        const urlGithub = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setURL('https://github.com/200percentmicky/radio-chan')
            .setLabel('GitHub');

        const support = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setURL('https://discord.com/invite/qQuJ9YQ')
            .setLabel('Support Server');

        const docsButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setURL('https://200percentmicky.github.io/radio-chan')
            .setLabel('Documentation');

        const actionRow = new ActionRowBuilder()
            .addComponents([urlGithub, support, docsButton]);

        return ctx.send({
            content: stripIndents`
            This application is running an instance of **[Radio-chan!](https://github.com/200percentmicky/radio-chan)**
            
            Radio-chan is licensed under the GNU General Public License version 3.

            This program is free software: you can redistribute it and/or modify
            it under the terms of the GNU General Public License as published by
            the Free Software Foundation, either version 3 of the License, or
            (at your option) any later version.
            
            This program is distributed in the hope that it will be useful,
            but WITHOUT ANY WARRANTY; without even the implied warranty of
            MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
            GNU General Public License for more details.
            
            You should have received a copy of the GNU General Public License
            along with this program.  If not, see <https://www.gnu.org/licenses/>.
            `,
            components: [actionRow]
        });
    }
}

module.exports = CommandLicense;
