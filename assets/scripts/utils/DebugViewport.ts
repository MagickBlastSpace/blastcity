import {
	_decorator,
	Component,
	Label,
	Node,
	UITransform,
	Vec3,
	view,
} from 'cc';
import { UserData } from '../data/UserData';

const { ccclass } = _decorator;

@ccclass('DebugViewport')
export class DebugViewport extends Component {
	private debugNode: Node | null = null;
	private debugLabel: Label | null = null;

	private readonly updateInterval = 0.5;

	onLoad() {
		this.createDebugLabel();

		window.addEventListener('resize', this.onViewportChanged);
		window.addEventListener('orientationchange', this.onViewportChanged);

		window.visualViewport?.addEventListener('resize', this.onViewportChanged);

		window.visualViewport?.addEventListener('scroll', this.onViewportChanged);

		this.schedule(this.refresh, this.updateInterval);
	}

	start() {
		this.refresh();
	}

	onDestroy() {
		window.removeEventListener('resize', this.onViewportChanged);
		window.removeEventListener('orientationchange', this.onViewportChanged);

		window.visualViewport?.removeEventListener(
			'resize',
			this.onViewportChanged,
		);

		window.visualViewport?.removeEventListener(
			'scroll',
			this.onViewportChanged,
		);

		this.unschedule(this.refresh);
	}

	private createDebugLabel() {
		const node = new Node('DebugViewportInfo');

		node.setParent(this.node);

		const transform = node.addComponent(UITransform);
		transform.setContentSize(900, 360);

		const label = node.addComponent(Label);

		label.fontSize = 30;
		label.lineHeight = 38;
		label.horizontalAlign = Label.HorizontalAlign.LEFT;
		label.verticalAlign = Label.VerticalAlign.TOP;

		node.setPosition(new Vec3(-450, 300, 0));

		this.debugNode = node;
		this.debugLabel = label;
	}

	private onViewportChanged = () => {
		this.refresh();
	};

	private refresh = () => {
		if (!this.debugNode || !this.debugLabel) {
			return;
		}

		const isDevMode = UserData.instance?.isDevMode?.() ?? false;

		this.debugNode.active = isDevMode;

		if (!isDevMode) {
			return;
		}

		const visible = view.getVisibleSize();
		const visualViewport = window.visualViewport;

		this.debugLabel.string =
			`VIEWPORT DEBUG\n` +
			`inner: ${window.innerWidth} x ${window.innerHeight}\n` +
			`visual: ${visualViewport?.width ?? '-'} x ${visualViewport?.height ?? '-'}\n` +
			`visual offset: ${visualViewport?.offsetLeft ?? '-'}, ${visualViewport?.offsetTop ?? '-'}\n` +
			`screen: ${window.screen.width} x ${window.screen.height}\n` +
			`visible: ${visible.width.toFixed(1)} x ${visible.height.toFixed(1)}\n` +
			`dpr: ${window.devicePixelRatio}\n` +
			`orientation: ${window.innerWidth > window.innerHeight ? 'LANDSCAPE' : 'PORTRAIT'}`;
	};
}
