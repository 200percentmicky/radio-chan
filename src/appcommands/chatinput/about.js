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

const { SlashCommand } = require('slash-create');
const { version } = require('../../../package.json');
const Discord = require('discord.js');
const { useMainPlayer } = require('discord-player');
const prettyms = require('pretty-ms');
const { stripIndents } = require('common-tags');

class CommandAbout extends SlashCommand {
    constructor (creator) {
        super(creator, {
            name: 'about',
            description: `This application is running an instance of Radio-chan! v${version}`
        });

        this.filePath = __filename;
    }

    async run (ctx) {
        const player = useMainPlayer();

        if (!this.client.owner) await this.client.application.fetch();

        const owner = this.client.owner instanceof Discord.Team ? `${this.client.owner?.name}` : `${this.client.owner?.tag.replace(/#0{1,1}$/, '')} (${this.client.owner?.id})`;
        // Had to fetch this for some reason...
        const botColor = await this.client.guilds.cache.get(ctx.guildID).members.me.displayColor ?? null;
        const aboutembed = new Discord.EmbedBuilder()
            .setColor(botColor)
            .setTitle('Radio-chan')
            .setDescription('A self-hostable audio playing Discord bot for your Discord server.')
            .addFields({
                name: `${process.env.EMOJI_INFO} Stats`,
                value: stripIndents`
                **Client:** ${this.client.user.tag.replace(/#0{1,1}$/, '')} (\`${this.client.user.id}\`)
                **Bot Version:** ${this.client.version}
                **Node.js:** ${process.version}
                **Discord.js:** ${Discord.version}
                **Discord Player:** ${player.version}
                **slash-create:** ${this.client.creator.version}
                **Active players:** ${player.nodes.cache.size}
                **Uptime:** ${prettyms(this.client.uptime, { verbose: true })}
                `,
                inline: true
            })
            .setFooter({
                text: `The owner of this instance is ${owner}`,
                iconURL: this.client.owner instanceof Discord.Team ? this.client.owner?.iconURL() : this.client.owner?.avatarURL({ dynamic: true })
            });

        const urlGithub = new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Link)
            .setURL('https://github.com/200percentmicky/radio-chan')
            .setLabel('GitHub');

        const support = new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Link)
            .setURL('https://discord.com/invite/qQuJ9YQ')
            .setLabel('Support Server');

        const docsButton = new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Link)
            .setURL('https://200percentmicky.github.io/radio-chan')
            .setLabel('Documentation');

        const actionRow = new Discord.ActionRowBuilder()
            .addComponents([urlGithub, support, docsButton]);

        return ctx.send({ embeds: [aboutembed], components: [actionRow] });
    }
}

module.exports = CommandAbout;
