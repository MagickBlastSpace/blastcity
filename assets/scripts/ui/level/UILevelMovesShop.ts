import { _decorator, Component, Node, Label, Button } from 'cc';
import { MovesShopStageData } from '../../data/GameData';
import { MovesShop } from '../../game/boosters/MovesShop';
const { ccclass, property } = _decorator;

@ccclass('UILevelMovesShop')
export class UILevelMovesShop extends Component {

    @property(MovesShop)
    movesShop: MovesShop = null;

    @property(Button)
    buyBtn: Button = null;

    @property(Label)
    stageDataLabel: Label = null;
    @property(Label)
    additinalStageDataLabel: Label = null;
    @property(Label)
    buyBtnLabel: Label = null;

    private data: MovesShopStageData = null;


    start() {
        this.buyBtn.node.on(Button.EventType.CLICK, this.onBuyBtnClick, this);
    }

    refresh() {
        if(this.movesShop.isMovesShopAvailable()) {
            this.buyBtn.node.active = true;

            this.data = this.movesShop.getStageData();

            this.stageDataLabel.string = "Buy " + this.data.moves + " Moves"; 

            this.additinalStageDataLabel.string = "";
            if(this.isAdditionalDataAvailable(this.data)) {
                this.additinalStageDataLabel.string = "+";

                if(this.data.rockets > 0) {
                    this.additinalStageDataLabel.string += " Rockets x" + this.data.rockets;
                }
                if(this.data.bombs > 0) {
                    this.additinalStageDataLabel.string += " Bombs x" + this.data.bombs;
                }
                if(this.data.discoballs > 0) {
                    this.additinalStageDataLabel.string += " Discoballs x" + this.data.discoballs;
                }
            }

            this.buyBtnLabel.string = this.data.price; 
        }
        else {
            this.additinalStageDataLabel.string = "";
            this.stageDataLabel.string = "Extra moves not available";

            this.buyBtn.node.active = false;
        }
    }

    isAdditionalDataAvailable(data: MovesShopStageData): boolean {
        return data.rockets !== 0 || data.bombs !== 0 || data.discoballs !== 0;
    }


    onBuyBtnClick() {
        this.movesShop.buyStage();

        this.node.emit("buy");
    }
}


