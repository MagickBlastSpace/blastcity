import { _decorator, Component, Node, Label } from 'cc';
import { UIEventKingsCupPlayerItem } from '../KingsCup/UIEventKingsCupPlayerItem';
import { PlayerEventData } from '../../../data/EventData';
import { Net } from '../../../net/Net';
const { ccclass, property } = _decorator;

@ccclass('UIEventWeeklyContestPlayerItem')
export class UIEventWeeklyContestPlayerItem extends UIEventKingsCupPlayerItem {
    @property(Label)
    clanLabel: Label = null;


    async refresh(data: PlayerEventData) {
        super.refresh(data);

        this.clanLabel.string = "";

        try {
            let ids = [data.playerId];
            const result = await Net.instance.getPlayersByIds(ids);
            
            const { players } = result;
            
            if(players.length > 0) {
                this.clanLabel.string = players[0].state["clanname"];
            }
        }

        catch (error) {
            console.log('Error fetching players:', error);
        }
    }
}


