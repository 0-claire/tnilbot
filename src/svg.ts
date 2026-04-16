import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
async function saveSvgToFile(svgString, filename) {
    const filePath = path.resolve('tmp', filename);
    await fs.mkdir('tmp', { recursive: true });
    await fs.writeFile(filePath, svgString, 'utf-8');
    return filePath;
}
const execAsync = promisify(exec);
async function convertSvgToPng(svgPath, pngPath) {
    await execAsync(`convert -density 300 "${svgPath}" "${pngPath}"`);
    return pngPath;
}
async function convert(svgString) {
    const svgPath = await saveSvgToFile(svgString, 'ithkuil.svg');
    const pngPath = path.resolve('tmp', 'ithkuil.png');
    await convertSvgToPng(svgPath, pngPath);
    const buffer = await fs.readFile(pngPath);
    return buffer;
}
export default convert;
