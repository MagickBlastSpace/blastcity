import { _decorator, Component, ProgressBar, director } from 'cc';

import { GamePushLoader } from '../../utils/GamePushLoader';

const { ccclass, property } = _decorator;

@ccclass('UILoadingFrame')
export class UILoadingFrame extends Component {
	@property(ProgressBar)
	loadingBar: ProgressBar = null;

	async start() {
		try {
			console.log('[UILoadingFrame] Initializing GamePush...');

			const gamepush = await GamePushLoader.load();

			console.log('[UILoadingFrame] GamePush loaded');

			await this.waitForPlayerReady(gamepush);

			console.log('[UILoadingFrame] GamePush player ready');

			gamepush.ads.showPreloader();

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
			director.loadScene('scene');
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
}
