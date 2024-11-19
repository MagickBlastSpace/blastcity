import { _decorator, Component, Node } from 'cc';
import { ShopItemData } from '../data/GameData';
import { UserData } from '../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('Shop')
export class Shop extends Component {
    buy(data: ShopItemData) {
        UserData.instance.addResource("gold", data.gold);

        UserData.instance.addResource("bomb", data.startBonus_Bomb);
        UserData.instance.addResource("rocket", data.startBonus_Rocket);
        UserData.instance.addResource("discoball", data.startBonus_Discoball);

        UserData.instance.addResource("hammer", data.booster_Hammer);
        UserData.instance.addResource("bow", data.booster_Bow);
        UserData.instance.addResource("cannon", data.booster_Cannon);
        UserData.instance.addResource("jester", data.booster_Jester);

        UserData.instance.addResource("endless_lives_minutes", data.endlessLives_Minutes);

        UserData.instance.addResource("bomb_minutes", data.bonuses_Minutes);
        UserData.instance.addResource("rocket_minutes", data.bonuses_Minutes);
        UserData.instance.addResource("discoball_minutes", data.bonuses_Minutes);

        this.node.emit("buy", data);
    }
}


