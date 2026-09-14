import {
    _decorator,
    Node,
    view,
    UITransform,
    Size,
    ScrollView,
    Layout
} from 'cc';

import { UIAdaptivityBase } from '../../UIAdaptivityBase';
import { UILeaderboardItemAdaptivity } from '../../leaderboard/adaptivity/UILeaderboardItemAdaptivity';

const { ccclass, property } = _decorator;


@ccclass('UILeaderboardPlayersAdaptivity')
export class UILeaderboardPlayersAdaptivity extends UIAdaptivityBase {

    @property(Node)
    scroll: Node = null;

    @property(Node)
    header: Node = null;


    private items: UILeaderboardItemAdaptivity[] = [];

    private refreshScheduled: boolean = false;

    private geometryRefreshScheduled: boolean = false;

    private geometryRefreshAttempts: number = 0;


    onEnable() {

        view.on(
            'canvas-resize',
            this.onCanvasResize,
            this
        );
    }


    onDisable() {

        view.off(
            'canvas-resize',
            this.onCanvasResize,
            this
        );
    }

    private isGeometryReady(): boolean {

        if (
            !this.scroll ||
            !this.header
        ) {
            return false;
        }


        const parent =
            this.scroll.parent;


        if (!parent) {
            return false;
        }

        const scrollScaleY =
            Math.abs(
                this.scroll.worldScale.y
            );


        const parentScaleY =
            Math.abs(
                parent.worldScale.y
            );


        const headerScaleY =
            Math.abs(
                this.header.worldScale.y
            );


        return (
            scrollScaleY > 0.001 &&
            parentScaleY > 0.001 &&
            headerScaleY > 0.001
        );
    }


    private refreshWhenGeometryReady() {

        if (this.geometryRefreshScheduled) {
            return;
        }


        this.geometryRefreshScheduled =
            true;


        this.scheduleOnce(() => {

            this.geometryRefreshScheduled =
                false;


            if (!this.node.activeInHierarchy) {

                this.geometryRefreshAttempts =
                    0;

                return;
            }


            if (!this.isGeometryReady()) {

                this.geometryRefreshAttempts++;

                if (
                    this.geometryRefreshAttempts <
                    60
                ) {

                    this.refreshWhenGeometryReady();
                }
                else {

                    console.warn(
                        "[LEADERBOARD PLAYERS] " +
                        "Geometry was not ready after 60 frames"
                    );


                    this.geometryRefreshAttempts =
                        0;
                }


                return;
            }


            this.geometryRefreshAttempts =
                0;

            this.refresh();

        }, 0);
    }

    private onCanvasResize() {

        if (!this.node.activeInHierarchy) {
            return;
        }


        if (this.refreshScheduled) {
            return;
        }


        this.refreshScheduled = true;


        this.scheduleOnce(() => {

            this.refreshScheduled = false;


            if (!this.node.activeInHierarchy) {
                return;
            }


            this.refresh();

        }, 0);
    }


    public refresh() {

        if (!this.scroll) {
            return;
        }

        const visibleSize =
            view.getVisibleSize();

        const w =
            visibleSize.width;

        const h =
            visibleSize.height;

        const ratio =
            w / h;


        if (ratio < 0.7) {

            this.makeMobileVariation(
                w,
                h
            );

        } else if (ratio < 1.5) {

            this.makeTabletVariation(
                w,
                h
            );

        } else {

            this.makeDesktopVariation(
                w,
                h
            );
        }

        this.alignScrollTopToHeader();

        for (
            let i = 0;
            i < this.items.length;
            i++
        ) {

            this.items[i].refresh();
        }


        const scrollView =
            this.scroll.getComponent(ScrollView);

        if (!scrollView) {
            return;
        }


        const content =
            scrollView.content;

        if (!content) {
            return;
        }


        const layout =
            content.getComponent(Layout);

        if (layout) {
            layout.updateLayout();
        }

        this.alignContentToTop(
            scrollView,
            content
        );

        this.scheduleOnce(() => {

            if (!this.node.activeInHierarchy) {
                return;
            }


            if (layout) {
                layout.updateLayout();
            }


            this.alignContentToTop(
                scrollView,
                content
            );

        }, 0);
    }


    private alignScrollTopToHeader() {

        if (
            !this.scroll ||
            !this.header
        ) {
            return;
        }


        const scrollTransform =
            this.scroll.getComponent(UITransform);

        const headerTransform =
            this.header.getComponent(UITransform);

        const parent =
            this.scroll.parent;


        if (
            !scrollTransform ||
            !headerTransform ||
            !parent
        ) {
            return;
        }

        const headerBottomWorld =
            this.header.worldPosition.y -
            headerTransform.height *
            this.header.worldScale.y *
            headerTransform.anchorY;

        const worldGap =
            45;


        const desiredScrollTopWorld =
            headerBottomWorld -
            worldGap;


        const scrollWorldHeight =
            scrollTransform.height *
            this.scroll.worldScale.y;


        const desiredScrollWorldY =
            desiredScrollTopWorld -
            scrollWorldHeight *
            (1 - scrollTransform.anchorY);


        const parentWorldY =
            parent.worldPosition.y;

        const parentWorldScaleY =
            parent.worldScale.y;


        if (parentWorldScaleY === 0) {
            return;
        }

        const desiredLocalY =
            (
                desiredScrollWorldY -
                parentWorldY
            ) /
            parentWorldScaleY;


        const pos =
            this.scroll.position;


        this.scroll.setPosition(
            pos.x,
            desiredLocalY,
            pos.z
        );
    }

    private alignContentToTop(
        scrollView: ScrollView,
        content: Node
    ) {

        const layout =
            content.getComponent(Layout);


        if (layout) {
            layout.updateLayout();
        }


        const contentTransform =
            content.getComponent(UITransform);


        const viewNode =
            content.parent;


        if (!viewNode) {
            return;
        }


        const viewTransform =
            viewNode.getComponent(UITransform);


        if (
            !contentTransform ||
            !viewTransform
        ) {
            return;
        }


        scrollView.stopAutoScroll();

        const viewTop =
            viewTransform.height *
            (1 - viewTransform.anchorY);

        const contentTopOffset =
            contentTransform.height *
            (1 - contentTransform.anchorY);


        const targetY =
            viewTop -
            contentTopOffset;


        const position =
            content.position;


        content.setPosition(
            position.x,
            targetY,
            position.z
        );
    }


    public addItem(
        item: UILeaderboardItemAdaptivity
    ) {

        if (
            this.items.indexOf(item) !== -1
        ) {
            return;
        }


        this.items.push(
            item
        );
    }


    private setScrollSize(
        width: number,
        height: number
    ) {

        const transform =
            this.scroll.getComponent(UITransform);


        if (!transform) {
            return;
        }


        transform.setContentSize(
            new Size(
                width,
                height
            )
        );
    }


    private makeMobileVariation(
        w: number,
        h: number
    ) {

        const x =
            0.9492 * w;


        const scroll_W =
            x;

        const scroll_H =
            h * 0.84;


        this.setScrollSize(
            scroll_W,
            scroll_H
        );
    }


    private makeTabletVariation(
        w: number,
        h: number
    ) {

        const x =
            0.140 * w;


        const scroll_W =
            4.15 * x;

        const scroll_H =
            h * 0.66;


        this.setScrollSize(
            scroll_W,
            scroll_H
        );
    }


    private makeDesktopVariation(
        w: number,
        h: number
    ) {

        const x =
            0.0846 * h;


        const scroll_W =
            11.0588 * x;

        const scroll_H =
            h * 0.64;


        this.setScrollSize(
            scroll_W,
            scroll_H
        );
    }
}