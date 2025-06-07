import { JSDOM } from "jsdom";
import {
  Anchor,
  CharacterRow,
  fitViewBox,
  textToScript,
} from "@zsnout/ithkuil/script/index.js";

export function createSVG(text) {
  const { window } = new JSDOM(`<!DOCTYPE html><body></body>`, {
    contentType: "image/svg+xml",
  });
  const document = window.document;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const result = textToScript(text);

  if (result.ok) {
    const row = CharacterRow({
      children: result.value,
      compact: true,
      document,
    } as any) as any;

    const anchored = Anchor({
      at: "cc",
      children: row,
      document,
    }as any) as any;

    svg.appendChild(anchored);
  } else {
    const textElem = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textElem.textContent = (result as { reason: string }).reason;
    svg.appendChild(textElem);
  }

  fitViewBox(svg);
  return svg.outerHTML;
}

export default createSVG
