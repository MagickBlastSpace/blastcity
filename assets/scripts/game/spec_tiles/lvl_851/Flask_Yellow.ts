import { _decorator, Component, Node } from 'cc';
import { Flask } from './Flask';
const { ccclass, property } = _decorator;

@ccclass('Flask_Yellow')
export class Flask_Yellow extends Flask {
    subscribeOnFieldEvents(field: Node) {
        if(this.isSubscribed) {
            return;
        }
        
        super.subscribeOnFieldEvents(field);

        const yellowIndex = this.availableColors.indexOf("yellow");
        this.currentColorIndex = yellowIndex !== -1 ? yellowIndex : 0;

        this.refresh();
    }
}


