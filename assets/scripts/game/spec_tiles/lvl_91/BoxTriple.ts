import { _decorator, Component, Node, Label } from 'cc';
import { Box } from '../lvl_21/Box';
const { ccclass, property } = _decorator;

@ccclass('BoxTriple')
export class BoxTriple extends Box {

    @property(Label)
    hpLabel: Label = null;


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.strength = 3;
        this.refresh();
    }

    getDamage(damageType: string) {
        super.getDamage(damageType);

        this.refresh();
    }

    refresh() {
        this.hpLabel.string = this.strength;
    }
}


