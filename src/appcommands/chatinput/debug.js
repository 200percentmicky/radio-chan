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
const { version: scVersion } = require('slash-create/package.json');
const Discord = require('discord.js');
const { useMainPlayer } = require('discord-player');
const prettyms = require('pretty-ms');
const prettyBytes = require('pretty-bytes');
const { stripIndents } = require('common-tags');
const os = require('node:os');
const si = require('systeminformation');

class CommandDebug extends SlashCommand {
    constructor (creator) {
        super(creator, {
            name: 'debug',
            description: 'Displays debugging information.'
        });

        this.filePath = __filename;
    }

    async run (ctx) {
        await ctx.defer(true);

        const guild = this.client.guilds.cache.get(ctx.guildID);

        const osSi = await si.osInfo();
        const memory = await si.mem();
        const user = os.userInfo();

        const player = useMainPlayer();

        if (!this.client.owner) await this.client.application.fetch();
        const owner = this.client.owner instanceof Discord.Team ? `${this.client.owner?.name}` : `${this.client.owner?.tag.replace(/#0{1,1}$/, '')} (${this.client.owner?.id})`;

        let kernel;
        let release;
        switch (osSi.platform) {
        case 'Windows':
            kernel = `Windows NT ${osSi.kernel} Service Pack ${osSi.servicepack}`;
            release = `${osSi.release} (Build ${osSi.build})`;
            break;
        case 'darwin':
            kernel = `Darwin ${osSi.kernel} ${osSi.build}`;
            release = `${osSi.codename} ${osSi.release}`;
            break;
        case 'linux':
            kernel = `Linux ${osSi.kernel} ${osSi.build}`;
            release = `${osSi.release} ${osSi.codename}`;
            break;
        }

        const data = stripIndents`
        === Radio-chan ===
        Version :: ${this.client.version}
        
        Client :: ${this.client.user.tag.replace(/#0{1,1}$/, '')} (ID: ${this.client.user.id})
        Owner :: ${owner}
        Node.js :: ${process.version}
        Discord.js :: ${Discord.version}
        Discord Player :: ${player.version}
        slash-create :: ${scVersion}
        Active players :: ${player.nodes.cache.size}
        Uptime :: ${prettyms(this.client.uptime, { verbose: true })}
        Cluster ID :: ${this.client.cluster?.id ?? 'N/A'}
        Shard ID :: ${guild.shardId ?? 'N/A'}
    
        System
        ------
        CPU :: ${os.cpus()[0].model}
        CPU Speed :: ${os.cpus()[0].speed} MHz.
        Memory Total :: ${prettyBytes(memory.total)}
        Memory Used :: ${prettyBytes(memory.used)}
        Memory Free :: ${prettyBytes(memory.free)}
        Swap Total :: ${prettyBytes(memory.swaptotal)}
        Swap Used :: ${prettyBytes(memory.swapused)}
        Swap Free :: ${prettyBytes(memory.swapfree)}
        OS Version :: ${osSi.distro} ${release}
        Kernel :: ${kernel}
        Architechture :: ${osSi.arch}
        User :: ${user.username}
        Shell :: ${user.shell}
        `;

        return ctx.send({ content: `\`\`\`asciidoc\n${data}\`\`\`` });
    }
}

module.exports = CommandDebug;
