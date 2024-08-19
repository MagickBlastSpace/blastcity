import { _decorator, Component, Node, Sprite, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIDiscoballLine')
export class UIDiscoballLine extends Component {

    @property(Sprite)
    line: Sprite = null;


    setLinePositions(startPos: Vec3, endPos: Vec3) {
        let direction = new Vec3();
        Vec3.subtract(direction, endPos, startPos);

        let distance = direction.length();
        this.line.node.width = distance;

        let midPoint = startPos.clone().add(direction.multiplyScalar(0.5));
        this.line.node.setPosition(midPoint);

        let angle = Math.atan2(direction.y, direction.x) * (180 / Math.PI);
        this.line.node.angle = angle;
    }
}


