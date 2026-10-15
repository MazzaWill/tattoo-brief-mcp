import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
const c = new Client({ name: "test", version: "1" });
await c.connect(new StdioClientTransport({ command: "node", args: ["dist/index.js"] }));
const { tools } = await c.listTools();
console.log("TOOLS:", tools.map(t => t.name).join(", "));
if (tools.length !== 3) throw new Error("expected 3 tools");
const calls = [
  ["build_tattoo_brief", { idea: "a fox curled around a crescent moon", style: "fine-line", placement: "inner forearm", size_cm: 9, avoid: ["text"] }],
  ["check_small_size_legibility", { size_cm: 3, details: ["fine_lines", "small_text", "bold_outline"] }],
  ["line_art_prompt", { subject: "a swallow carrying a rose", style: "american traditional", line_weight: "bold" }],
];
for (const [name, args] of calls) {
  const r = await c.callTool({ name, arguments: args });
  if (r.isError) throw new Error(name + " failed: " + r.content[0].text);
  console.log(`\n=== ${name} ===\n${r.content[0].text}`);
}
const bad = await c.callTool({ name: "check_small_size_legibility", arguments: { size_cm: -1, details: [] } }).catch(e => ({ isError: true, e }));
console.log("\ninvalid input rejected:", !!bad.isError);
await c.close();
