import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Box')
export class Box extends SpecTileBase {
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.strength = 1;
    }


    getDamage(damageType: string) {
        if(damageType === "bonus") {
            this.strength--;
        }
        else if(!this.isDamaged) {
            this.strength--;
            this.setAsDamaged();
        }
    }

    isReadyToDestroy(): boolean {
        if(this.strength <= 0) {
            return true;
        }
        return false;
    }


    destroyTile() {
        super.destroyTile();
        
        this.node.emit("goal", "box");
    }
}


