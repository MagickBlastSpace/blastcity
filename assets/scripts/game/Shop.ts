declare const gamepush: any;

import { _decorator, Component, Node } from 'cc';
import { ShopItemData } from '../data/GameData';
import { UserData } from '../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('Shop')
export class Shop extends Component {

    async buy(data: ShopItemData) {
        if (gamepush.payments.isAvailable) {
            console.log("payments available: " + data.tag);

            await gamepush.payments.purchase({ tag: data.tag });

            this.consume(data);

            await gamepush.player.sync();

            await gamepush.payments.consume({ tag: data.tag });

            console.log("payment successfull: " + data.tag);
        }
        else {
            console.log("payments not available");
        }
    }


    consume(data: ShopItemData) {
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

        let cards = UserData.instance.openCardsPack(data.cardsPack);
        data.cards = [];
        for(let i = 0; i < cards.length; i++) {
            data.cards.push(cards[i]);
        }

        this.node.emit("buy", data);
    }
}


