import { _decorator, Component, Node } from 'cc';
import { Shell } from '../lvl_181/Shell';
const { ccclass, property } = _decorator;

@ccclass('Mole')
export class Mole extends Shell {
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
    }

    startDestroyConsequences() {
        this.node.emit("goal", "mole");
    }
}


