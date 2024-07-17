import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('ClanData')
export class ClanData {
    @property
    clanName = "";
    @property
    clanId = 0;

    @property
    capacity = 0;
    @property
    membersCount = 0;

    @property
    isJoined = false;

    @property
    isPrivate = false;
    @property
    ownerId = 0;
}


@ccclass('ClanMemberData')
export class ClanMemberData {
    @property
    name = "";

    @property
    score = 0;

    @property
    playerId = 0;
}


