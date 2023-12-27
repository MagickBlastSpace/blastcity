import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Pump')
export class Pump extends SpecTileBase {
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.isGrouped = true;
    }

    getDamage(damageType: string) {
        if(this.isDamaged) {
            return;
        }
        this.setAsDamaged();


        this.node.emit("special", "sticker");
    }
}


