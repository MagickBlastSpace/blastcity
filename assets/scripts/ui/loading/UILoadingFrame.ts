import { _decorator, Component, ProgressBar, director } from 'cc';

import { GamePushLoader } from '../../utils/GamePushLoader';

const { ccclass, property } = _decorator;

@ccclass('UILoadingFrame')
export class UILoadingFrame extends Component {
	@property(ProgressBar)
	loadingBar: ProgressBar = null;

	async start() {
		this.logStartup('UILoadingFrame started');

		try {
			this.logStartup('GamePush load started');

			const gamepush = await GamePushLoader.load();

			this.logStartup('GamePush loaded');

			await this.waitForPlayerReady(gamepush);

			this.logStartup('GamePush player ready');

			gamepush.ads.showPreloader();

			this.logStartup('Main scene preload started');

			this.loadScene();
		} catch (error) {
			console.error('[UILoadingFrame] GamePush initialization failed:', error);
		}
	}

	private async waitForPlayerReady(gamepush: any): Promise<void> {
		while (!gamepush.player?.ready) {
			await new Promise((resolve) => setTimeout(resolve, 250));
		}
	}

	private loadScene() {
		director.preloadScene('scene', this.onProgressLoadScene, () => {
			this.logStartup('Main scene preload finished');

			director.loadScene('scene');

			this.logStartup('director.loadScene called');
		});
	}

	private onProgressLoadScene = (
		completedCount: number,
		totalCount: number,
		item: any,
	) => {
		if (this.loadingBar) {
			this.loadingBar.progress = completedCount / totalCount;
		}
	};

	private logStartup(message: string) {
		console.log(`[STARTUP +${performance.now().toFixed(0)}ms] ${message}`);
	}
}
