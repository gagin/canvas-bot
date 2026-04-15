import express from 'express';
import cors from 'cors';
import { createOpencodeClient } from '@opencode-ai/sdk';

const app = express();
const PORT = 4097;

app.use(cors());
app.use(express.json());

let opencodeClient: ReturnType<typeof createOpencodeClient> | null = null;
let currentSessionId: string | null = null;

function getClient() {
  if (!opencodeClient) {
    opencodeClient = createOpencodeClient({
      baseUrl: 'http://localhost:4096',
    });
  }
  return opencodeClient;
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/session/start', async (req, res) => {
  const { path } = req.body;
  if (!path) {
    return res.status(400).json({ error: 'path required' });
  }

  try {
    const client = getClient();
    const session = await client.session.create({
      body: { title: `Canvaz session for ${path}` },
      path: path,
    });
    
    currentSessionId = session.data.id;
    res.json({ sessionId: currentSessionId, status: 'started' });
  } catch (error) {
    console.error('Failed to create session:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to create session' 
    });
  }
});

app.get('/session/messages', async (_req, res) => {
  if (!currentSessionId) {
    return res.status(400).json({ error: 'No active session' });
  }
  
  try {
    const client = getClient();
    const messages = await client.session.messages({
      path: { id: currentSessionId },
    });
    res.json({ messages: messages.data });
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

app.post('/session/prompt', async (req, res) => {
  const { content, selection } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'content required' });
  }

  if (!currentSessionId) {
    return res.status(400).json({ error: 'No active session. Call /session/start first.' });
  }

  let prompt = content;
  if (selection) {
    prompt = `Regarding the selected text "${selection}": ${content}`;
  }

  try {
    const client = getClient();
    const response = await client.session.prompt({
      path: { id: currentSessionId },
      body: {
        parts: [{ text: prompt, type: 'text' }],
      },
    });

    const responseText = response.data.parts
      ?.filter(p => p.type === 'text')
      .map(p => p.text)
      .join('\n') || 'No response text';

    res.json({ response: responseText });
  } catch (error) {
    console.error('Opencode API error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Canvaz server running on http://localhost:${PORT}`);
});
