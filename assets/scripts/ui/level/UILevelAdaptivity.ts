import { _decorator, Component, Node, UITransform, Size, Vec3, view } from 'cc';
import { UIField } from '../UIField';
const { ccclass, property } = _decorator;

@ccclass('UILevelAdaptivity')
export class UILevelAdaptivity extends Component {

    @property(Node)
    upperPanel: Node = null;

    @property(Node)
    bottomPanel: Node = null;

    @property(Node)
    field: Node = null;

    private basicFieldSize: number = 1485;


    start() {

    }

    refresh() {
        let visibleSize = view.getVisibleSize();
        let w = visibleSize.width;
        let h = visibleSize.height;

        console.log("width: " + w);
        console.log("height: " + h);

        if (w > h) {
            let x = 0.125 * h;

            let fieldSize = 6 * x;
            let fieldScale = fieldSize / this.basicFieldSize;

            this.field.setScale(new Vec3(fieldScale, fieldScale, 1));

        } else {
            let x = 0.225 * w;
            let bottom_panel_size = 0.179 * h;
            let y = (bottom_panel_size - x) / 3;
            let upper_panel_size = 0.266 * h;
            let z = (1 - 0.179 - 0.266) * h - 4.211 * x;
            let fieldSize = 4.211 * x;
            let fieldScale = fieldSize / this.basicFieldSize;

            console.log("x: " + x);
            console.log("upper panel: " + upper_panel_size);
            console.log("bottom panel: " + bottom_panel_size);
            console.log("fieldScale: " + fieldScale);

            this.upperPanel.getComponent(UITransform).setContentSize(new Size(w, upper_panel_size));
            this.upperPanel.setPosition(0, h / 2 - upper_panel_size / 2);

            this.bottomPanel.getComponent(UITransform).setContentSize(new Size(w, bottom_panel_size));
            this.bottomPanel.setPosition(0, -h / 2 + bottom_panel_size / 2);

            this.field.setScale(new Vec3(fieldScale, fieldScale, 1));
        }
    }
}


