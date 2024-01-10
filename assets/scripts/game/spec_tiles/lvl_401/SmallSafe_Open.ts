import { _decorator, Component, Node } from 'cc';
import { SmallSafe } from './SmallSafe';
const { ccclass, property } = _decorator;

@ccclass('SmallSafe_Open')
export class SmallSafe_Open extends SmallSafe {
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);
        this.isClosed = true;
    }
}


