import {
    _decorator,
    Layout,
    Node,
    screen,
    Size,
    UITransform,
    Vec3,
    view,
    Widget
} from 'cc';

import { UIAdaptivityBase } from '../UIAdaptivityBase';
import { UILevel } from './UILevel';

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

    private portraitSettingsButton: Node | null = null;

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

        protected onEnable(): void {
        screen.on('window-resize', this.onScreenResized, this);
        screen.on('orientation-change', this.onScreenResized, this);
    }

    protected onDisable(): void {
        screen.off('window-resize', this.onScreenResized, this);
        screen.off('orientation-change', this.onScreenResized, this);
        this.unschedule(this.refresh);
    }

    private onScreenResized(): void {
        this.unschedule(this.refresh);
        this.scheduleOnce(this.refresh, 0);
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
        this.getComponent(UILevel)?.updateLandscapeGoalsLayout();
    }

    private refreshPortrait(w: number, h: number): void {
        if(this.sideStick_left) this.sideStick_left.active = false;
        if(this.sideStick_right) this.sideStick_right.active = false;

        if(this.sideStick_top) this.sideStick_top.active = true;
        if(this.sideStick_bottom) this.sideStick_bottom.active = true;

        const upperTransform = this.upperPanel.getComponent(UITransform);
        const bottomTransform = this.bottomPanel.getComponent(UITransform);

        if(!upperTransform || !bottomTransform) {
            console.warn('[PORTRAIT] Panel UITransform missing');
            return;
        }

        const upperPanelSize = 0.205 * h;
        const bottomPanelSize = 0.145 * h;

        upperTransform.setContentSize(new Size(w, upperPanelSize));
        bottomTransform.setContentSize(new Size(w, bottomPanelSize));

        this.upperPanel.getComponent(Widget)?.updateAlignment();
        this.bottomPanel.getComponent(Widget)?.updateAlignment();

        this.refreshPortraitHeader(upperTransform);
        this.refreshPortraitBoosters(bottomTransform);

        this.fitPortraitFieldBetweenPanels(
            upperTransform,
            bottomTransform
        );

        this.refreshPortraitSticks(
            upperTransform,
            bottomTransform
        );
    }

    private refreshPortraitHeader(panel: UITransform): void {
        const header = this.goals;

        if(!header) {
            console.warn('[PORTRAIT HEADER] Layout node missing');
            return;
        }

        const goalsNode = header.getChildByName('Goals');
        const heroNode = header.getChildByName('Zeus');
        const movesNode = header.getChildByName('MovesCount');

        if(!goalsNode || !heroNode || !movesNode) {
            console.warn('[PORTRAIT HEADER] Missing nodes', {
                goals: !!goalsNode,
                hero: !!heroNode,
                moves: !!movesNode
            });
            return;
        }

        const layout = header.getComponent(Layout);
        if(layout) layout.enabled = false;

        if(this.goals_Widget) {
            this.goals_Widget.enabled = false;
        }

        const headerWidget = header.getComponent(Widget);
        if(headerWidget) headerWidget.enabled = false;

        const headerTransform = header.getComponent(UITransform);

        if(headerTransform) {
            headerTransform.setContentSize(
                panel.width,
                panel.height
            );
        }

        header.setScale(1, 1, 1);
        header.setWorldPosition(
            panel.convertToWorldSpaceAR(new Vec3(0, 0, 0))
        );

        this.placePortraitPanelItem(
            goalsNode, panel, -0.32, 0, 0.31, 0.88
        );

        this.placePortraitPanelItem(
            heroNode, panel, 0, 0, 0.30, 0.88
        );

        this.placePortraitPanelItem(
            movesNode, panel, 0.32, 0, 0.31, 0.88
        );

        this.normalizePortraitGoals(goalsNode, movesNode);
        this.getComponent(UILevel)?.updateLandscapeGoalsLayout();
    }

    private refreshPortraitBoosters(panel: UITransform): void {
        const layout = this.bottomBoostersLayout;
        const container = layout?.node;

        if(!container) {
            console.warn('[PORTRAIT BOOSTERS] Layout missing');
            return;
        }

        layout.enabled = false;

        if(this.bottomBoostersWidget) {
            this.bottomBoostersWidget.enabled = false;
        }

        const widget = container.getComponent(Widget);
        if(widget) widget.enabled = false;

        this.bottomBoosters.setScale(1, 1, 1);
        container.setScale(1, 1, 1);

        const containerTransform = container.getComponent(UITransform);

        if(containerTransform) {
            containerTransform.setContentSize(
                panel.width,
                panel.height
            );
        }

        container.setWorldPosition(
            panel.convertToWorldSpaceAR(new Vec3(0, 0, 0))
        );

        const settings = container.getChildByName('SettingsButton');

        if(!settings) {
            console.warn('[PORTRAIT BOOSTERS] SettingsButton not found');
        }

        const boosters = container.children.filter(node => node !== settings && node.active).slice(0, 4);

        if(boosters.length !== 4) {
            console.warn(
                '[PORTRAIT BOOSTERS] Expected 4 booster nodes, found:',
                boosters.length
            );
        }

        const buttons = settings?.isValid ? [...boosters, settings] : boosters;

        if(buttons.length === 0) return;

        const gap = Math.max(8, panel.width * 0.035);
        const horizontalPadding = panel.width * 0.04;

        const diameter = Math.min(
            (panel.width - horizontalPadding * 2 - gap * 4) / 5,
            panel.height * 0.75
        );

        const step = diameter + gap;
        const parentWorldScale = container.worldScale;
        const panelWorldScale = panel.node.worldScale;

        for(let i = 0; i < buttons.length; i++) {
            const button = buttons[i];
            const transform = button.getComponent(UITransform);

            if(!transform) continue;

            const buttonWidget = button.getComponent(Widget);
            if(buttonWidget) buttonWidget.enabled = false;

            const desiredDiameter =
                diameter * Math.abs(panelWorldScale.x);

            const naturalWidth =
                transform.width * Math.abs(parentWorldScale.x);

            const naturalHeight =
                transform.height * Math.abs(parentWorldScale.y);

            if(naturalWidth <= 0 || naturalHeight <= 0) continue;

            const scale = Math.min(desiredDiameter / naturalWidth, desiredDiameter / naturalHeight);

            const visualScale = button === settings ? scale : scale * 0.85;

            button.setScale(visualScale, visualScale, 1);

            const x = (i - (buttons.length - 1) / 2) * step;
            const y = panel.height * 0.07;

            button.setWorldPosition(panel.convertToWorldSpaceAR(new Vec3(x, y, 0)));
        }
    }

    private placePortraitPanelItem(
        node: Node,
        panel: UITransform,
        xFraction: number,
        yFraction: number,
        widthFraction: number,
        heightFraction: number
    ): void {
        const transform = node.getComponent(UITransform);
        const parent = node.parent;

        if(!transform || !parent) return;

        const widget = node.getComponent(Widget);
        if(widget) widget.enabled = false;

        const panelScale = panel.node.worldScale;
        const parentScale = parent.worldScale;

        const desiredWidth =
            panel.width * widthFraction * Math.abs(panelScale.x);

        const desiredHeight =
            panel.height * heightFraction * Math.abs(panelScale.y);

        const naturalWidth =
            transform.width * Math.abs(parentScale.x);

        const naturalHeight =
            transform.height * Math.abs(parentScale.y);

        if(naturalWidth <= 0 || naturalHeight <= 0) return;

        const scale = Math.min(
            desiredWidth / naturalWidth,
            desiredHeight / naturalHeight
        );

        node.setScale(scale, scale, 1);

        const targetWorld = panel.convertToWorldSpaceAR(
            new Vec3(
                panel.width * xFraction,
                panel.height * yFraction,
                0
            )
        );

        node.setWorldPosition(targetWorld);
    }

    private fitPortraitFieldBetweenPanels(
        upperTransform: UITransform,
        bottomTransform: UITransform
    ): void {
        const parentTransform = this.field.parent?.getComponent(UITransform);

        if(!parentTransform) {
            console.warn('[PORTRAIT FIELD] Parent UITransform missing');
            return;
        }

        const upperBottomWorld = upperTransform.convertToWorldSpaceAR(
            new Vec3(0, -upperTransform.height * upperTransform.anchorY, 0)
        );

        const bottomTopWorld = bottomTransform.convertToWorldSpaceAR(
            new Vec3(0, bottomTransform.height * (1 - bottomTransform.anchorY), 0)
        );

        const leftWorld = upperTransform.convertToWorldSpaceAR(
            new Vec3(-upperTransform.width * upperTransform.anchorX, 0, 0)
        );

        const rightWorld = upperTransform.convertToWorldSpaceAR(
            new Vec3(upperTransform.width * (1 - upperTransform.anchorX), 0, 0)
        );

        const top = parentTransform.convertToNodeSpaceAR(upperBottomWorld);
        const bottom = parentTransform.convertToNodeSpaceAR(bottomTopWorld);
        const left = parentTransform.convertToNodeSpaceAR(leftWorld);
        const right = parentTransform.convertToNodeSpaceAR(rightWorld);

        const availableWidth = Math.abs(right.x - left.x);
        const availableHeight = top.y - bottom.y;

        if(availableWidth <= 0 || availableHeight <= 0) {
            console.warn('[PORTRAIT FIELD] Invalid available area', {
                availableWidth,
                availableHeight
            });
            return;
        }

        const horizontalMargin = availableWidth * 0.05;
        const verticalMargin = availableHeight * 0.04;

        const maxWidth = availableWidth - horizontalMargin * 2;
        const maxHeight = availableHeight - verticalMargin * 2;

        const scale = Math.min(
            maxWidth / this.basicFieldSize,
            maxHeight / this.basicFieldSize
        );

        this.field.setScale(scale, scale, 1);

        const centerX = (left.x + right.x) / 2;
        const centerY = (top.y + bottom.y) / 2;

        this.field.setPosition(
            centerX,
            centerY,
            this.field.position.z
        );

        if(this.field.getComponent(Widget)?.enabled) {
            console.warn('[PORTRAIT FIELD] Active Widget may override field position');
        }
    }

    private normalizePortraitGoals(goalsNode: Node, movesNode: Node): void {
        const disableWidgets = (node: Node | null): void => {
            if(!node) return;

            for(const widget of node.getComponents(Widget)) {
                widget.enabled = false;
            }
        };

        const back = goalsNode.getChildByName('Back');
        const panel = back?.getChildByName('Panel');
        const grid = panel?.getChildByName('Layout');

        if(!back || !panel || !grid) {
            console.warn('[PORTRAIT GOALS] Missing Back, Panel or Layout');
            return;
        }

        disableWidgets(back);
        disableWidgets(panel);
        disableWidgets(grid);

        back.setPosition(0, 0, back.position.z);
        back.getComponent(UITransform)?.setContentSize(350, 400);

        panel.setPosition(0, 0, panel.position.z);
        panel.getComponent(UITransform)?.setContentSize(300, 300);

        grid.setPosition(0, -40, grid.position.z);
        grid.getComponent(UITransform)?.setContentSize(260, 260);

        const gridLayout = grid.getComponent(Layout);
        if(gridLayout) gridLayout.enabled = false;

        for(const name of ['Caption', 'CaptionPrize']) {
            const caption = back.getChildByName(name);
            if(!caption) continue;

            disableWidgets(caption);
            caption.setPosition(0, 165, caption.position.z);
        }

        const movesBack = movesNode.getChildByName('Back');

        if(movesBack) {
            disableWidgets(movesBack);
            movesBack.setPosition(0, 0, movesBack.position.z);
            movesBack.getComponent(UITransform)?.setContentSize(350, 400);
        }
        const movesLabel = movesNode.getChildByName('Label');

        if(movesLabel) {
            disableWidgets(movesLabel);
            movesLabel.setPosition(0, 165, movesLabel.position.z);
        }

        // const upper = movesNode.getChildByName('Upper');

        // if(upper) {
        //     disableWidgets(upper);
        //     upper.setPosition(0, 85, upper.position.z);
        // }

        const movesCount = movesNode.getChildByName('Count');

        if(movesCount) {
            disableWidgets(movesCount);
            movesCount.setPosition(0, -20, movesCount.position.z);
        }
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
