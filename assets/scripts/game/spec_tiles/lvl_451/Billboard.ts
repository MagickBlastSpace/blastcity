import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Billboard')
export class Billboard extends SpecTileBase {
    @property(Node)
    isActive: Node = null;

    
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.isGrouped = true;

        this.strength = 1;

        this.refresh();
    }

    getDamage(damageType: string) {
        if(this.strength <= 0) {
            return;
        }
        this.strength--;

        this.refresh();
    }

    setAsDamaged() {}


    refresh() {
        this.isActive.active = this.strength > 0;
    }


    isReadyToDestroy(): boolean {
        if(this.strength <= 0) {
            return true;
        }
        return false;
    }
}


