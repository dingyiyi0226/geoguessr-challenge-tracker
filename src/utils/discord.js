/**
 * Parses Discord message JSON and extracts the first Geoguessr challenge link from each message.
 * @param {Object} discordJson - The Discord message JSON object
 * @returns {Object} An object with key as yyyy-mm-dd and value as the first challenge link
 */
export const parseDiscordMessages = (discordJson) => {
    if (!discordJson.messages || !Array.isArray(discordJson.messages)) {
        throw new Error('Invalid Discord message JSON format.');
    }
    const result = {};
    discordJson.messages.forEach(msg => {
        if (typeof msg.content === 'string' && typeof msg.timestamp === 'string') {
            const match = msg.content.match(/https:\/\/www\.geoguessr\.com\/challenge\/[a-zA-Z0-9-_]+/g);
            if (match && match.length > 0) {
                const date = msg.timestamp.slice(0, 10); // yyyy-mm-dd
                result[date] = match[0];
            }
        }
    });
    return result;
};
