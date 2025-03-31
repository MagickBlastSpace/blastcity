import { _decorator, Component, Node, sp } from 'cc';
import { BigTileBase } from './BigTileBase';
const { ccclass, property } = _decorator;

@ccclass('Jars')
export class Jars extends BigTileBase {

    @property([Node])
    hps: Node[] = [];

    @property([sp.Skeleton])
    hps_anim: sp.Skeleton[] = [];


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.isDoubleX = true;
        this.isDoubleY = true;

        this.strength = 9;
        this.refresh();
    }


    getDamage(damageType: string) {
        if(this.strength > 0) {
            this.strength--;

            this.node.emit("goal", "jars");
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
        for(let i = 0; i < this.hps.length; i++) {
            this.hps[i].active = false;
        }

        for(let i = 0; i < this.strength && i < this.hps.length; i++) {
            this.hps[i].active = true;

            /*if(this.hps_anim.length >= (i + 1)) {
                let animName = "jars" + (Math.floor(Math.random() * 3) + 1);

                this.playAdditionalAnimation(this.hps_anim[i], animName, this.hps[i]);
            }*/
        }

        if(this.hps_anim.length >= (this.strength + 1)) {
            let animName = "destroy" + (Math.floor(Math.random() * 3) + 1);

            this.playAdditionalAnimation(this.hps_anim[this.strength], animName, null);

            if(this.strength > 0) {
                this.playDamageSound();
            }
        }
    }


    startDestroyConsequences() {
        this.playAnimation("destroy", false, 1);
    }


    playDamageSound() {
        let soundIndex = this.strength % 2;
        this.playSound(soundIndex);
    }
}


