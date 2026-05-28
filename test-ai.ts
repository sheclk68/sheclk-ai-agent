import axios from 'axios';

const API_KEY = 'a93f53ca29bb4a1497f8471aaf2eb971';

async function callAI(prompt: string): Promise<string> {
    const res = await axios.post(
        'https://api.acedata.cloud/v1/chat/completions',
        {
            model: 'claude-sonnet-4-6',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 100,
        },
        { headers: { Authorization: 'Bearer ' + API_KEY } }
    );
    return res.data.choices[0].message.content;
}

async function main() {
    console.log('Testing AceDataCloud AI...');
    const r = await callAI('What is Solana? One sentence.');
    console.log('AI:', r);
    
    const r2 = await callAI('Explain what an autonomous AI agent is. One sentence.');
    console.log('AI2:', r2);
    
    console.log('\nAI test passed!');
}
main().catch(console.error);
