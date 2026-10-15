// Deterministic tattoo-planning heuristics. No network calls, no API keys.
// All size thresholds are rules of thumb, NOT guarantees about healed results.

export type Detail =
  | "fine_lines" | "small_text" | "dotwork" | "dense_shading" | "tiny_negative_space"
  | "faces_portrait" | "color_gradients" | "white_ink" | "many_small_elements" | "bold_outline";

const PLACEMENT_NOTES: Record<string, string> = {
  forearm: "Flat, visible area; good for vertical compositions. Inner forearm skin is thinner and may be more sensitive.",
  wrist: "Small canvas with heavy movement; keep designs simple and avoid tiny text.",
  finger: "Ink on fingers commonly fades or spreads quickly; artists often advise bold, minimal designs here.",
  hand: "High-wear area; expect touch-ups. Prefer bold lines.",
  ankle: "Curved, bony surface; designs wrap. Keep the focal element on the flattest side.",
  calf: "Large, forgiving canvas; suits medium to large pieces.",
  thigh: "Large canvas; good for detailed work at larger sizes.",
  shoulder: "Curved; designs that follow the deltoid shape tend to read well.",
  back: "Largest flat canvas; suitable for big, detailed compositions.",
  chest: "Wide canvas across the pecs; symmetry matters.",
  ribs: "Skin stretches with breathing; often considered more painful. Allow extra room for line spacing.",
  neck: "Highly visible; check workplace considerations.",
  behind_ear: "Very small area; keep to simple silhouettes.",
  collarbone: "Bony and curved; horizontal, flowing designs fit best.",
};

// Minimum suggested size (cm, longest side) per detail type, heuristic only.
const MIN_CM: Record<Detail, number> = {
  fine_lines: 4, small_text: 3, dotwork: 4, dense_shading: 5, tiny_negative_space: 5,
  faces_portrait: 8, color_gradients: 5, white_ink: 6, many_small_elements: 7, bold_outline: 1.5,
};

const DETAIL_ADVICE: Record<Detail, string> = {
  fine_lines: "Fine lines placed close together can visually merge as ink settles; widen line spacing or use fewer lines.",
  small_text: "Letters with closed counters (a, e, o) can fill in; use larger letter height and simple fonts.",
  dotwork: "Very fine stipple can read as flat grey at small sizes; increase dot spacing or simplify the gradient.",
  dense_shading: "Heavy shading in a small area can turn into a dark blob; keep clear light areas.",
  tiny_negative_space: "Small skin-colored gaps can close up; make negative-space shapes larger.",
  faces_portrait: "Facial features depend on tiny value changes; portraits usually need a larger size.",
  color_gradients: "Subtle color transitions compress at small sizes; use fewer, more distinct colors.",
  white_ink: "White ink is often reported to fade or yellow; avoid relying on it for key details.",
  many_small_elements: "Many small motifs compete for space; reduce element count or enlarge the piece.",
  bold_outline: "Bold outlines generally hold up well at small sizes.",
};

export function placementNote(placement: string): string {
  const key = placement.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (PLACEMENT_NOTES[key]) return PLACEMENT_NOTES[key];
  const hit = Object.keys(PLACEMENT_NOTES).sort((x, y) => y.length - x.length).find((k) => key.includes(k));
  return hit ? PLACEMENT_NOTES[hit] : "Discuss curvature, stretch and visibility of this area with your artist.";
}

export function checkLegibility(sizeCm: number, details: Detail[]) {
  const findings = details.map((d) => {
    const min = MIN_CM[d];
    const ratio = sizeCm / min;
    const risk = ratio >= 1.25 ? "low" : ratio >= 1 ? "medium" : "high";
    return { detail: d, suggested_min_cm: min, risk, note: DETAIL_ADVICE[d] };
  });
  const order = { low: 0, medium: 1, high: 2 } as const;
  const overall = findings.reduce<"low" | "medium" | "high">(
    (acc, f) => (order[f.risk as keyof typeof order] > order[acc] ? (f.risk as any) : acc), "low");
  const suggested = findings.length ? Math.max(...findings.map((f) => f.suggested_min_cm)) : sizeCm;
  return {
    size_cm: sizeCm,
    overall_blur_risk: overall,
    suggested_min_size_cm: suggested,
    findings,
    disclaimer: "Heuristic rules of thumb only, not a guarantee. Healing, skin type, placement, aftercare and artist technique all affect results. Ask your tattoo artist.",
  };
}

export function buildBrief(a: { idea: string; style: string; placement: string; size_cm: number; color?: string; must_include?: string[]; avoid?: string[] }) {
  const color = a.color ?? "black and grey";
  const lines = [
    `# Tattoo brief: ${a.idea}`,
    ``,
    `- **Concept:** ${a.idea}`,
    `- **Style:** ${a.style}`,
    `- **Placement:** ${a.placement} — ${placementNote(a.placement)}`,
    `- **Approx. size:** ${a.size_cm} cm (longest side)`,
    `- **Color:** ${color}`,
    a.must_include?.length ? `- **Must include:** ${a.must_include.join(", ")}` : `- **Must include:** (open to artist suggestions)`,
    a.avoid?.length ? `- **Avoid:** ${a.avoid.join(", ")}` : `- **Avoid:** (none specified)`,
    ``,
    `## Questions for the artist`,
    `1. Does ${a.size_cm} cm give enough room for the details in this ${a.style} piece?`,
    `2. How should the design flow with the ${a.placement}?`,
    `3. Which details would you simplify so it ages well?`,
    `4. Do you recommend any change to line weight or color for this placement?`,
    ``,
    `_Reference images are a starting point; the final design is the artist's call. This brief is not medical advice._`,
  ];
  return lines.join("\n");
}

export function lineArtPrompt(a: { subject: string; style?: string; line_weight?: "fine" | "medium" | "bold"; composition?: string; extra?: string[] }) {
  const weight = a.line_weight ?? "medium";
  const parts = [
    `${a.subject}`,
    a.style ? `${a.style} tattoo style` : "tattoo flash style",
    "clean black line art",
    `${weight} uniform line weight`,
    a.composition ?? "centered composition",
    "no shading, no color, no text",
    "pure white background",
    "high contrast, stencil-ready, crisp closed outlines",
    ...(a.extra ?? []),
  ];
  const negative = "blurry, sketchy strokes, crosshatching, gradients, photorealism, watermark, signature, background texture";
  return { prompt: parts.join(", "), negative_prompt: negative, tip: "Paste into any AI tattoo generator (e.g. https://tatany.app) and review the result with your artist before booking." };
}

export const DETAILS: Detail[] = Object.keys(MIN_CM) as Detail[];
