declare const gamepush: any;

import { _decorator, Component, Node } from 'cc';
import { ShopItemData } from '../data/GameData';
import { UserData } from '../data/UserData';
import { Clans } from './Clans';
import { EventRewardData } from '../data/EventData';
const { ccclass, property } = _decorator;

@ccclass('Shop')
export class Shop extends Component {

    @property(Clans)
    clans: Clans;


    async buy(data: ShopItemData): Promise<boolean> {
        if (!gamepush.payments.isAvailable) {
            console.log("Payments not available");
            return false;
        }
    
        try {
            console.log("Attempting purchase: " + data.tag);
    
            const result = await gamepush.payments.purchase({ tag: data.tag });
    
            console.log("Purchase result:", result); // для дебага
    
            // Если `purchase` не выбросила ошибку, считаем покупку успешной:
            this.consume(data);
    
            await gamepush.player.sync();
            await gamepush.payments.consume({ tag: data.tag });
    
            return true;
        } catch (err) {
            console.warn("Purchase error:", err);
            return false;
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

        if(data.clanGift_endlessLives_Minutes > 0) {
            let reward = new EventRewardData();
            reward.endlessLives_Minutes = data.clanGift_endlessLives_Minutes;

            this.clans.sendGiftToClanMembers(reward);
        }

        this.node.emit("buy", data);
    }


    async buyByTag(tag: string): Promise<boolean> {
        if (!gamepush.payments.isAvailable) {
            console.log("Payments not available");
            return false;
        }
    
        try {
            console.log("Attempting purchase: " + tag);
    
            const result = await gamepush.payments.purchase({ tag: tag });
    
            console.log("Purchase by tag result:", result);

            await gamepush.payments.consume({ tag: tag });
    
            return true;
        } catch (err) {
            console.warn("Purchase error:", err);
            return false;
        }
    }
}


