import { _decorator, Sprite, SpriteFrame } from 'cc';
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
        const previousStrength = this.strength;

        super.getDamage(damageType);

        if (this.strength >= previousStrength) {
            return;
        }

        if (this.strength > 0) {
            this.playDamageSound();
        }

        switch (this.strength) {
            case 2:
                this.playHitAnimation('hit_1', 'idle_2');
                break;

            case 1:
                this.playHitAnimation('hit_2', 'idle_3');
                break;
        }
    }


    playDamageSound() {
        this.playSound(0);
    }
}
