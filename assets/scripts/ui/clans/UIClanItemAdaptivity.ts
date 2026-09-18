import { _decorator, Component, Layout, UITransform, Vec3, Size, view } from 'cc';

const { ccclass } = _decorator;

@ccclass('UIClanItemAdaptivity')
export class UIClanItemAdaptivity extends Component {

    private readonly baseWidth: number = 1660;
    private readonly baseHeight: number = 250;

    private refreshScheduled: boolean = false;


    onEnable() {
        view.on('canvas-resize', this.onCanvasResize, this);

        this.scheduleOnce(() => {
            if(this.node.activeInHierarchy) {
                this.refresh();
            }
        }, 0);
    }


    onDisable() {
        view.off('canvas-resize', this.onCanvasResize, this);
    }


    private onCanvasResize() {
        if(this.refreshScheduled || !this.node.activeInHierarchy) {
            return;
        }

        this.refreshScheduled = true;

        this.scheduleOnce(() => {
            this.refreshScheduled = false;

            if(this.node.activeInHierarchy) {
                this.refresh();
            }
        }, 0);
    }


    public refresh() {
        const availableWidth = this.getAvailableWidth();

        if(availableWidth <= 0) {
            return;
        }

        const visibleSize = view.getVisibleSize();
        const w = visibleSize.width;
        const h = visibleSize.height;
        const ratio = w / h;

        let widthRatio = 0.88;

        if (ratio < 0.7) {
            // mobile portrait
            widthRatio = 0.94;
        } else if (ratio < 1.05) {
            // tablet / near-square
            widthRatio = 0.88;
        } else if (w <= 1100) {
            // small laptop, 1024 and similar
            widthRatio = 0.74;
        } else if (w <= 1500) {
            // normal laptop / desktop
            widthRatio = 0.62;
        } else {
            // large desktop
            widthRatio = 0.60;
        }

        const targetWidth = availableWidth * widthRatio;
        const scale = targetWidth / this.baseWidth;

        const transform = this.node.getComponent(UITransform);

        if(!transform) {
            return;
        }

        transform.setContentSize(new Size(this.baseWidth, this.baseHeight));
        this.node.setScale(new Vec3(scale, scale, 1));

        const layout = this.node.parent ? this.node.parent.getComponent(Layout) : null;

        if(layout) {
            layout.affectedByScale = true;
            layout.updateLayout();
        }
    }


    private getAvailableWidth(): number {
        const content = this.node.parent;
        const viewNode = content ? content.parent : null;

        if(!viewNode) {
            return 0;
        }

        const transform = viewNode.getComponent(UITransform);

        if(!transform) {
            return 0;
        }

        return transform.width;
    }
}