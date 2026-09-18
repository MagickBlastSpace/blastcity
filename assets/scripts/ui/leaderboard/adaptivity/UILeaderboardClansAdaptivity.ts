import { _decorator, Node, view, UITransform, Size, ScrollView, Layout, Widget } from 'cc';
import { UIAdaptivityBase } from '../../UIAdaptivityBase';
import { UILeaderboardItemAdaptivity } from './UILeaderboardItemAdaptivity';

const { ccclass, property } = _decorator;

@ccclass('UILeaderboardClansAdaptivity')
export class UILeaderboardClansAdaptivity extends UIAdaptivityBase {

    @property(Node)
    scroll: Node = null;

    @property(Node)
    header: Node = null;

    private items: UILeaderboardItemAdaptivity[] = [];
    private resizeVersion: number = 0;


    onEnable() {
        view.on('canvas-resize', this.onCanvasResize, this);
    }


    onDisable() {
        view.off('canvas-resize', this.onCanvasResize, this);
        this.resizeVersion++;
    }


    private onCanvasResize() {
        const version = ++this.resizeVersion;

        this.scheduleOnce(() => {
            if(version !== this.resizeVersion || !this.node.activeInHierarchy) {
                return;
            }

            this.refresh();

            this.scheduleOnce(() => {
                if(version !== this.resizeVersion || !this.node.activeInHierarchy) {
                    return;
                }

                this.refresh();
            }, 0);
        }, 0);
    }


    public refresh() {
        if(!this.scroll || !this.header || !this.node.activeInHierarchy) {
            return;
        }

        const visibleSize = view.getVisibleSize();
        const w = visibleSize.width;
        const h = visibleSize.height;
        const ratio = w / h;

        if(ratio < 0.7) {
            this.makeMobileVariation(w, h);
        } else if(ratio < 1.5) {
            this.makeTabletVariation(w, h);
        } else {
            this.makeDesktopVariation(w, h);
        }

        this.forceCurrentGeometry();
        this.alignScrollTopToHeader();

        for(let i = 0; i < this.items.length; i++) {
            const item = this.items[i];

            if(item && item.node.activeInHierarchy) {
                item.refresh();
            }
        }

        this.finishLayout();
    }


    public addItem(item: UILeaderboardItemAdaptivity) {
        if(!item || this.items.indexOf(item) !== -1) {
            return;
        }

        this.items.push(item);
    }


    private forceCurrentGeometry() {
        const frame = this.scroll ? this.scroll.parent : null;

        if(frame) {
            const frameWidget = frame.getComponent(Widget);

            if(frameWidget && frameWidget.enabled) {
                frameWidget.updateAlignment();
            }
        }

        const headerWidget = this.header ? this.header.getComponent(Widget) : null;

        if(headerWidget && headerWidget.enabled) {
            headerWidget.updateAlignment();
        }

        const scrollView = this.scroll ? this.scroll.getComponent(ScrollView) : null;

        if(!scrollView || !scrollView.content) {
            return;
        }

        const content = scrollView.content;
        const viewNode = content.parent;

        if(viewNode) {
            const viewWidget = viewNode.getComponent(Widget);

            if(viewWidget && viewWidget.enabled) {
                viewWidget.updateAlignment();
            }
        }

        const contentWidget = content.getComponent(Widget);

        if(contentWidget && contentWidget.enabled) {
            contentWidget.updateAlignment();
        }
    }


    private finishLayout() {
        if(!this.scroll) {
            return;
        }

        const scrollView = this.scroll.getComponent(ScrollView);

        if(!scrollView || !scrollView.content) {
            return;
        }

        const content = scrollView.content;
        const viewNode = content.parent;

        if(!viewNode) {
            return;
        }

        const contentTransform = content.getComponent(UITransform);
        const viewTransform = viewNode.getComponent(UITransform);
        const layout = content.getComponent(Layout);

        if(!contentTransform || !viewTransform) {
            return;
        }

        if(layout) {
            layout.updateLayout();
        }

        const isLongContent = contentTransform.height > viewTransform.height + 1;

        scrollView.stopAutoScroll();
        scrollView.vertical = isLongContent;

        this.alignContentToTop(scrollView, content);
    }


    private alignContentToTop(scrollView: ScrollView, content: Node) {
        const contentTransform = content.getComponent(UITransform);
        const viewNode = content.parent;

        if(!contentTransform || !viewNode) {
            return;
        }

        const viewTransform = viewNode.getComponent(UITransform);

        if(!viewTransform) {
            return;
        }

        scrollView.stopAutoScroll();

        const viewTop = viewTransform.height * (1 - viewTransform.anchorY);
        const contentTopOffset = contentTransform.height * (1 - contentTransform.anchorY);
        const position = content.position;

        content.setPosition(position.x, viewTop - contentTopOffset, position.z);
    }


    private alignScrollTopToHeader() {
        const scrollTransform = this.scroll.getComponent(UITransform);
        const headerTransform = this.header.getComponent(UITransform);
        const parent = this.scroll.parent;

        if(!scrollTransform || !headerTransform || !parent) {
            return;
        }

        const headerBottomWorld = this.header.worldPosition.y - headerTransform.height * Math.abs(this.header.worldScale.y) * headerTransform.anchorY;
        const worldGap = 45;
        const desiredScrollTopWorld = headerBottomWorld - worldGap;

        const scrollWorldHeight = scrollTransform.height * Math.abs(this.scroll.worldScale.y);
        const desiredScrollWorldY = desiredScrollTopWorld - scrollWorldHeight * (1 - scrollTransform.anchorY);

        const parentWorldY = parent.worldPosition.y;
        const parentWorldScaleY = parent.worldScale.y;

        if(Math.abs(parentWorldScaleY) < 0.001) {
            return;
        }

        const desiredLocalY = (desiredScrollWorldY - parentWorldY) / parentWorldScaleY;
        const position = this.scroll.position;

        this.scroll.setPosition(position.x, desiredLocalY, position.z);
    }


    private setScrollSize(width: number, height: number) {
        const transform = this.scroll.getComponent(UITransform);

        if(transform) {
            transform.setContentSize(new Size(width, height));
        }
    }


    private makeMobileVariation(w: number, h: number) {
        const scrollW = 0.9492 * w;
        const scrollH = h * 0.84;

        this.setScrollSize(scrollW, scrollH);
    }


    private makeTabletVariation(w: number, h: number) {
        const x = 0.140 * w;
        const scrollW = 4.15 * x;
        const scrollH = h * 0.66;

        this.setScrollSize(scrollW, scrollH);
    }


    private makeDesktopVariation(w: number, h: number) {
        const x = 0.0846 * h;
        const scrollW = 11.0588 * x;
        const scrollH = h * 0.64;

        this.setScrollSize(scrollW, scrollH);
    }
}