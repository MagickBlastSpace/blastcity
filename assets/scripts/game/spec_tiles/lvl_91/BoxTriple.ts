import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { Box } from '../lvl_21/Box';
const { ccclass, property } = _decorator;

@ccclass('BoxTriple')
export class BoxTriple extends Box {

    @property(Sprite)
    picture: Sprite = null;

    @property(SpriteFrame)
    hp3: SpriteFrame | null = null;
    @property(SpriteFrame)
    hp2: SpriteFrame | null = null;
    @property(SpriteFrame)
    hp1: SpriteFrame | null = null;


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
        switch(this.strength) {
            case 1:
                this.picture.spriteFrame = this.hp1;
                break;
            case 2:
                this.picture.spriteFrame = this.hp2;
                break;
            case 3:
                this.picture.spriteFrame = this.hp3;
                break;
        }
    }
}


