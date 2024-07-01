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

    @property([ClanMemberData])
    members: ClanMemberData[] = [];
}


@ccclass('ClanMemberData')
export class ClanMemberData {
    @property
    name = "";

    @property
    score_team_battle = 0;
    @property
    score_team_treasure = 0;
}


