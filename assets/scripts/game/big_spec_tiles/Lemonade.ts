import { _decorator, Component, Node, Vec2 } from 'cc';
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

    @property(Vec2)
    red_Position_b: Vec2 = null;
    @property(Vec2)
    blue_Position_b: Vec2 = null;
    @property(Vec2)
    green_Position_b: Vec2 = null;
    @property(Vec2)
    yellow_Position_b: Vec2 = null;

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


    subscribeOnFieldEvents(field: Node) {
        if(this.isSubscribed) {
            return;
        }
        
        super.subscribeOnFieldEvents(field);

        let fieldComp = field.getComponent("Field");
        let availableColors = fieldComp.getAvailableColors();

        if(!availableColors.includes("purple")) {
            this.strengthPurple = 0;

            this.redHp.setPosition(this.red_Position_b.x, this.red_Position_b.y);
            this.blueHp.setPosition(this.blue_Position_b.x, this.blue_Position_b.y);
            this.greenHp.setPosition(this.green_Position_b.x, this.green_Position_b.y);
            this.yellowHp.setPosition(this.yellow_Position_b.x, this.yellow_Position_b.y);
        }

        if(!availableColors.includes("red")) {
            this.strengthRed = 0;
        }

        if(!availableColors.includes("blue")) {
            this.strengthBlue = 0;
        }

        if(!availableColors.includes("green")) {
            this.strengthGreen = 0;
        }

        if(!availableColors.includes("yellow")) {
            this.strengthYellow = 0;
        }

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


    getStrengthRed(): number {
        return this.strengthRed;
    }

    getStrengthBlue(): number {
        return this.strengthBlue;
    }

    getStrengthGreen(): number {
        return this.strengthGreen;
    }

    getStrengthYellow(): number {
        return this.strengthYellow;
    }

    getStrengthPurple(): number {
        return this.strengthPurple;
    }


    setStrengthRed(strength: number) {
        this.strengthRed = strength;

        this.refresh();
    }

    setStrengthBlue(strength: number) {
        this.strengthBlue = strength;

        this.refresh();
    }

    setStrengthGreen(strength: number) {
        this.strengthGreen = strength;

        this.refresh();
    }

    setStrengthYellow(strength: number) {
        this.strengthYellow = strength;

        this.refresh();
    }

    setStrengthPurple(strength: number) {
        this.strengthPurple = strength;

        this.refresh();
    }
}


