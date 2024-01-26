import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('SurpriseBox')
export class SurpriseBox extends SpecTileBase {

    @property([Node])
    hps: Node[] = [];


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.strength = 4;
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
        if(this.strength <= 0) {
            return true;
        }
        return false;
    }


    refresh() {
        for(let i = 0; i < this.hps.length; i++) {
            this.hps[i].active = true;
        }

        for(let i = 0; i < this.strength && i < this.hps.length; i++) {
            this.hps[i].active = false;
        }
    }
    
    startDestroyConsequences() {
        this.node.emit("change_bonus", this.getRow(), this.getCol(), "rocket_vertical", 0.2);

        this.node.emit("goal", "surprise_box");
    }


    setRespawnEvent(timeToRespawn: number) {
        this.node.emit("respawn", timeToRespawn);
    }

    clearExtra() {
        this.isDamaged = false;
    }
}


