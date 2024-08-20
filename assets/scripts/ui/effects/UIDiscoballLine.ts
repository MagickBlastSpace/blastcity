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
        let midPoint = startPos.clone().add(direction.multiplyScalar(0.5));
    
        let angle = Math.atan2(direction.y, direction.x) * (180 / Math.PI);
        this.line.node.angle = angle;
    
        this.flyLine(startPos, endPos, distance);
    }
    
    flyLine(startPos: Vec3, endPos: Vec3, maxDistance: number) {
        const flyDuration = 0.67;
    
        this.line.node.width = 0;
        this.line.node.setPosition(startPos);
    
        cc.tween(this.line.node)
            .to(flyDuration / 2, { width: maxDistance, position: startPos.clone().add(endPos).multiplyScalar(0.5) })
            .to(flyDuration / 2, { width: 0, position: endPos })
            .start();
    }
}


