# bot.py
# from email import message
import os
from unicodedata import name
from web3 import Web3
import math

from time import time
import discord
from dotenv import load_dotenv

web3 = Web3()

load_dotenv()
TOKEN = os.getenv('DISCORD_TOKEN')
DAPP_URL =  os.getenv('DAPP_URL')

assert(TOKEN is not None)

client = discord.Client()

def get_message_to_sign(username, address):
    timestamp = math.floor(time() / 5*60)
    text = username
    signature = web3.keccak(text=text)
    return signature

def get_dapp_signer_url(message, address, discord_name):
    return DAPP_URL + '/discord/?message=' + message.hex() + '&signer=' + address + '&discord_name=' + discord_name


@client.event
async def on_ready():
    print(f'{client.user.name} has connected to Discord!')

@client.event
async def on_member_join(member):
    await member.create_dm()
    await member.dm_channel.send(
        f'Hi {member.name}, welcome to my Discord server!'
    )

@client.event
async def on_message(message: discord.Message):
    if message.author.bot:
        return
    channel = message.channel
    # if message.channel
    if channel.type is discord.ChannelType.private:
        if message.content.startswith('authenticate'):
            arguments = message.content.split(' ')
            address = arguments[1]
            if web3.isAddress(address):
                username = message.author.name + '#' + message.author.discriminator
                await channel.send('authentication link: ' +
                 get_dapp_signer_url(get_message_to_sign(username, address), address, username))
            else:
                await channel.send('Invalid address')




    else:
        if message.content.startswith('$greet'):
            channel = message.channel
            greeting = 'Hello ' + message.author.display_name + '!'
            await channel.send(greeting)
        if message.content.startswith('$help'):
            channel = message.channel
            help_message = ('This is best play list ever voting bot!!!1\n\n'
            'Possible commands are:\n\n'
            'Public channel: \n'
            '`$bp new <NUMBER_OF_ROUNDS[int]> <ROUND_DURATION[days int]> <VOTING_DURATION[days int]> <SUBMITING_DURATION[days int]> <STAKE_TOKEN_ADDRESS> <MIN_STAKE * 1e18>`  - creates new game (admin only)\n'
            '`$bp open registration <MAX_PARTICIPANTS[int]> <ENTRY_FEE(optional) [1e18]>` - open registrations to join the game (admin only)\n'
            '`$bp start game` - starts round 1 (admin only)\n'
            '`$bp abort` - aborts current game (admin only)\n'
            '`$bp next round` - starts next round if round duration is over (anyone)\n'
            '`$bp current round` - shows current round info (anyone)\n'
            '`$bp scoreboard` - shows current scores over all rounds (anyone)\n'
            '`$bp join <ADDRESS>` - joins to game with wallet\n\n'
            'DM message to bot: \n'
            '`authenticate <ADDRESS>` - authenticate to use bot with wallet\n'
            '`list` - lists current songs for voting (any)\n'
            '`vote <SONG_ID>` - votes for playlist (participants)\n'
            '`submit <SPOTIFY_URL>` - submits a song (participants)\n'
            )

            await channel.send(help_message)

            # def check(m):
            #     return m.content == 'hello' and m.channel == channel

            # msg = await client.wait_for('message', check=check)
            # await channel.send('Hello {.author}!'.format(msg))

client.run(TOKEN)