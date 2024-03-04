import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('EventRewardData')
export class EventRewardData {
    @property
    gold = 0;
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