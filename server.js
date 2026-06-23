require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');
const os = require('os');
const commands = require('./commands.json');
const cron = require('node-cron');

// Inisialisasi Bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Slash Commands (Perintah /)
const command = commands.map(cmd => ({
    name: cmd.name,
    description: cmd.description
}));

// Daftarkan Slash Commands ke Discord
client.once('ready', async () => {
    console.log(`Bot online has ${client.user.tag}!`);

    // Kirim pesan ke channel umum saat bot online
    const generalChannelId = process.env.GENERAL_CHANNEL_ID;
    const generalChannel = await client.channels.fetch(generalChannelId);
    if (generalChannel) {
        generalChannel.send('Use /help for see another commands.');
    } else {
        console.error('Failed find channel with ID:', generalChannelId);
    }


    const codmChannelId = process.env.GAMES_CODM_CHANNEL_ID;
    const codmChannel = await client.channels.fetch(codmChannelId);
    cron.schedule('00 19 * * *', () => {
        if (codmChannel) {
            codmChannel.send('Good night, CODM players! Don\'t forget to check out the latest updates and events in the game. Stay sharp and have fun playing!');
        } else {
            console.error('Failed find channel with ID:', codmChannelId);
        }
    }, {
        timezone: 'Asia/Jakarta'
    });

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log('Registering slash commands...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: command },
        );
        console.log('Slash commands was registered!');
    } catch (error) {
        console.error(error);
    }
});

// Logika perintah
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'status') {
        // Ambil data hardware dari OS Linux Xubuntu
        const totalMem = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
        const freeMem = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);
        const usedMem = (totalMem - freeMem).toFixed(2);
        const uptime = (os.uptime() / 3600).toFixed(2);
        const osType = os.type();
        const osArch = os.arch();

        // Bikin tampilan kotak (Embed)
        const statusEmbed = new EmbedBuilder()
            .setColor('#969696')
            .setTitle('🖥️ Server Status')
            .addFields(
                { name: 'RAM Usage', value: `${usedMem} GB / ${totalMem} GB`, inline: true },
                { name: 'Free RAM', value: `${freeMem} GB`, inline: true },
                { name: 'Bot Uptime', value: `${uptime} Hours`, inline: false },
                { name: 'OS Type', value: osType, inline: true },
                { name: 'OS Architecture', value: osArch, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [statusEmbed] });
    }

    if (commandName === 'help') {
        const helpEmbed = new EmbedBuilder()
            .setColor('#969696')
            .setTitle('📋 Available Commands')
            .setDescription('Here are the available commands:')
            .addFields(
                { name: '/status', value: 'Checking hardware server status' },
                { name: '/help', value: 'Displaying available commands' }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [helpEmbed] });
    }
});

// Login ke Discord
client.login(process.env.DISCORD_TOKEN);