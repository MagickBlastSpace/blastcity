import { _decorator, Component, Node } from 'cc';
import { CosmoRocket } from './CosmoRocket';
const { ccclass, property } = _decorator;

@ccclass('CosmoRocket_Red')
export class CosmoRocket_Red extends CosmoRocket {
    subscribeOnFieldEvents(field: Node) {
        field.on("destroy", (tileType) => {
            if(tileType === "red") {
                this.getDamageFromEvent();
            }
        });
    }
}


