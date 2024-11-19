import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('EventRewardData')
export class EventRewardData {
    @property
    gold = 0;

    @property
    progress = 0;

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
    battlepass = 0;
}


@ccclass('InitEventData')
export class InitEventData {
    @property
    startHour = 0;
    @property
    durationHours = 0;
    @property
    startDayOfWeek = 0;
    @property
    durationDays = 0;
}


@ccclass('RocketFeverEventData')
export class RocketFeverEventData {
    @property
    stageStep = 0;

    @property([EventRewardData])
    rewards: EventRewardData[] = [];
}

@ccclass('MagicCauldronEventData')
export class MagicCauldronEventData {
    @property([cc.String])
    pool: string[] = [];

    @property([EventRewardData])
    rewards: EventRewardData[] = [];
}

@ccclass('HiddenTempleEventData')
export class HiddenTempleEventData {
    @property([cc.String])
    connectedTiles: string[] = [];

    @property([EventRewardData])
    rewards: EventRewardData[] = [];
}


@ccclass('SpaceMissionEventData')
export class SpaceMissionEventData {
    @property
    levelsCount = 0;
    @property
    playersCount = 0;
    @property
    rewardGold = 0;
}


@ccclass('PlayerEventData')
export class PlayerEventData {
    @property
    playerName = "Bot";

    @property
    progressValue = 0;

    @property
    playerId = 0;

    @property
    clanName = "";
}


@ccclass('EventProgressData')
export class EventProgressData {
    @property
    eventName = 0;
    @property
    progress = 0;
}

