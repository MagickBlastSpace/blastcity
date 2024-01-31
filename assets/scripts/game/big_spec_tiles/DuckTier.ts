import { _decorator, Component, Node } from 'cc';
import { Soda } from './Soda';
const { ccclass, property } = _decorator;

@ccclass('DuckTier')
export class DuckTier extends Soda {

    private isHealAvailable: boolean = false;

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

    startDestroyConsequences() {
        this.node.emit("goal", "duck_tier");
    }

    clear() {
        super.clear();

        this.isHealAvailable = true;
    }

    clearExtra() {
        if(this.isDamaged) {
            this.isHealAvailable = false;
        }
        this.isDamaged = false;
    }

    startInActionEffect(field: Node[][]): boolean {
        if(!this.isDamaged && this.strength < 4 && this.isHealAvailable) {
            this.strength++;
            this.refresh();
            this.isHealAvailable = false;

            return true;
        }

        return false;
    }
}


