/**
 * Parses Discord message JSON and extracts all Geoguessr challenge links from each message.
 * @param {Object} discordJson - The Discord message JSON object
 * @returns {Object} An object with key as yyyy-mm-dd and value as array of challenge links
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
                if (result[date]) {
                    result[date].push(...match);
                } else {
                    result[date] = [...match];
                }
            }
        }
    });
    return result;
};
