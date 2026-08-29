import { _decorator, Component, find, Widget } from 'cc';

const { ccclass } = _decorator;

@ccclass('UIEventOverlay')
export class UIEventOverlay extends Component {
	onEnable() {
		const canvasNode = find('Canvas');

		if (!canvasNode) {
			console.error('UIEventOverlay: Canvas not found');
			return;
		}

		const widget = this.getComponent(Widget);

		if (!widget) {
			console.error('UIEventOverlay: Widget not found');
			return;
		}

		widget.target = canvasNode;
		widget.updateAlignment();
	}
}
