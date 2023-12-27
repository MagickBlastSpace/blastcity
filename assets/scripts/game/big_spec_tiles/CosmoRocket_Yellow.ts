import { _decorator, Component, Node } from 'cc';
import { CosmoRocket } from './CosmoRocket';
const { ccclass, property } = _decorator;

@ccclass('CosmoRocket_Yellow')
export class CosmoRocket_Yellow extends CosmoRocket {
    subscribeOnFieldEvents(field: Node) {
        field.on("destroy", (tileType) => {
            if(tileType === "yellow") {
                this.getDamageFromEvent();
            }
        });
    }
}


