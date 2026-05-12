import fs from 'fs/promises';
import path from 'node:path';
import { exec, } from 'child_process';
import { promisify, } from 'util';

async function saveSvgToFile(svgString: string, filename: string): Promise<string> {
	const filePath = path.resolve('tmp', filename);
	await fs.mkdir('tmp', { recursive: true, });
	await fs.writeFile(filePath, svgString, 'utf-8');
	return filePath;
}
const execAsync = promisify(exec);
async function convertSvgToPng(svgPath: string, pngPath: string): Promise<string> {
	await execAsync(`convert -density 300 "${svgPath}" "${pngPath}"`);
	return pngPath;
}

async function convert(svgString: string): Promise<ReturnType<typeof fs.readFile>> {
	const svgPath = await saveSvgToFile(svgString, 'ithkuil.svg');
	const pngPath = path.resolve('tmp', 'ithkuil.png');
	await convertSvgToPng(svgPath, pngPath);
	const buffer = await fs.readFile(pngPath);
	return buffer;
}
export default convert;
