import { _decorator, Component, Node } from 'cc';
import { GameData } from '../data/GameData';
const { ccclass, property } = _decorator;

@ccclass('Net')
export class Net extends Component {
    start() {
        /*
        const parsedLevels = GameData.parseLevelsJSON(jsonLevels);
        GameData.instance.levels = parsedLevels;*/
    }
}


