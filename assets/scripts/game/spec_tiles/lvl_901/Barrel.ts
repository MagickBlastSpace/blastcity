import { _decorator, Component, Node } from 'cc';
import { Watermelon } from '../lvl_241/Watermelon';
const { ccclass, property } = _decorator;

@ccclass('Barrel')
export class Barrel extends Watermelon {
    
    private possibleBonuses: string[] = [];


    subscribeOnFieldEvents(field: Node) {
        let fieldComp = field.getComponent("Field");
        let availableColors = fieldComp.getAvailableColors();

        for(let i = 0; i < availableColors.length; i++) {
            this.possibleBonuses.push(availableColors[i]);
            this.possibleBonuses.push("bomb");
            this.possibleBonuses.push("rocket_vertical");
            this.possibleBonuses.push("rocket_horizontal");
        }
    }

    startDestroyConsequences() {
        let rndBonus = this.pickRandomBonus();
        this.node.emit("change_bonus", this.row, this.col, rndBonus, false);
        this.node.emit("goal", "barrel");
    }


    pickRandomBonus(): string {
        const randomIndex = Math.floor(Math.random() * this.possibleBonuses.length);
        return this.possibleBonuses[randomIndex];
    }
}


