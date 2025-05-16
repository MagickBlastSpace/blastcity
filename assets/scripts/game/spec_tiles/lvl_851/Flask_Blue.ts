import { _decorator, Component, Node } from 'cc';
import { Flask } from './Flask';
const { ccclass, property } = _decorator;

@ccclass('Flask_Blue')
export class Flask_Blue extends Flask {
    subscribeOnFieldEvents(field: Node) {
        if(this.isSubscribed) {
            return;
        }
        
        super.subscribeOnFieldEvents(field);

        const blueIndex = this.availableColors.indexOf("blue");
        this.currentColorIndex = blueIndex !== -1 ? blueIndex : 0;

        this.refresh();
    }
}


