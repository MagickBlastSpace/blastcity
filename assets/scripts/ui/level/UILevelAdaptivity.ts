import {
    _decorator,
    Layout,
    Node,
    Size,
    UITransform,
    Vec3,
    view,
    Widget
} from 'cc';

import { UIAdaptivityBase } from '../UIAdaptivityBase';

const { ccclass, property } = _decorator;

@ccclass('UILevelAdaptivity')
export class UILevelAdaptivity extends UIAdaptivityBase {

    @property(Node)
    upperPanel: Node = null;

    @property(Node)
    bottomPanel: Node = null;

    @property(Node)
    sidePanel_left: Node = null;

    @property(Node)
    sidePanel_right: Node = null;

    @property(Node)
    sideStick_left: Node = null;

    @property(Node)
    sideStick_right: Node = null;

    @property(Node)
    sideStick_top: Node = null;

    @property(Node)
    sideStick_bottom: Node = null;

    @property(Node)
    bottomBoosters: Node = null;

    @property(Layout)
    bottomBoostersLayout: Layout = null;

    @property(Widget)
    bottomBoostersWidget: Widget = null;

    @property(Node)
    sideBoosters: Node = null;

    @property(Layout)
    sideBoostersLayout: Layout = null;

    @property(Widget)
    sideBoostersWidget: Widget = null;

    @property(Node)
    goals: Node = null;

    @property(Node)
    goals_Landscape: Node = null;

    @property(Widget)
    goals_Widget: Widget = null;

    @property(Layout)
    goals_Layout: Layout = null;

    @property(Node)
    field: Node = null;


    private basicFieldSize: number = 1485;

    private basicBoosterSize_Bottom_w: number = 380;
    private basicBoosterSize_Bottom_h: number = 370;

    private basicX: number = 822.15;
    private basicX_Landscape: number = 251;

    private portraitStickThickness: number = 30;

    private portraitStickOverlap: number = 3;


    start() {
        this.scheduleOnce(() => this.refresh(), 0.1);
    }


    refresh() {
        const visibleSize = view.getVisibleSize();

        const w = visibleSize.width;
        const h = visibleSize.height;

        if (w > h) {
            this.refreshLandscape(w, h);
        }
        else {
            this.refreshPortrait(w, h);
        }
    }

    private refreshLandscape(w: number, h: number) {
        if (this.sideStick_left) {
            this.sideStick_left.active = true;
            this.sideStick_left.setRotationFromEuler(0, 0, 0);

            const widget = this.sideStick_left.getComponent(Widget);

            if (widget) {
                widget.enabled = true;
                widget.updateAlignment();
            }
        }

        if (this.sideStick_right) {
            this.sideStick_right.active = true;
            this.sideStick_right.setRotationFromEuler(0, 0, 0);

            const widget = this.sideStick_right.getComponent(Widget);

            if (widget) {
                widget.enabled = true;
                widget.updateAlignment();
            }
        }

        if (this.sideStick_top) {
            this.sideStick_top.active = false;
        }

        if (this.sideStick_bottom) {
            this.sideStick_bottom.active = false;
        }

        const x = 0.125 * h;

        const y = ((0.140 * w) - (0.93 * x)) / 2;

        const fieldSize = 6 * x;
        const fieldScale = fieldSize / this.basicFieldSize;

        this.field.setScale(new Vec3(fieldScale, fieldScale, 1));

        const sidePanelSize = 0.140 * w;

        this.sidePanel_left
            .getComponent(UITransform)
            .setContentSize(new Size(sidePanelSize, h));

        this.sidePanel_left.setPosition(
            -w / 2 + sidePanelSize / 2,
            0,
            this.sidePanel_left.position.z
        );

        this.sidePanel_right
            .getComponent(UITransform)
            .setContentSize(new Size(sidePanelSize, h));

        this.sidePanel_right.setPosition(
            w / 2 - sidePanelSize / 2,
            0,
            this.sidePanel_right.position.z
        );

        const leftStickX = -w / 2 + sidePanelSize;
        const rightStickX = w / 2 - sidePanelSize;

        if (this.sideStick_left) {
            this.sideStick_left.setPosition(
                leftStickX,
                0,
                this.sideStick_left.position.z
            );
        }

        if (this.sideStick_right) {
            this.sideStick_right.setPosition(
                rightStickX,
                0,
                this.sideStick_right.position.z
            );
        }

        const booSize = 0.93 * x;

        const booScaleX = booSize / this.basicBoosterSize_Bottom_w;
        const booScaleY = booSize / this.basicBoosterSize_Bottom_h;

        this.sideBoosters.setScale(
            new Vec3(booScaleX, booScaleY, 1)
        );

        const booLayoutSpacing = 0.2 * x;

        this.sideBoostersLayout.spacingY = booLayoutSpacing;
        this.sideBoostersLayout.updateLayout();

        this.sideBoostersWidget.right = y;

        const goalsScale = x / this.basicX_Landscape;

        this.goals_Landscape.setScale(
            new Vec3(goalsScale, goalsScale, 1)
        );

        const goalsLayoutSpacing = 0.4 * x;

        this.goals_Layout.spacingY = goalsLayoutSpacing;
        this.goals_Layout.updateLayout();
    }

    private refreshPortrait(w: number, h: number) {
        if (this.sideStick_left) {
            this.sideStick_left.active = false;
        }

        if (this.sideStick_right) {
            this.sideStick_right.active = false;
        }

        if (this.sideStick_top) {
            this.sideStick_top.active = true;
        }

        if (this.sideStick_bottom) {
            this.sideStick_bottom.active = true;
        }

        const x = 0.225 * w;

        const bottomPanelSize = 0.179 * h;
        const y = (bottomPanelSize - x) / 3;

        const upperPanelSize = 0.266 * h;
        const z = (upperPanelSize - 1.504 * x) / 4.375;

        const fieldSize = 4 * x;
        const fieldScale = fieldSize / this.basicFieldSize;

        const upperTransform = this.upperPanel.getComponent(UITransform);
        const bottomTransform = this.bottomPanel.getComponent(UITransform);

        upperTransform.setContentSize(
            new Size(w, upperPanelSize)
        );

        bottomTransform.setContentSize(
            new Size(w, bottomPanelSize)
        );

        this.upperPanel.getComponent(Widget)?.updateAlignment();
        this.bottomPanel.getComponent(Widget)?.updateAlignment();

        this.field.setScale(
            new Vec3(fieldScale, fieldScale, 1)
        );

        const booSize = 0.932 * x;

        const booScaleX = booSize / this.basicBoosterSize_Bottom_w;
        const booScaleY = x / this.basicBoosterSize_Bottom_h;

        this.bottomBoosters.setScale(
            new Vec3(booScaleX, booScaleY, 1)
        );

        this.bottomBoostersWidget.top = y;

        const booLayoutSpacing = 0.075 * x;

        this.bottomBoostersLayout.spacingX = booLayoutSpacing;
        this.bottomBoostersLayout.updateLayout();

        const goalsScale = x / this.basicX;

        this.goals.setScale(
            new Vec3(goalsScale, goalsScale, 1)
        );

        this.goals_Widget.bottom = z;

        this.refreshPortraitSticks(
            upperTransform,
            bottomTransform
        );
    }

    private refreshPortraitSticks(
        upperTransform: UITransform,
        bottomTransform: UITransform
    ) {

        const upperEdgeWorld = upperTransform.convertToWorldSpaceAR(
            new Vec3(
                0,
                -upperTransform.height * upperTransform.anchorY,
                0
            )
        );

        const bottomEdgeWorld = bottomTransform.convertToWorldSpaceAR(
            new Vec3(
                0,
                bottomTransform.height * (1 - bottomTransform.anchorY),
                0
            )
        );

        this.positionPortraitStick(
            this.sideStick_top,
            upperTransform,
            upperEdgeWorld,
            270,
            this.portraitStickOverlap
        );

        this.positionPortraitStick(
            this.sideStick_bottom,
            bottomTransform,
            bottomEdgeWorld,
            90,
            -this.portraitStickOverlap
        );
    }


    private positionPortraitStick(
        stick: Node,
        panelTransform: UITransform,
        edgeWorld: Vec3,
        rotation: number,
        overlap: number
    ) {

        if (!stick || !stick.parent) {
            return;
        }

        const stickTransform = stick.getComponent(UITransform);
        const parentTransform = stick.parent.getComponent(UITransform);

        if (!stickTransform || !parentTransform) {
            return;
        }

        const leftWorld = panelTransform.convertToWorldSpaceAR(
            new Vec3(
                -panelTransform.width * panelTransform.anchorX,
                0,
                0
            )
        );

        const rightWorld = panelTransform.convertToWorldSpaceAR(
            new Vec3(
                panelTransform.width * (1 - panelTransform.anchorX),
                0,
                0
            )
        );

        const leftLocal = parentTransform.convertToNodeSpaceAR(leftWorld);
        const rightLocal = parentTransform.convertToNodeSpaceAR(rightWorld);
        const edgeLocal = parentTransform.convertToNodeSpaceAR(edgeWorld);

        const stickLength = Math.abs(rightLocal.x - leftLocal.x);

        const stickCenterX = (leftLocal.x + rightLocal.x) / 2;

        stickTransform.setContentSize(
            new Size(
                this.portraitStickThickness,
                stickLength
            )
        );

        stick.setRotationFromEuler(0, 0, rotation);

        stick.setPosition(
            stickCenterX,
            edgeLocal.y + overlap,
            stick.position.z
        );
    }
}
