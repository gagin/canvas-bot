# Canvas interface for an agent

## Use case
Use case: when working on a document, I want to be able to edit it, and to select some parts of it and write a comment. I work with documents visually. But I want to work with an agent. So changes I made and comments I made should be given to the agent. And response should be returned from agent in a format that visualizes on the same canvas.

So instead of saying "Not xxxx, actually yyy" which is a reference to where xxx is mentioned in the document, i want to select wrong part and write on it

## Expansion
Besides working on a document, I want whole dialog in visual - so some aspect of structure would be visual to me, and, for example, if i switch topic, i put a new box - visually separate from previous discussion, and agent should get that information in its context.

## Can it be a goodle doc plugin?

## Considertions

If I edited the document, the agent should have updated version in the context. On the other hand, it should be aware these parts look differently before. So instead of original+edit it should have current+histories in the context. That implies two different modes - for opensource and closedsource agents. Or, rather, vanilla and modified. With vanilla (closesource or unmodded opensource) we can't modify context this way.

Second questions:
- what about non-linearly text documents - present in a 1-to-1 source code?

# Answers

Generally, humans and agent work with conceptually different information flows. THis is not just a visual editor with agent on top. This is in principle a format gateway. It's not "change this part of the document" - it should be essentially the same as writing in the chat a comment on this section. SO for vanilla agents should be same. A discussion on managing context is perheps next step ideation, not first pilot feature. A visual editor with AI helper would be focusing on edits. Here it's persistent context of the whole document and flow of its changes, chronologically ordered. 
Google docs already solves multi-user sync for changes and comments.
Agent already has history of changes in the dialog, supposedly cached. So we need to inject new commands in the same session.

---

## Pilot Implementation (Apr 2026)

### What was built
- Local loop experiment with React + Monaco editor + Opencode SDK
- Visual selection → comment → agent response flow
- Accept/reject UI for agent responses

### How to run
```bash
make dev
# Or manually:
opencode serve &
cd server && npx tsx src/index.ts &
cd client && npx vite
```

### Endpoints
- Client: http://localhost:5173
- Canvaz Server: http://localhost:4097
- Opencode Server: http://localhost:4096

### Next steps
1. File open/save (currently uses demo content)
2. Visual comment annotations on document
3. Better response parsing (detect proposed edits vs text)
4. Undo/redo for accepted changes
