import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('EventRewardData')
export class EventRewardData {
    @property
    gold = 0;

    @property
    progress = 0;
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

    @property
    rewardGold = 0;
}

@ccclass('MagicCauldronEventData')
export class MagicCauldronEventData {
    @property([cc.String])
    pool: string[] = [];
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
}

