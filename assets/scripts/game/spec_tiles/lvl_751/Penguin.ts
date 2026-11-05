import { _decorator, SpriteFrame } from 'cc';
import { Pumpkin } from '../lvl_241/Pumpkin';

const { ccclass, property } = _decorator;

@ccclass('Penguin')
export class Penguin extends Pumpkin {

    @property(SpriteFrame)
    hp4: SpriteFrame | null = null;

    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.strength = 4;
        this.refresh();
    }

    refresh() {
        if (!this.picture) return;

        switch (this.strength) {
            case 1:
                this.picture.spriteFrame = this.hp1;
                break;

            case 2:
                this.picture.spriteFrame = this.hp2;
                break;

            case 3:
                this.picture.spriteFrame = this.hp3;
                break;

            case 4:
                this.picture.spriteFrame = this.hp4;
                break;
        }
    }

    startDestroyConsequences() {
        this.node.emit('goal', 'penguin');
    }
}
