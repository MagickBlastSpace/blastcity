import { _decorator, Component, Node, Prefab, Vec2, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIEffectManager')
export class UIEffectManager extends Component {

    @property(Prefab)
    coinReward: Prefab = null;

    @property(Node)
    effectsLayer: Node = null;

    @property(Node)
    field: Node = null;

    @property(Vec2)
    goalsPosition: Vec2 = null;


    @property
    tileSpacing: number = 5;
    @property
    xOffset: number = -150;
    @property
    yOffset: number = -175;
    @property
    tileSize: number = 40;


    start() {
        this.field.on("coin_reward", (row, col) => this.createEffectCoinReward(row, col));
    }

    createEffectCoinReward(row: number, col: number) {
        const coin = instantiate(this.coinReward);
        this.effectsLayer.addChild(coin);
        const coinComp = coin.getComponent("UIRewardEffect");

        let posX = col * (this.tileSize + this.tileSpacing) + this.xOffset;
        let posY = row * (this.tileSize + this.tileSpacing) + this.yOffset;

        coinComp.init(new Vec2(posX, posY), this.goalsPosition);
    }
}


