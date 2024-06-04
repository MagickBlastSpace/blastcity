import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIMainMenuFrame')
export class UIMainMenuFrame extends Component {
    show() {
        /*if(!this.node.active) {
            this.node.setPosition(-3000, 0);
        }*/

        this.node.active = true;
        
        /*tween(this.node)
            .to(0.3, { position: new Vec3(0, 0, 0) })
            .start();*/
    }


    hide() {
        if(!this.node.active) {
            return;
        }

        this.node.active = false;

        /*tween(this.node)
            .to(0.3, { position: new Vec3(3000, 0, 0) })
            .call(() => {
                this.node.active = false;
            })
            .start();*/
    }
}


