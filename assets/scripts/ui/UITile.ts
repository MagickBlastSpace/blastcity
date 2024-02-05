import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UITile')
export class UITile extends Component {

    private fallTime: number = 0.3;


    init(posX: number, posY: number) {
        this.node.setPosition(posX, posY + this.node.height);

        tween(this.node)
            .to(this.fallTime / 2, { position: new Vec3(posX, posY, 0) })
            .start();
    }


    moveTo(posX: number, posY: number) {
        tween(this.node).stop();

        tween(this.node)
            .to(this.fallTime, { position: new Vec3(posX, posY, 0) })
            .start();
    }
}


