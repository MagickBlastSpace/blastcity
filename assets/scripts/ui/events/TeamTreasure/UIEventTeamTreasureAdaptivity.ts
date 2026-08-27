import { _decorator, Vec3, view } from 'cc';
import { UIAdaptivityBase } from '../../UIAdaptivityBase';

const { ccclass } = _decorator;

@ccclass('UIEventTeamTreasureAdaptivity')
export class UIEventTeamTreasureAdaptivity extends UIAdaptivityBase {
	refresh() {
		const visibleSize = view.getVisibleSize();

		const isLandscape = visibleSize.width > visibleSize.height;

		const scale = isLandscape ? 0.5 : 1.25;

		const aspectY = 1.2;

		const widthFactor = 1.07;

		this.node.setScale(new Vec3(scale * widthFactor, scale * aspectY, 1));
	}
}
