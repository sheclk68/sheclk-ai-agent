const axios = require('axios');

const API_KEY = 'a93f53ca29bb4a1497f8471aaf2eb971';

async function main() {
    console.log('Testing AceDataCloud AI...');
    const res = await axios.post(
        'https://api.acedata.cloud/v1/chat/completions',
        {
            model: 'claude-sonnet-4-6',
            messages: [{ role: 'user', content: 'What is Solana? One sentence.' }],
            max_tokens: 100,
        },
        { headers: { Authorization: 'Bearer ' + API_KEY } }
    );
    console.log('AI:', res.data.choices[0].message.content);
    
    const res2 = await axios.post(
        'https://api.acedata.cloud/v1/chat/completions',
        {
            model: 'claude-sonnet-4-6',
            messages: [{ role: 'user', content: 'Explain autonomous AI agent. One sentence.' }],
            max_tokens: 100,
        },
        { headers: { Authorization: 'Bearer ' + API_KEY } }
    );
    console.log('AI2:', res2.data.choices[0].message.content);
    
    console.log('\nAll tests passed!');
}
main().catch(console.error);
