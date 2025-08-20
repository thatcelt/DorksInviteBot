import readline from 'node:readline/promises';

import { stdin, stdout } from 'node:process';
import { config } from 'dotenv';

import * as strings from './resources/strings.json';
import { AminoDorks } from 'amino.dorks';
config({ path: '../.env' });

export const RL_INTERFACE = readline.createInterface({ input: stdin, output: stdout });
export const STRINGS = strings;
export const AMINODORKS = new AminoDorks({
    apiKey: process.env.API_KEY as string,
    context: {
        enviroment: 'global'
    }
});

export const MAX_USERS_PER_INVITE = 100;
export const RED = '\x1b[32m';
export const RESET = '\x1b[0m';

export const COLORIZE = (text: string) => `${RED}${text}${RESET}`;
export const STRUCTURIZE = (end: string, elements: string[]): string => `${elements.map(element => `${COLORIZE('[')}${element}${COLORIZE(']')}`).join('')}: ${COLORIZE(end)}`;