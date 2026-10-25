# tattoo-brief-mcp

Official MCP Registry: `io.github.MazzaWill/tattoo-brief-mcp` · Also on [Smithery](https://smithery.ai/server/eraplug/tattoo-brief-mcp) and [Glama](https://glama.ai/mcp/servers/Stark-Will/tattoo-brief-mcp).


A small [Model Context Protocol](https://modelcontextprotocol.io) server that helps you plan a tattoo before you talk to an artist. It runs locally over stdio, needs no API keys, and every tool is deterministic (same input, same output).

Maintained by Lena Hart (ZheLogic, LLC). Homepage: https://tatany.app

## Tools

| Tool | What it does |
|---|---|
| `build_tattoo_brief` | `idea`, `style`, `placement`, `size_cm` (+ optional `color`, `must_include`, `avoid`) → a Markdown brief with placement notes and questions to ask your artist. |
| `check_small_size_legibility` | `size_cm` + `details` (e.g. `fine_lines`, `small_text`, `dotwork`, `dense_shading`, `tiny_negative_space`, `faces_portrait`, `color_gradients`, `white_ink`, `many_small_elements`, `bold_outline`) → per-detail blur risk and a suggested minimum size. |
| `line_art_prompt` | `subject` (+ optional `style`, `line_weight`, `composition`, `extra`) → a clean line-art prompt and negative prompt for an AI tattoo generator. |

**Important:** the legibility check uses simple rules of thumb. It is not a guarantee about how a tattoo will heal or age, and nothing here is medical advice. Your tattoo artist has the final say.

## Install

```bash
npm install && npm run build
```

Claude Desktop / Cursor config:

```json
{ "mcpServers": { "tattoo-brief": { "command": "node", "args": ["/path/to/tattoo-brief-mcp/dist/index.js"] } } }
```

Test all three tools: `npm test`. Or inspect interactively: `npx @modelcontextprotocol/inspector node dist/index.js`.

## License

MIT
