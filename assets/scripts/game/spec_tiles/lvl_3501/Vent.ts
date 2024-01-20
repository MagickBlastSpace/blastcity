import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Vent')
export class Vent extends SpecTileBase {

    @property(Node)
    redHp: Node = null;
    @property(Node)
    blueHp: Node = null;
    @property(Node)
    greenHp: Node = null;
    @property(Node)
    yellowHp: Node = null;

    private strengthRed: number;
    private strengthBlue: number;
    private strengthGreen: number;
    private strengthYellow: number;


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;

        this.strengthRed = 1;
        this.strengthBlue = 1;
        this.strengthGreen = 1;
        this.strengthYellow = 1;

        this.refresh();
    }


    getDamage(damageType: string) {
        if(this.isDamaged) {
            return;
        }
        
        if(damageType === "red") {
            this.strengthRed--;
        }
        else if(damageType === "blue") {
            this.strengthBlue--;
        }
        else if(damageType === "green") {
            this.strengthGreen--;
        }
        else if(damageType === "yellow") {
            this.strengthYellow--;
        }
        else if(damageType === "bonus") {
            if(this.strengthRed > 0) {
                this.strengthRed--;
            }
            else if(this.strengthBlue > 0) {
                this.strengthBlue--;
            }
            else if(this.strengthGreen > 0) {
                this.strengthGreen--;
            }
            else if(this.strengthYellow > 0) {
                this.strengthYellow--;
            }
        }
        
        this.setAsDamaged();
        this.refresh();
    }

    isReadyToDestroy(): boolean {
        if(this.strengthRed <= 0 && this.strengthBlue <= 0 && this.strengthGreen <= 0 && this.strengthYellow <= 0) {
            return true;
        }
        return false;
    }


    refresh() {
        this.redHp.active = this.strengthRed > 0;
        this.blueHp.active = this.strengthBlue > 0;
        this.greenHp.active = this.strengthGreen > 0;
        this.yellowHp.active = this.strengthYellow > 0;
    }

    startDestroyConsequences() {
        this.node.emit("goal", "vent");
    }

    clearExtra() {
        this.isDamaged = false;
    }
}


