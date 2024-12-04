import { _decorator, Component, Node } from 'cc';
import { SpecialEventBase } from './SpecialEventBase';
import { CollectionData, CollectionRewardData } from '../../../data/CollectionData';
import { SaveData } from '../../../data/SaveData';
import { UserData } from '../../../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('CollectionEvent')
export class CollectionEvent extends SpecialEventBase {

    @property([CollectionData])
    eventData: CollectionData[] = [];

    @property([CollectionRewardData])
    totalRewards: CollectionRewardData[] = [];

    private collectedCards: string[] = [];

    private duplicates: string[] = [];

    private completedCollections: string[] = [];

    private currentStage: number = 0;

    private isTotalRewardTaken: boolean = false;


    start() {}

    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        this.eventId = "collection";

        this.isStarted = true;
    }


    restartEvent() {
        super.restartEvent();

        this.collectedCards = [];
        this.duplicates = [];

        this.currentStage = 0;
        this.isTotalRewardTaken = false;

        SaveData.instance.saveEvent(this.eventId);
    }


    openCardsPackage(type: number): string[] {
        let newCards = [];

        switch(type) {
            case 0:
                break;
            case 1:
                for(let i = 0; i < 2; i++) {
                    newCards.push(this.getRandomCard());
                }
                break;

            case 2:
                for(let i = 0; i < 3; i++) {
                    newCards.push(this.getRandomCard());
                }
                break;

            case 3:
                for(let i = 0; i < 4; i++) {
                    newCards.push(this.getRandomCard());
                }
                break;

            case 4:
                for(let i = 0; i < 6; i++) {
                    newCards.push(this.getRandomCard());
                }
                break;

            case 5: //one should be unique TBD
                for(let i = 0; i < 6; i++) {
                    newCards.push(this.getRandomCard());
                }
                break;
        }

        this.applyNewCards(newCards);

        SaveData.instance.saveEvent(this.eventId);

        return newCards;
    }


    applyNewCards(cards: string[]) {
        for(let i = 0; i < cards.length; i++) {
            if(this.collectedCards.includes(cards[i])) {
                this.duplicates.push(cards[i]);
            }
            else {
                this.collectedCards.push(cards[i]);
            }
        }
    }


    getRandomCard(): string | null {
        let rarity = this.getRarity();

        let cards = this.getAllCardsByRarity(rarity);

        if (cards.length === 0) {
            return null;
        }

        const randomIndex = Math.floor(Math.random() * cards.length);
        return cards[randomIndex];
    }


    getRarity(): number {
        const rarityChances = [
            { rarity: 1, chance: 40 },
            { rarity: 2, chance: 24 },
            { rarity: 3, chance: 18 },
            { rarity: 4, chance: 12 },
            { rarity: 5, chance: 6 },
        ];
    
        const totalChance = rarityChances.reduce((sum, item) => sum + item.chance, 0);
        const randomValue = Math.random() * totalChance;
    
        let accumulatedChance = 0;
    
        for (const item of rarityChances) {
            accumulatedChance += item.chance;
            if (randomValue < accumulatedChance) {
                return item.rarity;
            }
        }
    
        return 1;
    }

    getAllCardsByRarity(rarity: number): string[] {
        let cards = [];

        for(let i = 0; i < this.eventData.length; i++) {
            let newCards = this.findCardIdsByRarity(this.eventData[i], rarity);

            for(let j = 0; j < newCards.length; j++) {
                cards.push(newCards[j]);
            }
        }

        return cards;
    }

    findCardIdsByRarity(collection: CollectionData, rarity: number): string[] {
        return collection.cards
            .filter(card => card.stars === rarity)
            .map(card => card.id);
    }


    getTotalCardsCount(): number {
        let count = 0;

        for(let i = 0; i < this.eventData.length; i++) {
            count = count + this.eventData[i].cards.length;
        }

        return count;
    }

    getCardsCountByCollectionId(id: string): number {
        let count = 0;

        for(let i = 0; i < this.eventData.length; i++) {
            if(this.eventData[i].id === id) {
                count = this.eventData[i].cards.length;
            }
        }

        return count;
    }

    getCollectedCardsCount(): number {
        return this.collectedCards.length;
    }

    getDuplicatesCountById(id: string): number {
        return this.duplicates.filter(item => item === id).length;
    }

    getCollections(): CollectionData[] {
        return this.eventData;
    }

    getProgressByCollectionId(id: string): number {
        let progress = 0;

        for(let i = 0; i < this.eventData.length; i++) {
            if(this.eventData[i].id === id) {
                for(let j = 0; j < this.eventData[i].cards.length; j++) {
                    if(this.collectedCards.includes(this.eventData[i].cards[j].id)) {
                        progress = progress + 1;
                    }
                }
            }
        }

        return progress;
    }

    isCollected(id: string) {
        return this.collectedCards.includes(id);
    }

    findCollectionIdByCard(id: string): string {
        for(let i = 0; i < this.eventData.length; i++) {
            for(let j = 0; j < this.eventData[i].cards.length; j++) {
                if(this.eventData[i].cards[j].id === id) {
                    return this.eventData[i].id;
                }
            }
        }

        return "";
    }

    getTotalProgressValue(): number {
        return this.getCollectedCardsCount() / this.getTotalCardsCount();
    }


    isCollectionComplete(id: string): boolean {
        for(let i = 0; i < this.eventData.length; i++) {
            if(this.eventData[i].id === id) {
                for(let j = 0; j < this.eventData[i].cards.length; j++) {
                    if(!this.isCollected(this.eventData[i].cards[j].id)) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    isTotalComplete(): boolean {
        return this.getTotalProgressValue() >= 1;
    }


    isCollectionRewardTaken(id: string): boolean {
        return this.completedCollections.includes(id);
    }

    getIsTotalRewardTaken(): boolean {
        return this.isTotalRewardTaken;
    }


    takeTotalReward() {
        if(this.isTotalRewardTaken) {
            return;
        }

        this.applyReward(this.totalRewards[0]);

        this.isTotalRewardTaken = true;

        //save

        this.node.emit("refresh");
    }

    takeCollectionReward(id: string) {
        if(this.isCollectionRewardTaken(id)) {
            return;
        }

        this.completedCollections.push(id);

        //save

        for(let i = 0; i < this.eventData.length; i++) {
            if(this.eventData[i].id === id) {
                this.applyRewards(this.eventData[i].rewards);

                return;
            }
        }

        this.node.emit("refresh");
    }


    applyRewards(rewards: CollectionRewardData[]) {
        for(let i = 0; i < rewards.length; i++) {
            this.applyReward(rewards[i]);
        }
    }

    applyReward(reward: CollectionRewardData) {
        UserData.instance.addResource("gold", reward.gold);

        UserData.instance.addResource("bomb", reward.startBonus_Bomb);
        UserData.instance.addResource("rocket", reward.startBonus_Rocket);
        UserData.instance.addResource("discoball", reward.startBonus_Discoball);

        UserData.instance.addResource("hammer", reward.booster_Hammer);
        UserData.instance.addResource("bow", reward.booster_Bow);
        UserData.instance.addResource("cannon", reward.booster_Cannon);
        UserData.instance.addResource("jester", reward.booster_Jester);

        UserData.instance.addResource("bomb_minutes", reward.bomb_Minutes);
        UserData.instance.addResource("rocket_minutes", reward.rocket_Minutes);
        UserData.instance.addResource("discoball_minutes", reward.discoball_Minutes);
        UserData.instance.addResource("endless_lives_minutes", reward.endlessLives_Minutes);
        UserData.instance.addResource("modifier_x2_minutes", reward.modifierX2_Minutes);

        this.node.emit("reward", reward);
    }


    /*Save*/
    getSpecialPool(): string[] {
        return this.collectedCards;
    }

    setSpecialPool(pool: string[]) {
        if(!pool) {
            return;
        }

        this.collectedCards = pool;
    }

    getSpecialPredictions(): string[] {
        return this.duplicates;
    }

    setSpecialPredictions(predictions: string[]) {
        if(!predictions) {
            return;
        }

        this.duplicates = predictions;
    }
}


