import { _decorator, Component, Node, Label } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Shell')
export class Shell extends SpecTileBase {

    @property(Label)
    hpLabel: Label = null;


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = true;
        this.strength = 2;
        this.refresh();
    }

    getDamage(damageType: string) {
        if(!this.isDamaged) {
            this.strength--;
            this.setAsDamaged();
        }
        this.refresh();
    }

    isReadyToDestroy(): boolean {
        if(!this.isDamaged) {
            this.strength = 2;
            this.refresh();
        }

        if(this.strength <= 0) {
            return true;
        }
        return false;
    }

    refresh() {
        if(this.strength > 1) {
            this.hpLabel.string = "Close";
        }
        else {
            this.hpLabel.string = "Open";
        }
    }
}


