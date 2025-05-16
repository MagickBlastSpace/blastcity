import { _decorator, Component, Node } from 'cc';
import { Flask } from './Flask';
const { ccclass, property } = _decorator;

@ccclass('Flask_Purple')
export class Flask_Purple extends Flask {
    subscribeOnFieldEvents(field: Node) {
        if(this.isSubscribed) {
            return;
        }
        
        super.subscribeOnFieldEvents(field);

        const purpleIndex = this.availableColors.indexOf("purple");
        this.currentColorIndex = purpleIndex !== -1 ? purpleIndex : 0;

        this.refresh();
    }
}


