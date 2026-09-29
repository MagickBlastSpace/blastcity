import { _decorator, Node, Widget, view, Vec3, UITransform } from 'cc';
import { UIAdaptivityBase } from '../../UIAdaptivityBase';

const { ccclass, property } = _decorator;

@ccclass('UILeaderboardAdaptivity')
export class UILeaderboardAdaptivity extends UIAdaptivityBase {

    @property(Node)
    header: Node = null;

    @property(Node)
    tabsFrame: Node = null;

    @property(Widget)
    tabsFrame_Widget: Widget = null;

    @property(Node)
    friendsTabsFrame: Node = null;

    @property(Widget)
    friendsTabsFrame_Widget: Widget = null;

    @property(Widget)
    friendsList_Widget: Widget = null;

    @property(Widget)
    friendRequests_Widget: Widget = null;

    private basic_header_Size_Y: number = 210;

    private basic_tabsFrame_Size_X: number = 2260;
    private basic_tabsFrame_Size_Y: number = 180;

    private mobileScaleMul: number = 0.5;
    private tabletScaleMul: number = 0.71;


    refresh() {
        const visibleSize = view.getVisibleSize();

        const w = visibleSize.width;
        const h = visibleSize.height;
        const ratio = w / h;

        if (ratio < 0.7) {
            this.makeMobileVariation(w, h);
        }
        else if (ratio < 1.5) {
            this.makeTabletVariation(w, h);
        }
        else {
            this.makeDesktopVariation(w, h);
        }
    }


    private makeMobileVariation(w: number, h: number) {
        const x = 0.262 * w * this.mobileScaleMul;

        const header_H = 1.468 * x;
        const headerScale = header_H / this.basic_header_Size_Y;
        this.header.setScale(
            new Vec3(headerScale, headerScale, 1)
        );


        const tabsFrame_W = 3.564 * x;
        const tabsFrame_H = 0.4808 * x;

        const tabsFrameScaleX =
            tabsFrame_W / this.basic_tabsFrame_Size_X;

        const tabsFrameScaleY =
            tabsFrame_H / this.basic_tabsFrame_Size_Y;

        this.tabsFrame.setScale(
            new Vec3(
                tabsFrameScaleX,
                tabsFrameScaleY,
                1
            )
        );

        const tabsFrameTop = 0.9872 * x;

        this.tabsFrame_Widget.top = tabsFrameTop;


        this.updateFriendsTabsFrame(
            tabsFrameScaleX,
            tabsFrameScaleY,
            tabsFrameTop,
            tabsFrame_H,
            0.08 * x
        );
    }


    private makeTabletVariation(w: number, h: number) {
        const x = 0.140 * w * this.tabletScaleMul;

        const header_H = 1.127 * x;
        const headerScale = header_H / this.basic_header_Size_Y;

        this.header.setScale(
            new Vec3(headerScale, headerScale, 1)
        );

        const tabsFrame_W = 5.0133 * x;
        const tabsFrame_H = 0.5 * x;

        const tabsFrameScaleX =
            tabsFrame_W / this.basic_tabsFrame_Size_X;

        const tabsFrameScaleY =
            tabsFrame_H / this.basic_tabsFrame_Size_Y;

        this.tabsFrame.setScale(
            new Vec3(
                tabsFrameScaleX,
                tabsFrameScaleY,
                1
            )
        );

        const tabsFrameTop = 0.83 * x;

        this.tabsFrame_Widget.top = tabsFrameTop;


        this.updateFriendsTabsFrame(
            tabsFrameScaleX,
            tabsFrameScaleY,
            tabsFrameTop,
            tabsFrame_H,
            0.08 * x
        );
    }


    private makeDesktopVariation(w: number, h: number) {
        const x = 0.125 * h;

        const header_H = 2 * x;
        const headerScale = header_H / this.basic_header_Size_Y;

        this.header.setScale(
            new Vec3(headerScale, headerScale, 1)
        );


        const tabsFrame_W = 7.52 * x;
        const tabsFrame_H = 0.75 * x;

        const tabsFrameScaleX =
            tabsFrame_W / this.basic_tabsFrame_Size_X;

        const tabsFrameScaleY =
            tabsFrame_H / this.basic_tabsFrame_Size_Y;

        this.tabsFrame.setScale(
            new Vec3(
                tabsFrameScaleX,
                tabsFrameScaleY,
                1
            )
        );

        const tabsFrameTop = 1.65 * x;

        this.tabsFrame_Widget.top = tabsFrameTop;


        this.updateFriendsTabsFrame(
            tabsFrameScaleX,
            tabsFrameScaleY,
            tabsFrameTop,
            tabsFrame_H,
            0.08 * x
        );
    }


   private updateFriendsTabsFrame(
        scaleX: number,
        scaleY: number,
        mainTabsTop: number,
        mainTabsHeight: number,
        gap: number
    ) {
        if (
            !this.friendsTabsFrame ||
            !this.friendsTabsFrame_Widget
        ) {
            return;
        }

        this.friendsTabsFrame.setScale(
            new Vec3(scaleX, scaleY, 1)
        );

        const commonTarget =
            this.tabsFrame_Widget.target ??
            this.tabsFrame.parent;

        if (!commonTarget) {
            return;
        }

        this.friendsTabsFrame_Widget.target = commonTarget;
        this.friendsTabsFrame_Widget.isAlignTop = true;

        const friendsTabsTop =
            mainTabsTop +
            mainTabsHeight +
            gap;

        this.friendsTabsFrame_Widget.top =
            friendsTabsTop;

        this.friendsTabsFrame_Widget.updateAlignment();

        const contentTop =
            friendsTabsTop +
            mainTabsHeight +
            gap;


        if (this.friendsList_Widget) {
            this.friendsList_Widget.target =
                commonTarget;

            this.friendsList_Widget.isAlignTop =
                true;

            this.friendsList_Widget.top =
                contentTop;

            this.friendsList_Widget.updateAlignment();
        }


        if (this.friendRequests_Widget) {

            const requestsWidget =
                this.friendRequests_Widget;

            const requestsNode =
                requestsWidget.node;

            const requestsTransform =
                requestsNode.getComponent(UITransform);

            requestsWidget.target = commonTarget;

            requestsWidget.isAlignVerticalCenter = false;
            requestsWidget.isAlignBottom = false;
            requestsWidget.isAlignTop = true;

            requestsWidget.isAbsoluteTop = true;
            requestsWidget.top = contentTop;

            requestsWidget.isAlignLeft = false;
            requestsWidget.isAlignRight = false;
            requestsWidget.isAlignHorizontalCenter = true;

            requestsWidget.isAbsoluteHorizontalCenter = true;
            requestsWidget.horizontalCenter = 0;


            const friendsListTransform =
                this.friendsList_Widget?.node.getComponent(UITransform);

            if (
                requestsTransform &&
                friendsListTransform
            ) {
                requestsTransform.setContentSize(
                    friendsListTransform.contentSize.width,
                    friendsListTransform.contentSize.height
                );
            }


            requestsWidget.updateAlignment();

            console.log(
                '[LEADERBOARD ADAPTIVITY] Requests fixed:',
                {
                    size: requestsTransform
                        ? {
                            width:
                                requestsTransform.contentSize.width,
                            height:
                                requestsTransform.contentSize.height
                        }
                        : null,

                    top:
                        requestsWidget.top,

                    stretchWidth:
                        requestsWidget.isStretchWidth,

                    stretchHeight:
                        requestsWidget.isStretchHeight,

                    target:
                        requestsWidget.target?.name
                }
            );
        }
    }
}