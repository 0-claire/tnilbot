/* @jsx react-jsx */
/* @jsxRuntime automatic */
/* @jsxImportSource @zsnout/ithkuil/script */

import {
  Anchor,
  CharacterRow,
  fitViewBox,
  textToScript,
} from "@zsnout/ithkuil/script/index.js";

// export function createSVG(text) {
  // // const { window } = new JSDOM(`<!DOCTYPE html><body></body>`, {
    // // contentType: "image/svg+xml",
  // // });
  // // global.document = window.document;

  // const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  // const result = textToScript(text);

  // if (result.ok) {
    // const row = CharacterRow({
      // children: result.value,
      // compact: true,
    // });

    // const anchored = Anchor({
      // at: "cc",
      // children: row,
    // });

    // svg.appendChild(anchored);
  // } else {
    // const textElem = document.createElementNS("http://www.w3.org/2000/svg", "text");
    // textElem.textContent = (result as { reason: string }).reason;
    // svg.appendChild(textElem);
  // }

  // fitViewBox(svg);
  // return svg.outerHTML;
// }

function createSVG(text: string) {
  const svg = (
    <svg>
      <HandleResult
        ok={(value) => (
          <Anchor at="cc">
            <CharacterRow compact>{value}</CharacterRow>
          </Anchor>
        )}
        error={(reason) => <text>{reason}</text>}
      >
        {textToScript(text)}
      </HandleResult>
    </svg>
  ) as SVGSVGElement

  document.body.append(svg)

  fitViewBox(svg)
  return svg.outerHTML;
}


export default createSVG
