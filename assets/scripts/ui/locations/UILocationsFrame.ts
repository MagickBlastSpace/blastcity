import {
    _decorator,
    AssetManager,
    assetManager,
    instantiate,
    Node,
    Prefab,
    ScrollView,
    SpriteFrame,
    UITransform,
    Vec2
} from 'cc';

import { UserData } from '../../data/UserData';
import { Chest } from '../../game/Chest';
import { UIFrameBase } from '../UIFrameBase';
import { UILocationCard } from './UILocationCard';

const { ccclass, property } = _decorator;

@ccclass('UILocationsFrame')
export class UILocationsFrame extends UIFrameBase {

    @property(ScrollView)
    scrollView: ScrollView = null;

    @property(Node)
    content: Node = null;

    @property(Prefab)
    unlockedCardPrefab: Prefab = null;

    @property(Prefab)
    lockedCardPrefab: Prefab = null;

    @property(Prefab)
    royalLeagueUnlockedCardPrefab: Prefab = null;

    @property(Prefab)
    royalLeagueLockedCardPrefab: Prefab = null;

    @property(Chest)
    chest: Chest = null;

    private cardsCreated = false;
    private cardsCreating = false;


    private cardNodes: Node[] = [];

    private readonly desktopCardScale = 0.78;

    private readonly mobileCardWidthFill = 0.82;
    private readonly mobileCardHeightFill = 0.84;

    private currentCardScale = this.desktopCardScale;

    private readonly columnGap = 120;
    private readonly rowGap = 120;

    private readonly topPadding = 80;

    private readonly bottomPadding = 380;

    private readonly currentCardOffsetY = 120;

    private bigGraphicsBundlePromise: Promise<AssetManager.Bundle> | null = null;

    private preloadPromise: Promise<void> | null = null;

    private preparePromise: Promise<void> | null = null;

    private locationSpriteFrames: (SpriteFrame | null)[] = [];

    private locationLoadPromises: (Promise<SpriteFrame | null> | null)[] = [];

    private boundResize: (() => void) | null = null;

    private lastDevMode: boolean | null = null;

    private lastStage: number | null = null;

    private lastRoyalLeagueUnlocked:
        boolean | null = null;

    onEnable() {

        if(typeof window === 'undefined') {
            return;
        }

        this.boundResize = () => {
            this.scheduleOnce(() => {
                this.updateCardsLayout();
                this.scrollToCurrentLocation();
            }, 0);
        }

        window.addEventListener(
            'resize',
            this.boundResize
        );
    }


    onDisable() {

        if(
            this.boundResize &&
            typeof window !== 'undefined'
        ) {
            window.removeEventListener(
                'resize',
                this.boundResize
            );
        }

        this.boundResize = null;
    }

    show() {

        super.show();

        const isDevMode =
            UserData.instance?.isDevMode() ?? false;

        const currentStage =
            this.chest.getStage();

        const royalLeagueUnlocked =
            isDevMode ||
            UserData.instance.getProgress() >=
                this.chest.getMainLocationsEndLevel();

        const stateChanged =
            (
                this.lastDevMode !== null &&
                this.lastDevMode !== isDevMode
            ) ||
            (
                this.lastStage !== null &&
                this.lastStage !== currentStage
            ) ||
            (
                this.lastRoyalLeagueUnlocked !== null &&
                this.lastRoyalLeagueUnlocked !==
                    royalLeagueUnlocked
            );

        if(stateChanged) {

            console.log(
                "[LOCATIONS] State changed, rebuilding cards",
                {
                    currentStage,
                    royalLeagueUnlocked,
                    isDevMode
                }
            );

            this.clearCards();
        }

        this.lastDevMode =
            isDevMode;

        this.lastStage =
            currentStage;

        this.lastRoyalLeagueUnlocked =
            royalLeagueUnlocked;

        if(!this.cardsCreated) {

            if(!this.cardsCreating) {
                void this.createCards();
            }

            return;
        }

        this.scheduleOnce(() => {

            this.updateCardsLayout();

            this.scrollToCurrentLocation();

        }, 0);
    }

    public prepareInBackground(): Promise<void> {

        if(this.preparePromise) {
            return this.preparePromise;
        }

        this.preparePromise = (async () => {
            console.log( "[LOCATIONS] Background preparation started" );

            await this.preloadAssets();

            if(
                !this.cardsCreated &&
                !this.cardsCreating
            ) {
                await this.createCards();
            }

            console.log( "[LOCATIONS] Background preparation finished" );
        })();

        return this.preparePromise;
    }

    private calculateCardScale(
        cardTransform: UITransform,
        viewTransform: UITransform
    ): number {

        const isMobile =
            typeof window !== 'undefined' &&
            window.innerWidth < 768;

        if(!isMobile) {
            return this.desktopCardScale;
        }

        const scaleByWidth =
            (
                viewTransform.width *
                this.mobileCardWidthFill
            ) /
            cardTransform.width;

        const scaleByHeight =
            (
                viewTransform.height *
                this.mobileCardHeightFill
            ) /
            cardTransform.height;

        return Math.min(
            scaleByWidth,
            scaleByHeight
        );
    }


    private async createCards() {

        this.cardsCreating = true;

        await this.preloadAssets();

        this.content.active = false;

        this.cardNodes.length = 0;

        const locationsCount = this.chest.getLocationCount();

        const currentLocation = this.chest.getStage();

        const isDevMode = UserData.instance?.isDevMode() ?? false;

        const cardsToLoad: {
            index: number;
            cardNode: Node;
            card: UILocationCard;
            startLevel: number;
            endLevel: number;
        }[] = [];

        for(
            let index = 0;
            index < locationsCount;
            index++
        ) {

            const isUnlocked = isDevMode || index <= currentLocation;

            const prefab =
                isUnlocked
                    ? this.unlockedCardPrefab
                    : this.lockedCardPrefab;

            const cardNode =
                instantiate(prefab);

            this.content.addChild(cardNode);
            this.cardNodes.push(cardNode);

            const card =
                cardNode.getComponent(UILocationCard);

            if(!card) {

                console.warn(
                    `[LOCATIONS] UILocationCard not found: ${index + 1}`
                );

                continue;
            }

            const startLevel =
                this.chest.getLocationStartLevel(
                    index
                );

            const endLevel =
                this.chest.getLocationEndLevel(
                    index
                );

            const spriteFrame =
                this.locationSpriteFrames[index];

            if(spriteFrame) {

                card.setup(
                    index + 1,
                    startLevel,
                    endLevel,
                    spriteFrame
                );
            }
            else {
                cardsToLoad.push({
                    index,
                    cardNode,
                    card,
                    startLevel,
                    endLevel
                });
            }
        }

        const royalLeagueUnlocked = isDevMode || UserData.instance.getProgress() >= this.chest.getMainLocationsEndLevel();

        const royalLeaguePrefab = royalLeagueUnlocked ? this.royalLeagueUnlockedCardPrefab : this.royalLeagueLockedCardPrefab;

        if(royalLeaguePrefab) {

            const royalLeagueCard =
                instantiate(royalLeaguePrefab);

            this.content.addChild(
                royalLeagueCard
            );

            this.cardNodes.push(
                royalLeagueCard
            );
        }
        else {
            console.warn(
                "[LOCATIONS] Royal League card prefab is missing"
            );
        }

        this.updateCardsLayout();

        await this.loadCardImagesSequentially(
            cardsToLoad
        );

        this.cardsCreated = true;
        this.cardsCreating = false;

        this.content.active = true;

        this.scheduleOnce(() => {
            this.updateCardsLayout();
            this.scrollToCurrentLocation();
        }, 0);

    }

    private async loadCardImagesSequentially(
        items: {
            index: number;
            cardNode: Node;
            card: UILocationCard;
            startLevel: number;
            endLevel: number;
        }[]
    ) {

        for(const item of items) {

            try {

                const spriteFrame =
                    await this.ensureLocationImage(
                        item.index
                    );

                if(
                    !spriteFrame ||
                    !item.cardNode.isValid
                ) {
                    continue;
                }

                item.card.setup(
                    item.index + 1,
                    item.startLevel,
                    item.endLevel,
                    spriteFrame
                );

            }
            catch(error) {

                console.error(
                    `[LOCATIONS] Failed to load location ${item.index + 1}`,
                    error
                );
            }
        }
    }

    private async loadLocationImage(
        locationIndex: number
    ): Promise<SpriteFrame> {

        const bundle =
            await this.getBigGraphicsBundle();

        const number =
            locationIndex < 10
                ? `0${locationIndex}`
                : `${locationIndex}`;

        const legacyPath =
            `back${locationIndex}/spriteFrame`;

        // Для новых локаций 1–7 используем только облегчённые изображения карточек
        if(locationIndex <= 7) {

            const cardPath =
                `redesign/cards/location_${number}_card/spriteFrame`;

            try {

                return await new Promise<SpriteFrame>(
                    (resolve, reject) => {

                        bundle.load(
                            cardPath,
                            SpriteFrame,
                            (error, spriteFrame) => {

                                if(error) {
                                    reject(error);
                                    return;
                                }

                                resolve(spriteFrame);
                            }
                        );
                    }
                );
            }
            catch(error) {

                console.warn(
                    `[LOCATIONS] Card preview not found: ${cardPath}. Using legacy background.`,
                    error
                );
            }
        }

        // Локации 8–19 пока используют старые backN
        return await new Promise<SpriteFrame>(
            (resolve, reject) => {

                bundle.load(
                    legacyPath,
                    SpriteFrame,
                    (error, spriteFrame) => {

                        if(error) {
                            reject(error);
                            return;
                        }

                        resolve(spriteFrame);
                    }
                );
            }
        );
    }

    private scrollToCurrentLocation() {

        if(
            !this.scrollView ||
            !this.scrollView.view ||
            this.cardNodes.length === 0
        ) {
            return;
        }

        const currentLocation = Math.min(this.chest.getStage(), this.cardNodes.length - 1);

        const columns = this.getColumnsCount();

        const currentRow = Math.floor(currentLocation / columns);

        const firstCardTransform = this.cardNodes[0].getComponent(UITransform);

        const contentTransform =  this.content.getComponent(UITransform);

        const viewTransform = this.scrollView.view.getComponent(UITransform);

        if(
            !firstCardTransform ||
            !contentTransform ||
            !viewTransform
        ) {
            return;
        }

        const cardScale = this.currentCardScale;

        const cardHeight = firstCardTransform.height * cardScale;

        const targetCenterFromTop =
            this.topPadding +
            cardHeight / 2 +
            currentRow *
                (
                    cardHeight +
                    this.rowGap
                );


        let offsetY = targetCenterFromTop - viewTransform.height / 2 + this.currentCardOffsetY;

        const maxOffsetY =
            Math.max(
                0,
                contentTransform.height -
                viewTransform.height
            );

        offsetY =
            Math.max(
                0,
                Math.min(
                    offsetY,
                    maxOffsetY
                )
            );

        this.scrollView.scrollToOffset(
            new Vec2(
                0,
                offsetY
            ),
            0
        );
    }


    private getColumnsCount(): number {

        // Показываем Locations в один столбец на телефоне, планшете и десктопе.
        return 1;


        // Старый вариант: 2 столбца на планшете/десктопе, 1 столбец на телефоне.
        //
        // if(typeof window !== 'undefined') {
        //
        //     const isTabletOrDesktop =
        //         window.innerWidth >= 768 &&
        //         window.innerHeight >= 600;
        //
        //     return isTabletOrDesktop ? 2 : 1;
        // }
        //
        // return 1;
    }


    private updateCardsLayout() {

        if(
            !this.content ||
            !this.scrollView ||
            this.cardNodes.length === 0
        ) {
            return;
        }

        const columns = this.getColumnsCount();

        const firstCardTransform = this.cardNodes[0].getComponent(UITransform);

        const contentTransform = this.content.getComponent(UITransform);

        const viewTransform = this.scrollView.view ?.getComponent(UITransform);

        if( !firstCardTransform || !contentTransform || !viewTransform  ) {
            return;
        }

        const cardScale =
            this.calculateCardScale(
                firstCardTransform,
                viewTransform
            );

        this.currentCardScale = cardScale;

        for(const cardNode of this.cardNodes) {

            cardNode.setScale(
                cardScale,
                cardScale,
                1
            );
        }

        const cardWidth = firstCardTransform.width * cardScale;

        const cardHeight = firstCardTransform.height * cardScale;

        const rows =
            Math.ceil(
                this.cardNodes.length / columns
            );

        for(
            let index = 0;
            index < this.cardNodes.length;
            index++
        ) {

            const row =
                Math.floor(index / columns);

            const column =
                index % columns;

            let x = 0;

            if(columns === 2) {

                const totalRowWidth =
                    cardWidth * 2 +
                    this.columnGap;

                const firstColumnX =
                    -totalRowWidth / 2 +
                    cardWidth / 2;

                x =
                    firstColumnX +
                    column *
                    (cardWidth + this.columnGap);
            }

            const y =
                -this.topPadding
                - cardHeight / 2
                - row *
                    (cardHeight + this.rowGap);

            this.cardNodes[index].setPosition(
                x,
                y,
                0
            );
        }

        const contentHeight =
            this.topPadding +
            rows * cardHeight +
            Math.max(
                0,
                rows - 1
            ) * this.rowGap +
            this.bottomPadding;

        contentTransform.setContentSize(
            contentTransform.width,
            contentHeight
        );

        console.log(
            `[LOCATIONS] Layout: ${columns} columns, ${rows} rows`
        );
    }

    private getBigGraphicsBundle(): Promise<AssetManager.Bundle> {

        const loadedBundle =
            assetManager.getBundle('big_graphics');

        if(loadedBundle) {
            return Promise.resolve(loadedBundle);
        }

        if(this.bigGraphicsBundlePromise) {
            return this.bigGraphicsBundlePromise;
        }

        this.bigGraphicsBundlePromise =
            new Promise((resolve, reject) => {

                assetManager.loadBundle(
                    'big_graphics',
                    (error, bundle) => {

                        if(error) {
                            this.bigGraphicsBundlePromise = null;
                            reject(error);
                            return;
                        }

                        resolve(bundle);
                    }
                );
            });

        return this.bigGraphicsBundlePromise;
    }

    public preloadAssets(): Promise<void> {

        if(this.preloadPromise) {
            return this.preloadPromise;
        }

        this.preloadPromise =
            this.preloadLocationImagesInBackground();

        return this.preloadPromise;
    }


    private async preloadLocationImagesInBackground():
        Promise<void> {

        this.ensureLocationCacheSize();

        const currentStage = this.chest.getStage();

        const locationsCount = this.chest.getLocationCount();

        const loadOrder: number[] = [];

        for(const stage of [ currentStage, currentStage - 1, currentStage + 1, currentStage - 2, currentStage + 2 ]) {
            if( stage >= 0 && stage < locationsCount && !loadOrder.includes(stage) ) {
                loadOrder.push(stage);
            }
        }

        for( let stage = 0; stage < locationsCount; stage++ ) {
            if(!loadOrder.includes(stage)) {
                loadOrder.push(stage);
            }
        }

        console.log(
            "[LOCATIONS PRELOAD] Background order:",
            loadOrder.map(
                stage => stage + 1
            )
        );

        for(const stage of loadOrder) {
            await this.ensureLocationImage(
                stage
            );
        }

        console.log(
            "[LOCATIONS PRELOAD] Background finished"
        );
    }

    public async getLocationSpriteFrame(
        stage: number
    ): Promise<SpriteFrame | null> {

        return await this.ensureLocationImage(
            stage
        );
    }

    private ensureLocationCacheSize() {

        const locationsCount =
            this.chest.getLocationCount();

        while(
            this.locationSpriteFrames.length <
            locationsCount
        ) {
            this.locationSpriteFrames.push(
                null
            );
        }

        while(
            this.locationLoadPromises.length <
            locationsCount
        ) {
            this.locationLoadPromises.push(
                null
            );
        }

        if(
            this.locationSpriteFrames.length >
            locationsCount
        ) {
            this.locationSpriteFrames.length =
                locationsCount;
        }

        if(
            this.locationLoadPromises.length >
            locationsCount
        ) {
            this.locationLoadPromises.length =
                locationsCount;
        }
    }


    private ensureLocationImage(
        stage: number
    ): Promise<SpriteFrame | null> {

        this.ensureLocationCacheSize();

        const locationsCount =
            this.chest.getLocationCount();

        if(
            stage < 0 ||
            stage >= locationsCount
        ) {
            return Promise.resolve(null);
        }

        const cached =
            this.locationSpriteFrames[stage];

        if(cached) {
            return Promise.resolve(cached);
        }

        const existingPromise =
            this.locationLoadPromises[stage];

        if(existingPromise) {
            return existingPromise;
        }

        const loadPromise =
            this.loadLocationImage(
                stage + 1
            )
                .then((spriteFrame) => {

                    this.locationSpriteFrames[stage] =
                        spriteFrame;

                    this.locationLoadPromises[stage] =
                        null;

                    return spriteFrame;
                })
                .catch((error) => {

                    this.locationLoadPromises[stage] =
                        null;

                    console.error(
                        `[LOCATIONS PRELOAD] ` +
                        `Failed location ${stage + 1}`,
                        error
                    );

                    return null;
                });

        this.locationLoadPromises[stage] =
            loadPromise;

        return loadPromise;
    }

    private clearCards() {

        for(const cardNode of this.cardNodes) {

            if(cardNode && cardNode.isValid) {
                cardNode.removeFromParent();
                cardNode.destroy();
            }
        }

        this.cardNodes.length = 0;

        this.cardsCreated = false;
        this.cardsCreating = false;
    }
}
