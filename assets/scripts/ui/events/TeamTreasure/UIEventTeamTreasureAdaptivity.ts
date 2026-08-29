import { _decorator, Vec3, view, UITransform } from 'cc';
import { UIAdaptivityBase } from '../../UIAdaptivityBase';

const { ccclass } = _decorator;

@ccclass('UIEventTeamTreasureAdaptivity')
export class UIEventTeamTreasureAdaptivity extends UIAdaptivityBase {
	refresh() {
		const visibleSize = view.getVisibleSize();

		const cardRoot = this.node.getChildByName('CardScaleRoot');

		if (!cardRoot) {
			console.error('UIEventTeamTreasureAdaptivity: CardScaleRoot not found');
			return;
		}

		const frame = cardRoot.getChildByName('Frame');

		if (!frame) {
			console.error('UIEventTeamTreasureAdaptivity: Frame not found');
			return;
		}

		const transform = frame.getComponent(UITransform);

		if (!transform) {
			console.error(
				'UIEventTeamTreasureAdaptivity: Frame UITransform not found',
			);
			return;
		}

		const width = visibleSize.width;
		const height = visibleSize.height;

		const cardWidth = transform.contentSize.width;
		const cardHeight = transform.contentSize.height;

		const aspectRatio = width / height;

		const isPortrait = height > width;

		const isPhone = isPortrait && aspectRatio < 0.65;

		const isTabletPortrait = isPortrait && aspectRatio >= 0.65;

		// Телефон
		if (isPhone) {
			const targetWidth = width * 0.94;
			const targetHeight = height * 0.72;

			const scaleX = targetWidth / cardWidth;

			const scaleY = targetHeight / cardHeight;

			cardRoot.setScale(new Vec3(scaleX, scaleY, 1));

			return;
		}

		// Планшет / почти квадратный экран
		if (isTabletPortrait) {
			const maxHeightFactor = 0.78;
			const maxWidthFactor = 0.72;

			const scaleByHeight = (height * maxHeightFactor) / cardHeight;

			const scaleByWidth = (width * maxWidthFactor) / cardWidth;

			const scale = Math.min(scaleByHeight, scaleByWidth);

			cardRoot.setScale(new Vec3(scale, scale, 1));

			return;
		}

		// Landscape / desktop
		const maxHeightFactor = 0.8;
		const maxWidthFactor = 0.58;

		const scaleByHeight = (height * maxHeightFactor) / cardHeight;

		const scaleByWidth = (width * maxWidthFactor) / cardWidth;

		const scale = Math.min(scaleByHeight, scaleByWidth);

		cardRoot.setScale(new Vec3(scale, scale, 1));
	}
}
