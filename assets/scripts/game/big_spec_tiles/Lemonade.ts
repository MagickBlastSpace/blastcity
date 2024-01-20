import { _decorator, Component, Node } from 'cc';
import { BigTileBase } from './BigTileBase';
const { ccclass, property } = _decorator;

@ccclass('Lemonade')
export class Lemonade extends BigTileBase {

    @property(Node)
    redHp: Node = null;
    @property(Node)
    blueHp: Node = null;
    @property(Node)
    greenHp: Node = null;
    @property(Node)
    yellowHp: Node = null;
    @property(Node)
    purpleHp: Node = null;

    private strengthRed: number;
    private strengthBlue: number;
    private strengthGreen: number;
    private strengthYellow: number;
    private strengthPurple: number;


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.isDoubleX = true;
        this.isDoubleY = true;

        this.strengthRed = 1;
        this.strengthBlue = 1;
        this.strengthGreen = 1;
        this.strengthYellow = 1;
        this.strengthPurple = 1;

        this.refresh();
    }


    getDamage(damageType: string) {
        if(this.isDamaged) {
            return;
        }
        
        if(damageType === "red" && this.strengthRed > 0) {
            this.strengthRed--;
            this.setAsDamaged();
        }
        else if(damageType === "blue" && this.strengthBlue > 0) {
            this.strengthBlue--;
            this.setAsDamaged();
        }
        else if(damageType === "green" && this.strengthGreen > 0) {
            this.strengthGreen--;
            this.setAsDamaged();
        }
        else if(damageType === "yellow" && this.strengthYellow > 0) {
            this.strengthYellow--;
            this.setAsDamaged();
        }
        else if(damageType === "purple" && this.strengthPurple > 0) {
            this.strengthPurple--;
            this.setAsDamaged();
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
            else if(this.strengthPurple > 0) {
                this.strengthPurple--;
            }
            this.setAsDamaged();
        }
        
        this.refresh();
    }

    isReadyToDestroy(): boolean {
        if(this.strengthRed <= 0 && this.strengthBlue <= 0 && this.strengthGreen <= 0 && this.strengthYellow <= 0 && this.strengthPurple <= 0) {
            return true;
        }
        return false;
    }


    refresh() {
        this.redHp.active = this.strengthRed > 0;
        this.blueHp.active = this.strengthBlue > 0;
        this.greenHp.active = this.strengthGreen > 0;
        this.yellowHp.active = this.strengthYellow > 0;
        this.purpleHp.active = this.strengthPurple > 0;
    }


    setAsDamaged() {
        super.setAsDamaged();

        this.node.emit("goal", "lemonade");
    }

    clearExtra() {
        this.isDamaged = false;
    }
}


