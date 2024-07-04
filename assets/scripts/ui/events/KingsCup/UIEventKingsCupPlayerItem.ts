import { _decorator, Component, Node, Label } from 'cc';
import { UIEventSkyRacePlayerItem } from '../SkyRace/UIEventSkyRacePlayerItem';
const { ccclass, property } = _decorator;

@ccclass('UIEventKingsCupPlayerItem')
export class UIEventKingsCupPlayerItem extends UIEventSkyRacePlayerItem {

    @property(Label)
    indexLabel: Label = null;


    init(index: number) {
        this.indexLabel.string = index;
    }
}


