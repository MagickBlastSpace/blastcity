import { _decorator, Component, Node, Prefab, Vec2, instantiate } from 'cc';
import { ResolutionManager } from '../../utils/ResolutionManager';
import { SpecialPrefabData } from '../../data/GameData';
const { ccclass, property } = _decorator;

@ccclass('UIEffectManager')
export class UIEffectManager extends Component {

    @property(Prefab)
    coinReward: Prefab = null;
    @property(Prefab)
    extraHit: Prefab = null;

    @property(Node)
    effectsLayer: Node = null;

    @property(Node)
    field: Node = null;

    @property(Vec2)
    goalsPosition: Vec2 = null;
    @property(Vec2)
    goalsPosition_Portrait: Vec2 = null;

    @property
    tileSpacing: number = 0;
    @property
    xOffset: number = -660;
    @property
    yOffset: number = -660;
    @property
    tileSize: number = 165;

    @property([SpecialPrefabData])
    specialPrefabs: SpecialPrefabData[] = [];


    start() {
        this.field.on("coin_reward", (row, col) => this.createEffectCoinReward(row, col));

        this.field.on("goal_effect", (spec, row, col) => this.createSpecGoalEffect(spec, row, col));
        this.field.on("goal_effect_positioned", (spec, x, y) => this.createSpecGoalEffectPositioned(spec, x, y));
    }

    createEffectCoinReward(row: number, col: number) {
        const coin = instantiate(this.coinReward);
        this.effectsLayer.addChild(coin);
        const coinComp = coin.getComponent("UIRewardEffect");

        let posX = col * (this.tileSize + this.tileSpacing) + this.xOffset;
        let posY = row * (this.tileSize + this.tileSpacing) + this.yOffset;

        let targetPosition = ResolutionManager.instance.isPortraitOrientation() ? this.goalsPosition_Portrait : this.goalsPosition;

        coinComp.init(new Vec2(posX, posY), targetPosition);
    }

    createSpecGoalEffect(spec: string, row: number, col: number) {
        //console.log("Create special goal effect: " + spec + " at " + row + " " + col);

        const prefab = this.specialPrefabs.find(p => p.id === "goal_fly")?.prefab;
        if(prefab === null) {
            return;
        }

        const specNode = instantiate(prefab);
        this.effectsLayer.addChild(specNode);
        const specComp = specNode.getComponent("UISpecGoalEffect");

        let posX = col * (this.tileSize + this.tileSpacing) + this.xOffset;
        let posY = row * (this.tileSize + this.tileSpacing) + this.yOffset;

        posY = spec === "duck" || spec === "big_duck" ? posY - this.tileSize : posY;

        let targetPosition = ResolutionManager.instance.isPortraitOrientation() ? this.goalsPosition_Portrait : this.goalsPosition;

        specComp.init(new Vec2(posX, posY), targetPosition);
    }

    createSpecGoalEffectPositioned(spec: string, x: number, y: number) {
        const prefab = this.specialPrefabs.find(p => p.id === "goal_fly")?.prefab;
        if(prefab === null) {
            return;
        }

        const specNode = instantiate(prefab);
        this.effectsLayer.addChild(specNode);
        const specComp = specNode.getComponent("UISpecGoalEffect");

        let posX = x;
        let posY = y;

        posY = spec === "duck" || spec === "big_duck" ? posY - this.tileSize : posY;

        let targetPosition = ResolutionManager.instance.isPortraitOrientation() ? this.goalsPosition_Portrait : this.goalsPosition;

        specComp.init(new Vec2(posX, posY), targetPosition);
    }
}


