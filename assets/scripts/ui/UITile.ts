import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UITile')
export class UITile extends Component {

    private fallTime: number = 0.3;
    private destroyTime: number = 0.15;

    private isBlocked: boolean = false;


    init(posX: number, posY: number) {
        this.node.setPosition(posX, posY + this.node.height);

        tween(this.node)
            .to(this.fallTime / 2, { position: new Vec3(posX, posY, 0) })
            .start();

        this.isBlocked = false;
    }


    moveTo(posX: number, posY: number) {
        if(this.isBlocked) {
            return;
        }
        
        tween(this.node).stop();

        tween(this.node)
            .to(this.fallTime, { position: new Vec3(posX, posY, 0) })
            .start();
    }


    destroyTile(delay: number) {
        this.isBlocked = true;

        this.scheduleOnce(() => {
            tween(this.node).stop();

            tween(this.node)
                .to(this.destroyTime, { scale: new Vec3(2.5, 2.5, 2.5) }, { easing: 'linear' })
                .call(() => this.node.destroy())
                .start();
        }, delay);
    }
}


