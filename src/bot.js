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

'use strict';

const logger = require('./lib/Logger.js');
const { AkairoClient, ListenerHandler } = require('discord-akairo');
const { GatewayIntentBits, Partials, REST } = require('discord.js');
const { SlashCreator, GatewayServer } = require('slash-create');
const DisTube = require('distube').default;
const { SpotifyPlugin } = require('@distube/spotify');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const Enmap = require('enmap');
const WeebUI = require('./lib/WeebUI.js');
const WeebUtils = require('./lib/WeebUtils.js');
const path = require('node:path');
const fs = require('node:fs');
const { version } = require('../package.json');
const { getInfo, ClusterClient } = require('discord-hybrid-sharding');
const { YouTubePlugin } = require('@distube/youtube');
const { FilePlugin } = require('@distube/file');
const { DirectLinkPlugin } = require('@distube/direct-link');
const { default: SoundCloudPlugin } = require('@distube/soundcloud');
const { default: DeezerPlugin } = require('@distube/deezer');
const { Player } = require('discord-player');
const { YoutubeiExtractor } = require('discord-player-youtubei');

// Let's boogie!
class RadioChan extends AkairoClient {
    constructor () {
        super({
            ownerID: undefined // Applied after ready event.
        }, {
            allowedMentions: {
                repliedUser: false
            },
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.DirectMessageReactions
            ],
            partials: [
                Partials.Channel,
                Partials.Message,
                Partials.User
            ],
            shards: process.env.SHARDING ? getInfo().SHARD_LIST : [0],
            shardCount: process.env.SHARDING ? getInfo().TOTAL_SHARDS : 1
        });

        // Hybrid sharding
        this.cluster = process.env.SHARDING ? new ClusterClient(this) : undefined;

        // Calling packages that can be used throughout the client.
        this.logger = logger;
        this.ui = WeebUI;
        this.utils = WeebUtils;
        this.extraUtils = require('bot-utils');
        this.rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

        // Bot version.
        this.version = `${version}`;

        this.settings = new Enmap({ name: 'settings' });
        this.playlists = new Enmap({ name: 'playlists' });

        this.defaultSettings = {
            prefix: process.env.PREFIX,
            djRole: null,
            djMode: false,
            maxTime: null,
            maxQueueLimit: null,
            allowFilters: true,
            allowAgeRestricted: true,
            allowFreeVolume: false,
            allowLinks: true,
            allowSilent: true,
            defaultVolume: 100,
            textChannel: null,
            songVcStatus: true,
            votingPercent: 0.5,
            blockedPhrases: [],
            thumbnailSize: 'small',
            emptyCooldown: 60,
            leaveOnStop: true,
            leaveOnEmpty: true,
            leaveOnFinish: true
        };

        this.defaultGlobalSettings = {
            emitNewSongOnly: true,
            streamType: 0,
            emojis: {
                message: {
                    ok: ':white_check_mark:',
                    warn: ':warning:',
                    err: ':x:',
                    info: ':information_source:',
                    question: ':question_mark:',
                    no: ':no_entry_sign:',
                    loading: ':watch:',
                    cutie: ':notes:',
                    music: ':musical_note:'
                },
                reaction: {
                    ok: '✅',
                    warn: ':warning:️',
                    err: ':x:',
                    info: ':information_source:',
                    question: '❓',
                    no: ':no_entry_sign:',
                    loading: '⌚',
                    cutie: '🎶',
                    music: '🎵'
                },
                buttons: {
                    first: '⏮',
                    previous: '⬅',
                    nest: '➡',
                    last: '⏭️',
                    jump: '↗',
                    close: '✖'
                }
            },
            colors: {
                ok: 7844437,
                warn: 16763981,
                info: 37887,
                err: 16711680,
                question: 12020223,
                no: 14495300,
                music: 37887
            }
        };

        this.settings.ensure('global', this.defaultGlobalSettings);

        this.cookies = () => {
            const cookies = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'cookies.json')));
            if (cookies.length === 0) {
                return process.env.YOUTUBE_COOKIE;
            } else {
                return cookies;
            }
        };

        // Player Plugins
        // Direct Link
        const directLink = new DirectLinkPlugin();

        // Deezer
        const deezer = new DeezerPlugin();

        // Files
        const files = new FilePlugin();

        // SoundCloud
        const soundcloud = new SoundCloudPlugin({
            clientId: process.env.SOUNDCLOUD_CLIENT_ID ?? undefined,
            oauthToken: process.env.SOUNDCLOUD_OAUTH_TOKEN ?? undefined
        });

        // Spotify
        const spotify = new SpotifyPlugin({
            api: {
                clientId: process.env.SPOTIFY_CLIENT_ID ?? undefined,
                clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? undefined,
                topTracksCountry: process.env.SPOTIFY_TOP_TRACKS_COUNTRY ?? undefined
            }
        });

        // YouTube
        const youtube = new YouTubePlugin({
            cookies: this.cookies(),
            ytdlOptions: {
                quality: 'highestaudio',
                filter: 'audioonly',
                dlChunkSize: 25000,
                highWaterMark: 1024
            }
        });

        // yt-dlp
        const ytdlp = new YtDlpPlugin({
            update: process.env.UPDATE_YTDLP ?? true
        });

        // Music Player.
        this.player = new DisTube(this, {
            plugins: [
                directLink,
                deezer,
                files,
                soundcloud,
                spotify,
                youtube,
                ytdlp
            ],
            emitAddListWhenCreatingQueue: true,
            emitAddSongWhenCreatingQueue: true,
            emitNewSongOnly: this.settings.get('global', 'emitNewSongOnly') ?? true,
            nsfw: true // Being handled on a per guild basis, not client-wide.
        });
        this.vc = this.player.voices; // @discordjs/voice
        this.player.sudoAccess = [];

        // Attaching plugins to player for easy access.
        this.player.directLink = directLink;
        this.player.deezer = deezer;
        this.player.files = files;
        this.player.soundcloud = soundcloud;
        this.player.spotify = spotify;
        this.player.youtube = youtube;
        this.player.ytdlp = ytdlp;

        this._player = new Player(this, {
            ipconfig: {
                blocks: process.env.IPV6_BLOCK ? [process.env.IPV6_BLOCK] : []
            },
            skipFFmpeg: this.settings.get('global', 'skipFfmpeg') ?? false
        });

        this._player.extractors.loadDefault((ext) => ext !== 'YouTubeExtractor');
        this._player.extractors.register(YoutubeiExtractor, {
            overrideBridgeMode: 'ytmusic',
            streamOptions: {
                highWaterMark: 1024
            }
        });

        // Create Listener Handler
        this.listeners = new ListenerHandler(this, {
            directory: './src/events'
        });

        this.creator = new SlashCreator({
            token: process.env.TOKEN,
            applicationID: process.env.APP_ID,
            publicKey: process.env.PUBLIC_KEY,
            client: this,
            disableTimeouts: true,
            unknownCommandResponse: false
        });

        // Gateway Server
        this.creator.withServer(
            new GatewayServer(
                (handler) => this.ws.on('INTERACTION_CREATE', handler)
            )
        );

        // Set custom emitters
        this.listeners.setEmitters({
            process,
            player: this.player,
            _player: this._player,
            playerEvents: this._player.events,
            creator: this.creator
        });

        this.listeners.loadAll(); // Load all Listeners.
    }

    /**
     * Logs the client into Discord.
     * @param {string} token Your bot's token.
     */
    async login (token) {
        try {
            return await super.login(token);
        } catch {
            logger.error('An invalid token was provided. Please provide your bot\'s token in the TOKEN environment variable. Learn more: https://200percentmicky.github.io/radio-chan/setup/configuration');
            process.exit(1);
        }
    }

    /**
     * Logs the client off Discord and destorys the client.
     * @param {Number} exitCode Exit code for process exit. Default is 0
     */
    async die (exitCode = 0) {
        logger.warn('Shutting down...');
        this.creator.cleanRegisteredComponents();
        this._player.destroy();
        this.destroy();
        process.exitCode = exitCode;
    }
}

if (process.env.SHARDING) {
    try {
        new RadioChan().login(process.env.TOKEN);
    } catch (err) {
        logger.error(`Radio-chan failed to start! :(\n${err.stack}`);
        process.exit(1);
    }
}

module.exports = RadioChan;
