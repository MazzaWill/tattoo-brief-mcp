#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { buildBrief, checkLegibility, lineArtPrompt, DETAILS, type Detail } from "./logic.js";

const server = new McpServer({ name: "tattoo-brief-mcp", version: "0.1.0" });

server.tool("build_tattoo_brief", "Turn a tattoo idea, style, placement and size into a structured brief to bring to a tattoo artist.",
  { idea: z.string().min(1), style: z.string().min(1), placement: z.string().min(1), size_cm: z.number().positive().max(200),
    color: z.string().optional(), must_include: z.array(z.string()).optional(), avoid: z.array(z.string()).optional() },
  async (a) => ({ content: [{ type: "text", text: buildBrief(a) }] }));

server.tool("check_small_size_legibility", "Heuristic blur-risk check for tattoo details at a given size. Rules of thumb only, not a guarantee.",
  { size_cm: z.number().positive().max(200), details: z.array(z.enum(DETAILS as [Detail, ...Detail[]])).min(1) },
  async ({ size_cm, details }) => ({ content: [{ type: "text", text: JSON.stringify(checkLegibility(size_cm, details), null, 2) }] }));

server.tool("line_art_prompt", "Write a clean line-art prompt (plus negative prompt) for an AI tattoo generator.",
  { subject: z.string().min(1), style: z.string().optional(), line_weight: z.enum(["fine", "medium", "bold"]).optional(),
    composition: z.string().optional(), extra: z.array(z.string()).optional() },
  async (a) => ({ content: [{ type: "text", text: JSON.stringify(lineArtPrompt(a), null, 2) }] }));

await server.connect(new StdioServerTransport());
