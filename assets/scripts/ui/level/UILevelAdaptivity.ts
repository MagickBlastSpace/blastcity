import { _decorator, Component, Node, UITransform, Size, Vec3, view, Layout, Widget } from 'cc';
import { UIField } from '../UIField';
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


    start() {
        this.scheduleOnce(() => this.refresh(), 0.1);
    }
    
    refresh() {
        const visibleSize = view.getVisibleSize();
    
        const w = visibleSize.width;
        const h = visibleSize.height;
    
        if (w > h) {
            const x = 0.125 * h;
            const y = ( (0.140 * w) - (0.93 * x) ) / 2;
            const fieldSize = 6 * x;
            const fieldScale = fieldSize / this.basicFieldSize;
    
            this.field.setScale(new Vec3(fieldScale, fieldScale, 1));

            const sidePanelSize = 0.140 * w;
            this.sidePanel_left.getComponent(UITransform).setContentSize(new Size(sidePanelSize, h));
            this.sidePanel_left.setPosition(-w / 2 + sidePanelSize / 2, 0);

            this.sidePanel_right.getComponent(UITransform).setContentSize(new Size(sidePanelSize, h));
            this.sidePanel_right.setPosition(w / 2 - sidePanelSize / 2, 0);

            const booSize = 0.93 * x;
            const booScaleX = booSize / this.basicBoosterSize_Bottom_w;
            const booScaleY = booSize / this.basicBoosterSize_Bottom_h;
    
            this.sideBoosters.setScale(new Vec3(booScaleX, booScaleY, 1));
    
            const booLayoutSpacing = 0.2 * x; //0.25
            this.sideBoostersLayout.spacingY = booLayoutSpacing;
            this.sideBoostersLayout.updateLayout();

            this.sideBoostersWidget.right = y;

            const goalsScale = x / this.basicX_Landscape;
            this.goals_Landscape.setScale(new Vec3(goalsScale, goalsScale, 1));

            const goalsLayoutSpacing = 0.4 * x;
            this.goals_Layout.spacingY = goalsLayoutSpacing;
            this.goals_Layout.updateLayout();

        } else {
            const x = 0.225 * w;
            const bottomPanelSize = 0.179 * h;
            const y = (bottomPanelSize - x) / 3;
            const upperPanelSize = 0.266 * h;
            const z = (upperPanelSize - 1.504 * x) / 4.375;
    
            const fieldSize = 4 * x; //4.211
            const fieldScale = fieldSize / this.basicFieldSize;
    
            this.upperPanel.getComponent(UITransform).setContentSize(new Size(w, upperPanelSize));
            //this.upperPanel.setPosition(0, h / 2 - upperPanelSize / 2);
    
            this.bottomPanel.getComponent(UITransform).setContentSize(new Size(w, bottomPanelSize));
            //this.bottomPanel.setPosition(0, -h / 2 + bottomPanelSize / 2);
    
            this.field.setScale(new Vec3(fieldScale, fieldScale, 1));
    
            const booSize = 0.932 * x;
            const booScaleX = booSize / this.basicBoosterSize_Bottom_w;
            const booScaleY = x / this.basicBoosterSize_Bottom_h;
    
            this.bottomBoosters.setScale(new Vec3(booScaleX, booScaleY, 1));
            this.bottomBoostersWidget.top = y;
    
            const booLayoutSpacing = 0.075 * x;
            this.bottomBoostersLayout.spacingX = booLayoutSpacing;
            this.bottomBoostersLayout.updateLayout();

            const goalsScale = x / this.basicX;
            this.goals.setScale(new Vec3(goalsScale, goalsScale, 1));

            this.goals_Widget.bottom = z;
        }
    }
}


