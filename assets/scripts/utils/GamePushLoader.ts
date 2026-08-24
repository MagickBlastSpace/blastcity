export class GamePushLoader {
	private static readonly SDK_URL =
		'https://gamepush.com/sdk/gamepush.js?projectId=13362&publicToken=AHn2fjy97FoJNFnTzqTGCKJnvyuqosyM&callback=onGPInit';

	private static loadingPromise: Promise<any> | null = null;

	public static load(): Promise<any> {
		const existingGamePush = (globalThis as any).gamepush;

		// Web Mobile build:
		// SDK уже был подключён через index.ejs.
		if (existingGamePush) {
			console.log('[GamePushLoader] GamePush already exists');

			return Promise.resolve(existingGamePush);
		}

		// Не запускаем несколько загрузок одновременно.
		if (this.loadingPromise) {
			return this.loadingPromise;
		}

		console.log('[GamePushLoader] Loading GamePush SDK...');

		this.loadingPromise = new Promise((resolve, reject) => {
			(globalThis as any).onGPInit = (gp: any) => {
				console.log('[GamePushLoader] GamePush SDK initialized');

				(globalThis as any).gamepush = gp;

				resolve(gp);
			};

			const existingScript = document.querySelector(
				'script[src*="gamepush.com/sdk/gamepush.js"]',
			);

			if (existingScript) {
				console.log('[GamePushLoader] SDK script already exists');

				return;
			}

			const script = document.createElement('script');

			script.src = this.SDK_URL;
			script.async = true;

			script.onload = () => {
				console.log('[GamePushLoader] SDK script loaded');
			};

			script.onerror = (error) => {
				console.error('[GamePushLoader] Failed to load GamePush SDK', error);

				this.loadingPromise = null;

				reject(error);
			};

			document.head.appendChild(script);
		});

		return this.loadingPromise;
	}
}
