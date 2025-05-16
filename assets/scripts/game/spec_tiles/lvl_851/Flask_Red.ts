import { _decorator, Component, Node } from 'cc';
import { Flask } from './Flask';
const { ccclass, property } = _decorator;

@ccclass('Flask_Red')
export class Flask_Red extends Flask {
    subscribeOnFieldEvents(field: Node) {
        if(this.isSubscribed) {
            return;
        }
        
        super.subscribeOnFieldEvents(field);

        const redIndex = this.availableColors.indexOf("red");
        this.currentColorIndex = redIndex !== -1 ? redIndex : 0;

        this.refresh();
    }
}


