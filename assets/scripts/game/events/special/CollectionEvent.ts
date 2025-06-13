declare const gamepush: any;

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

    @property([CollectionRewardData])
    exchangeRewards: CollectionRewardData[] = [];

    private collectedCards: string[] = [];

    private duplicates: string[] = [];

    private completedCollections: string[] = [];

    private currentStage: number = 0;

    private isTotalRewardTaken: boolean = false;

    private sw_badgeNames: string[] = ["badge_greek_1", "badge_greek_2"];
    private as_badgeNames: string[] = ["badge_winter_1", "badge_winter_2"];

    private season_Prefix = "sw_";


    start() {}

    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        this.eventId = "collection";

        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        this.isStarted = true;

        this.lastAttemptTimestamp = Date.now();
    }


    private calculateStartEndTime(startHourUTC: number, durationDays: number): void {
        const isSummerWinter = gamepush.events.has('summer_winter');
        const isAutumnSpring = gamepush.events.has('autumn_spring');

        if(isSummerWinter) {
            console.log("Summer Winter Season!");

            this.season_Prefix = "sw_";

            const eventInfo = gamepush.events.getEvent('summer_winter');

            const { event, isJoined, stats, rewards, achievements, products } = eventInfo;

            if (event) {
                const rawStart = event.dateStart;
                const rawEnd = event.dateEnd;

                const formattedStart = rawStart.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
                const formattedEnd = rawEnd.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");

                this.startTime = new Date(formattedStart);
                this.endTime = new Date(formattedEnd);
            }
        }
        else if(isAutumnSpring) {
            console.log("Autumn Spring Season!");

            this.season_Prefix = "as_";

            const eventInfo = gamepush.events.getEvent('autumn_spring');

            const { event, isJoined, stats, rewards, achievements, products } = eventInfo;

            if (event) {
                const rawStart = event.dateStart;
                const rawEnd = event.dateEnd;

                const formattedStart = rawStart.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
                const formattedEnd = rawEnd.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");

                this.startTime = new Date(formattedStart);
                this.endTime = new Date(formattedEnd);
            }
        }
        else {
            console.log("Get Season Failed!");

            super.calculateStartEndTime(startHourUTC, durationDays);
        }

        console.log("Start time: " + this.eventId + " " + this.startTime);
        console.log("End time: " + this.eventId + " " + this.endTime);
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

            case 5:
                for(let i = 0; i < 5; i++) {
                    newCards.push(this.getRandomCard());
                }
                newCards.push(this.getUniqueRandomCard());
                break;
        }

        this.applyNewCards(newCards);

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

        SaveData.instance.saveEvent(this.eventId);
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

    getUniqueRandomCard(): string | null {
        if(this.isTotalComplete()) {
            return this.getRandomCard();
        }

        for(let i = 1; i <= 5; i++) {
            let cards = this.getAllCardsByRarity(i);

            for(let j = 0; j < cards.length; j++) {
                if(!this.collectedCards.includes(cards[j])) {
                    return cards[j];
                }
            }
        }

        return null;
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

    getDuplicatesCount(): number {
        return this.duplicates.length;
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

        this.applyReward(this.totalRewards[this.currentStage]);

        this.takeBadge();

        this.isTotalRewardTaken = true;

        if(this.currentStage < 1) {
            this.currentStage = this.currentStage + 1;

            this.collectedCards = [];
            this.duplicates = [];

            this.isTotalRewardTaken = false;
        }
        
        SaveData.instance.saveEvent(this.eventId);

        this.node.emit("refresh");

        gamepush.player.add('stat_collections_finished', 1);
        gamepush.player.sync();
    }

    async takeBadge() {
        let badgeName = "";
        if(this.getSeasonPrefix() === "sw_" && this.currentStage < this.sw_badgeNames.length) {
            badgeName = this.sw_badgeNames[this.currentStage];
        }
        else if(this.getSeasonPrefix() === "as_" && this.currentStage < this.as_badgeNames.length) {
            badgeName = this.as_badgeNames[this.currentStage];
        }

        await gamepush.rewards.give({ tag: badgeName });

        await gamepush.player.sync();
    }

    takeCollectionReward(id: string) {
        if(this.isCollectionRewardTaken(id)) {
            return;
        }

        this.completedCollections.push(id);

        SaveData.instance.saveEvent(this.eventId);

        for(let i = 0; i < this.eventData.length; i++) {
            if(this.eventData[i].id === id) {
                this.applyRewards(this.eventData[i].rewards);

                this.node.emit("refresh");

                console.log("stat collections update");
                
                gamepush.player.add('stat_collections', 1);
                gamepush.player.sync();

                return;
            }
        }
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

        let cards = UserData.instance.openCardsPack(reward.cardsPack);
        reward.cards = [];
        for(let i = 0; i < cards.length; i++) {
            reward.cards.push(cards[i]);
        }

        if(reward.isChest) {
            gamepush.player.add('stat_chests_open', 1);
            gamepush.player.sync();
        }

        this.node.emit("reward", reward);
    }

    
    exchangeDuplicates(level: number) {
        let starsRequired = 10;
    
        switch (level) {
            case 1:
                starsRequired = 25;
                break;
            case 2:
                starsRequired = 50;
                break;
        }
    
        const totalDuplicatesStars = this.getTotalDuplicatesStars();
        //console.log(`exchangeDuplicates: level = ${level}, starsRequired = ${starsRequired}, totalDuplicatesStars = ${totalDuplicatesStars}`);
    
        if (starsRequired > totalDuplicatesStars) {
            //console.log(`exchangeDuplicates: Not enough stars to exchange.`);
            return;
        }
    
        let totalStarsExchanged = 0;
    
        for (let rarity = 1; rarity <= 5; rarity++) {
            for (let i = 0; i < this.eventData.length; i++) {
                const cards = this.findCardIdsByRarity(this.eventData[i], rarity);
                //console.log(`exchangeDuplicates: rarity = ${rarity}, cards =`, cards);
    
                for (let cardId of cards) {
                    let duplicatesCount = this.getDuplicatesCountById(cardId);
    
                    while (duplicatesCount > 0 && totalStarsExchanged < starsRequired) {
                        if (this.removeDuplicate(cardId)) {
                            totalStarsExchanged += rarity;
                            duplicatesCount--;
    
                            //console.log(`exchangeDuplicates: cardId = ${cardId}, totalStarsExchanged = ${totalStarsExchanged}`);
    
                            if (totalStarsExchanged >= starsRequired) {
                                //console.log(`exchangeDuplicates: Stars requirement met. Applying reward.`);
                                this.applyReward(this.exchangeRewards[level]);
                                this.node.emit("refresh");
                                return;
                            }
                        }
                    }
                }
            }
        }
    
        //console.log(`exchangeDuplicates: Finished processing without meeting requirement.`);
    }

    getTotalDuplicatesStars(): number {
        let total = 0;

        for(let i = 0; i < this.eventData.length; i++) {
            for(let rarity = 1; rarity <= 5; rarity++) {
                let cards = this.findCardIdsByRarity(this.eventData[i], rarity);

                for(let k = 0; k < cards.length; k++) {
                    total = total + this.countDuplicatesById(cards[k]) * rarity;
                }
            }
        }
        
        return total;
    }

    countDuplicatesById(id: string): number {
        let duplicates = this.duplicates.filter(d => d === id);
        return duplicates.length;
    }

    removeDuplicate(id: string): boolean {
        for (let i = this.duplicates.length - 1; i >= 0; i--) {
            if (this.duplicates[i] === id) {
                this.duplicates.splice(i, 1);

                SaveData.instance.saveEvent(this.eventId);

                return true;
            }
        }

        return false;
    }


    sendCard(playerId: number, cardId: string) {
        console.log("trying to send card: " + cardId);

        if(playerId === UserData.instance.getPlayerId()) {
            return;
        }

        if(!this.duplicates.includes(cardId)) {
            return;
        }

        console.log("sending card: " + cardId);

        gamepush.channels.sendPersonalMessage({
            playerId: playerId,
            text: cardId,
            tags: ['collection_card'],
        });

        this.removeDuplicate(cardId);

        this.node.emit("refresh");
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

    getCompletedCollections(): string[] {
        return this.completedCollections;
    }

    setCompletedCollections(collections: string[]) {
        if(!collections) {
            return;
        }

        this.completedCollections = collections;
    }

    setIsTotalRewardTaken(isTaken: boolean) {
        this.isTotalRewardTaken = isTaken;
    }


    getSeasonPrefix(): string {
        return this.season_Prefix;
    }
}


