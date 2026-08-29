import { _decorator, Component, find, Widget } from 'cc';

const { ccclass } = _decorator;

@ccclass('UIEventOverlay')
export class UIEventOverlay extends Component {
	private widget: Widget = null;

	onEnable() {
		this.widget = this.getComponent(Widget);

		if (!this.widget) {
			console.error('UIEventOverlay: Widget not found');
			return;
		}

		this.updateOverlay();

		this.scheduleOnce(() => {
			this.updateOverlay();
		}, 0.35);
	}

	private updateOverlay() {
		const canvasNode = find('Canvas');

		if (!canvasNode) {
			console.error('UIEventOverlay: Canvas not found');
			return;
		}

		this.widget.target = canvasNode;
		this.widget.updateAlignment();
	}
}
