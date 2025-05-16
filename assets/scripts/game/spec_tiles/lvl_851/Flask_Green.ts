import { _decorator, Component, Node } from 'cc';
import { Flask } from './Flask';
const { ccclass, property } = _decorator;

@ccclass('Flask_Green')
export class Flask_Green extends Flask {
    subscribeOnFieldEvents(field: Node) {
        if(this.isSubscribed) {
            return;
        }
        
        super.subscribeOnFieldEvents(field);

        const greenIndex = this.availableColors.indexOf("green");
        this.currentColorIndex = greenIndex !== -1 ? greenIndex : 0;

        this.refresh();
    }
}


