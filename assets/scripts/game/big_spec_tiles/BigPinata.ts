import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { BigTileBase } from './BigTileBase';
const { ccclass, property } = _decorator;

@ccclass('BigPinata')
export class BigPinata extends BigTileBase {

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

        this.isShifts = false;
        this.isDoubleX = true;
        this.isDoubleY = true;

        this.strength = 3;
        this.refresh();
    }


    getDamage(damageType: string) {
        if(damageType === "bonus" && !this.isDamaged) {
            this.strength--;
            this.setAsDamaged();
        }
        
        this.refresh();
    }

    isReadyToDestroy(): boolean {
        if(this.strength <= 0) {
            return true;
        }
        return false;
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

    startDestroyConsequences() {
        this.node.emit("goal", "big_pinata");
    }

    clearExtra() {
        this.isDamaged = false;
    }
}


