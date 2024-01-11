import { _decorator, Component, Node } from 'cc';
import { Lemonade } from '../Lemonade';
const { ccclass, property } = _decorator;

@ccclass('FusionBomb')
export class FusionBomb extends Lemonade {
    @property(Node)
    redHp2: Node = null;
    @property(Node)
    blueHp2: Node = null;
    @property(Node)
    greenHp2: Node = null;
    @property(Node)
    yellowHp2: Node = null;

    private numRows: number = 0;
    private numCols: number = 0;

    
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isTripleX = true;
        this.isTripleY = true;

        this.strengthRed = 2;
        this.strengthBlue = 2;
        this.strengthGreen = 2;
        this.strengthYellow = 2;
        this.strengthPurple = 0;

        this.refresh();
    }
    
    subscribeOnFieldEvents(field: Node) {
        if(this.isSubscribed) {
            return;
        }
        
        super.subscribeOnFieldEvents(field);

        let fieldComp = field.getComponent("Field");
        this.numRows = fieldComp.getNumRows();
        this.numCols = fieldComp.getNumCols();
    }
    
    refresh() {
        super.refresh();

        this.redHp2.active = this.strengthRed > 1;
        this.blueHp2.active = this.strengthBlue > 1;
        this.greenHp2.active = this.strengthGreen > 1;
        this.yellowHp2.active = this.strengthYellow > 1;
    }

    startDestroyConsequences() {
        for(let i = 0; i < this.numRows; i++) {
            for(let j = 0; j < this.numCols; j++) {
                this.node.emit("extra_hit", i, j);
            }
        }

        this.node.emit("goal", "fusion_bomb");
    }
}


