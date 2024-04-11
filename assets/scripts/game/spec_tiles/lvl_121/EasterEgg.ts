import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('EasterEgg')
export class EasterEgg extends SpecTileBase {

    private changeColor: string = "";

    private availableColors: string[] = [];


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = true;
        this.strength = 1;
    }

    getDamage(damageType: string) {
        if(this.isDamaged) {
            return;
        }

        if(damageType === "bonus") {
            const colorIndex = Math.floor(Math.random() * this.availableColors.length);
            this.changeColor = this.availableColors[colorIndex];
        }
        else {
            this.changeColor = damageType;
        }

        this.strength--;
        this.setAsDamaged();
    }

    isReadyToDestroy(): boolean {
        if(this.strength <= 0) {
            return true;
        }
        return false;
    }


    startDestroyConsequences() {
        if(this.changeColor === "") {
            return;
        }

        if(this.changeColor === undefined) {
            this.changeColor = "random";
        }

        this.node.emit("change", this.row, this.col, "easteregg_" + this.changeColor);
    }


    subscribeOnFieldEvents(field: Node) {
        if(this.isSubscribed) {
            return;
        }
        
        super.subscribeOnFieldEvents(field);

        let fieldComp = field.getComponent("Field");
        this.availableColors = fieldComp.getAvailableColors();
    }
}


