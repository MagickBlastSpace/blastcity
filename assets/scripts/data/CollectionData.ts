import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('CollectionRewardData')
export class CollectionRewardData {
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

    @property
    cardsPack = 0;
    @property
    cards = [];

    @property
    isChest = false;
}


@ccclass('CollectionCardData')
export class CollectionCardData {
    @property
    id = "";

    @property
    name_ = "";
    @property
    stars = 0;

    @property
    type = "silver";
}



@ccclass('CollectionData')
export class CollectionData {
    @property
    id = "";

    @property
    name_ = "";

    @property([CollectionRewardData])
    rewards: CollectionRewardData[] = [];

    @property([CollectionCardData])
    cards: CollectionCardData[] = [];
}
