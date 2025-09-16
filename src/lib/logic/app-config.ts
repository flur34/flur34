import { env } from '$env/dynamic/public';

export const APP_NAME: string = env['PUBLIC_APP_NAME'] ?? 'flur34';
export const SOURCE_CODE_URL = env['PUBLIC_SOURCE_URL'] ?? 'https://github.com/flur34/flur34';
export const DISCORD_URL = env['PUBLIC_DISCORD_URL'] ?? 'https://discord.gg/AxUnC7n9ZP';
export const SPONSOR_URL = env['PUBLIC_SPONSOR_URL'] ?? 'https://ko-fi.com/flurbudurbur';
