import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('ChestRewardData')
export class ChestRewardData {
    @property
    gold = 0;

    @property
    startBonus_Bomb = 0;
    @property
    startBonus_Rocket = 0;
    @property
    startBonus_Discoball = 0;

    @property
    booster_Hammer = 0;
    @property
    booster_Bow = 0;
    @property
    booster_Cannon = 0;
    @property
    booster_Jester = 0;

    @property
    endlessLives_Minutes = 0;
    @property
    modifierX2_Minutes = 0;

    @property
    bomb_Minutes = 0;
    @property
    rocket_Minutes = 0;
    @property
    discoball_Minutes = 0;
}

@ccclass('ChestData')
export class ChestData {
    @property
    stageStep = 0;

    @property
    level = 0;

    @property([ChestRewardData])
    rewards: ChestRewardData[] = [];
}
