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

/* eslint-disable no-multi-spaces */
/* eslint-disable no-unused-vars */

const { stripIndents } = require('common-tags');
const {
    Message,
    ActionRowBuilder,
    ColorResolvable,
    EmojiResolvable,
    GuildMember,
    ChannelType,
    PermissionsBitField,
    ChatInputCommandInteraction,
    InteractionResponse,
    EmbedBuilder,
    User
} = require('discord.js');
const { Queue } = require('distube');
const { CommandContext, Member } = require('slash-create');

let baseEmbed = {};
/**
 * The overall structured embed to use for the UI.
 *
 * @param {ColorResolvable} color The color of the embed.
 * @param {EmojiResolvable} emoji The emoji to add to the message.
 * @param {GuildMember|Member} author The author of the embed. Usually the member of a guild.
 * @param {string} title The title of the embed.
 * @param {string} desc The description of the embed.
 * @param {string} footer The footer of the embed.
 * @returns The object used to construct an embed.
 */
const embedUI = (color, emoji, author, title, desc, footer) => {
    baseEmbed = new EmbedBuilder()
        .setColor(color)
        .setAuthor({
            name: author.user.tag,
            url: author.user.avatarURL()
        })
        .setDescription(`${emoji} ${desc}`);

    if (title) {
        baseEmbed
            .setTitle(`${emoji} ${title}`)
            .setDescription(`${desc}`);
    }

    if (footer) {
        baseEmbed.setFooter({
            text: `${footer}`
        });
    }

    return baseEmbed;
};

/**
 * The overall structured message to use for the UI.
 * Should be used if the bot doesn't have permission to embed links.
 *
 * @param {EmojiResolvable} emoji The emoji to use in the message.
 * @param {GuildMember|Member} author The author of the embed. Usually the member of a guild.
 * @param {string} title The title of the message.
 * @param {string} desc The description of the message.
 * @returns The constructed message.
 */
const stringUI = (emoji, author, title, desc) => {
    let msgString = `${emoji} ${desc}`;
    if (title) msgString = `${emoji} **${title}**\n${desc}`;
    return msgString;
};

// Embed colors
const embedColor = {
    ok: process.env.COLOR_OK,
    warn: process.env.COLOR_WARN,
    error: process.env.COLOR_ERROR,
    info: process.env.COLOR_INFO,
    no: process.env.COLOR_NO
};

/**
 * The bot's user interface.
 */
class WeebUI {
    /**
     * Replies to the user as an embed, or a standard text message if the bot doesn't
     * have the **Embed Links** permission. Supported types are `ok` for success, `warn`
     * for warnings, `error` for errors, `info` for information, and `no` for forbidden.
     *
     * @example <ChadUI>.reply(message, 'ok', 'The task failed successfully!')
     * @param {(Message|CommandContext|ChatInputCommandInteraction)} msg The message object or an interaction.
     * @param {string} type The type of interface to provide.
     * @param {string} description The overall message.
     * @param {string} [title] The title of the embed or message.
     * @param {string} [footer] The footer of the embed.
     * @param {ActionRowBuilder[]} [buttons] The components to add to the message. Supports only `Discord.ButtonBuilder`.
     * @param {boolean} [mention] Whether to mention the user.
     * @param {boolean} [ephemeral] Whether the response to the interaction should be ephemeral.
     * @returns {(Message|CommandContext|InteractionResponse)} The message to send in the channel.
     */
    static reply (msg, type, description, title, footer, ephemeral, buttons, mention) {
        let embedEmoji = {
            ok: process.env.EMOJI_OK ?? ':white_check_mark:',
            warn: process.env.EMOJI_WARN ?? ':warning:',
            error: process.env.EMOJI_ERROR ?? ':x:',
            info: process.env.EMOJI_INFO ?? ':information_source:',
            no: process.env.EMOJI_NO ?? ':no_entry_sign:'
        };

        const embed = embedUI(embedColor[type], embedEmoji[type], msg.member, title || null, description || null, footer || null);
        if (msg instanceof CommandContext) {
            return msg.send({
                embeds: [embed],
                components: buttons || [],
                ephemeral: ephemeral ?? false
            });
        } else {
            const client = msg.channel.client;

            let emojiPerms;
            let embedPerms;
            try {
                emojiPerms = msg.channel.permissionsFor(client.user.id).has(PermissionsBitField.Flags.UseExternalEmojis);
                embedPerms = msg.channel.permissionsFor(client.user.id).has(PermissionsBitField.Flags.EmbedLinks);
            } catch {
                emojiPerms = true;
                embedPerms = true;
            }

            embedEmoji = {
                ok: emojiPerms ? process.env.EMOJI_OK : ':white_check_mark:',
                warn: emojiPerms ? process.env.EMOJI_WARN : ':warning:',
                error: emojiPerms ? process.env.EMOJI_ERROR : ':x:',
                info: emojiPerms ? process.env.EMOJI_INFO : ':information_source:',
                no: emojiPerms ? process.env.EMOJI_NO : ':no_entry_sign:'
            };

            if (!embedPerms) {
                return msg.reply({
                    content: stringUI(embedEmoji[type], msg.member, title || null, description || null),
                    components: buttons || [],
                    ephemeral: ephemeral ?? false,
                    allowedMentions: {
                        repliedUser: mention ?? false
                    }
                });
            } else {
                return msg.reply({
                    embeds: [embed],
                    components: buttons || [],
                    ephemeral: ephemeral ?? false,
                    allowedMentions: {
                        repliedUser: mention ?? false
                    }
                });
            }
        }
    }

    /**
     * Replies with a custom embed with any emoji or color of your choosing.
     * If the bot doesn't have the permission to **Embed Links**, you can only apply a custom emoji.
     *
     * @param {(Message|CommandContext|ChatInputCommandInteraction)} msg A MessageResolvable | `Discord.Message`
     * @param {string} emoji The emoji of the message.
     * @param {number} [color] The color of the embed, if the bot has the **Embed Links** permission.
     * @param {string} description The overall message.
     * @param {string} [title] The title of the message.
     * @param {string} [footer] The footer of the message.
     * @param {ActionRowBuilder[]} [buttons] The components to add to the message.`.
     * @param {boolean} [mention] Whether to mention the user.
     * @param {boolean} [ephemeral] Whether the response to the interaction should be ephemeral.
     * @returns {(Message|CommandContext|InteractionResponse)} The message to reply to the user.
     */
    static custom (msg, emoji, color, description, title, footer, ephemeral, buttons, mention) {
        const embed = embedUI(color, emoji || null, msg.member, title || null, description || null, footer || null);

        if (msg instanceof CommandContext) {
            return msg.send({
                embeds: [embed],
                components: buttons || [],
                ephemeral: ephemeral ?? false
            });
        } else {
            let embedPerms;
            try {
                embedPerms = msg.channel.permissionsFor(msg.channel.client.user.id).has(PermissionsBitField.Flags.EmbedLinks);
            } catch {
                embedPerms = true;
            }

            if (!embedPerms) {
                return msg.reply({
                    content: stringUI(emoji || null, title || null, description || null),
                    components: buttons || [],
                    ephemeral: ephemeral ?? false,
                    allowedMentions: {
                        repliedUser: mention ?? false
                    }
                });
            } else {
                return msg.reply({
                    embeds: [embed],
                    components: buttons || [],
                    ephemeral: ephemeral ?? false,
                    allowedMentions: {
                        repliedUser: mention ?? false
                    }
                });
            }
        }
    }

    /**
     * Returns the emoji icon of the player's volume.
     * @param {Queue} queue
     */
    static volumeEmoji (queue) {
        const volumeIcon = {
            0: ':mute:',
            50: ':speaker:',
            100: ':sound:',
            150: ':loud_sound:',
            200: ':loud_sound::zap:',
            250: ':loud_sound::zap::warning:'
        };
        if (queue.node.volume >= 250) return ':loud_sound::sob::ok_hand:';
        return volumeIcon[Math.ceil(queue.node.volume / 50) * 50];
    }

    /**
     * Sends pre-configured messages for common prompts throughout the bot.
     *
     * @param {Message|CommandContext} msg The overall message, or an interaction.
     * @param {string} prompt The prompt to provide in the message.
     * @param {any} extra Any extra variables to provide to the prompt.
     * @returns {(Message|CommandContext|InteractionResponse)} The selected prompt.
     */
    static sendPrompt (msg, prompt, extra) {
        const promptMessage = {
            DJ_MODE: 'DJ Mode is currently active. You must be a DJ to use the player at this time.',
            NO_DJ: 'You must be a DJ or have the **Manage Channels** permission to use that.',
            FEATURE_DISABLED: `You cannot use this command because **${extra}** is disabled on this server.`,
            FILTER_NOT_APPLIED: `**${extra}** is not applied to the player.`,
            FILTERS_NOT_ALLOWED: 'Filters can only be applied by DJs on this server.',
            FULL_CHANNEL: 'The voice channel is full.',
            NOT_ALONE: 'You must be a DJ or have the **Manage Channels** permission to use that. However, being alone with me in the voice channel will work.',
            NOT_PLAYING: 'Nothing is playing right now.',
            NOT_IN_VC: 'You\'re not in a voice channel.',
            ALREADY_SUMMONED_ELSEWHERE: 'You must be in the same voice channel that I\'m in to do that.',
            MISSING_CONNECT: `Missing **Connect** permission for <#${extra}>`,
            MISSING_SPEAK: `Missing **Request to Speak** permission for <#${extra}>.`,
            MISSING_CLIENT_PERMISSIONS: `Missing **${extra}** permission(s) to run that command.`,
            MISSING_PERMISSIONS: `You need the **${extra}** permission(s) to use that command.`,
            WRONG_TEXT_CHANNEL_MUSIC: `Music commands must be used in <#${extra}>`,
            OWNER_ONLY: 'This command is for the bot owner only.',
            NSFW_ONLY: 'This command must be used in NSFW channels.'
        };

        const promptType = {
            DJ_MODE: 'no',
            NO_DJ: 'no',
            FEATURE_DISABLED: 'no',
            FILTER_NOT_APPLIED: 'error',
            FILTERS_NOT_ALLOWED: 'no',
            FULL_CHANNEL: 'error',
            NOT_ALONE: 'no',
            NOT_PLAYING: 'warn',
            NOT_IN_VC: 'warn',
            ALREADY_SUMMONED_ELSEWHERE: 'warn',
            MISSING_CONNECT: 'no',
            MISSING_SPEAK: 'no',
            MISSING_CLIENT_PERMISSIONS: 'warn',
            MISSING_PERMISSIONS: 'no',
            WRONG_TEXT_CHANNEL_MUSIC: 'no',
            OWNER_ONLY: 'no',
            NSFW_ONLY: 'no'
        };

        return this.reply(msg, promptType[prompt], promptMessage[prompt]);
    }

    /**
     * Sends an error report to the given bug reports channel, if one was provided in the `.env` file.
     *
     * @param {Client} client An instance of `Discord.Client`
     * @param {string} command [Optional] The command of the bug report.
     * @param {string} title The title of the bug report.
     * @param {Error} error The error of the bug report.
     * @returns {Message} The overall bug report.
     */
    static recordError (client, command, title, error) { // TODO: Remove 'type'.
        const errorChannel = client.channels.cache.get(process.env.BUG_CHANNEL);
        if (!errorChannel) return;

        const errorContent = `${process.env.EMOJI_WARN || ':warning:'} An error has occured in the application. Please report this to the developer.\n\n**${title}**${command ? ` in \`${command}\`` : ''}\n\`\`\`js\n${error.stack ?? 'N/A'}\`\`\``;

        return errorChannel.send({ content: `${errorContent}` });
    }
}

module.exports = WeebUI;
