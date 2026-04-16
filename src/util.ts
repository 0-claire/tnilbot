export type Font = 'basic'|'flow'

export async function sleep(timeout: number): Promise<void> {
	await new Promise((res) => {
		setTimeout(res, timeout);
	});
	return
}
