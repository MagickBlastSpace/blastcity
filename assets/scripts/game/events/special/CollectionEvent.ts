import { _decorator, Component, Node } from 'cc';
import { SpecialEventBase } from './SpecialEventBase';
import { CollectionData } from '../../../data/CollectionData';
import { SaveData } from '../../../data/SaveData';
const { ccclass, property } = _decorator;

@ccclass('CollectionEvent')
export class CollectionEvent extends SpecialEventBase {

    @property([CollectionData])
    eventData: CollectionData[] = [];

    private collectedCards: string[] = [];

    private duplicates: string[] = [];


    start() {

    }

    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        this.eventId = "collection";

        this.isStarted = true;
    }


    restartEvent() {
        super.restartEvent();

        this.collectedCards = [];
        this.duplicates = [];

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


    /*Save*/
    getSpecialPool(): stirng[] {
        return this.collectedCards;
    }

    setSpecialPool(pool: string[]) {
        if(!pool) {
            return;
        }

        this.collectedCards = pool;
    }

    getSpecialPredictions(): stirng[] {
        return this.duplicates;
    }

    setSpecialPredictions(predictions: string[]) {
        if(!predictions) {
            return;
        }

        this.duplicates = predictions;
    }
}


