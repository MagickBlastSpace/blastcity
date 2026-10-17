import {
    _decorator,
    AssetManager,
    assetManager,
    instantiate,
    Node,
    Prefab,
    ScrollView,
    SpriteFrame,
    UITransform
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

    private readonly cardScale = 0.78;

    private readonly columnGap = 120;
    private readonly rowGap = 120;

    private readonly topPadding = 80;

    private readonly bottomPadding = 380;

    private bigGraphicsBundlePromise: Promise<AssetManager.Bundle> | null = null;

    private preloadPromise: Promise<void> | null = null;

    private locationSpriteFrames: (SpriteFrame | null)[] = [];

    private locationLoadPromises: (Promise<SpriteFrame | null> | null)[] = [];

    private backgroundPreloadPromise: Promise<void> | null = null;

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
            }, 0);
        };

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


    private async createCards() {

        this.cardsCreating = true;

        await this.preloadAssets();

        this.content.active = false;

        this.cardNodes.length = 0;

        const locationsCount = this.chest.getLocationCount();

        const currentLocation = this.chest.getStage();

        const isDevMode = UserData.instance?.isDevMode() ?? false;

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

            cardNode.setScale(
                this.cardScale,
                this.cardScale,
                1
            );

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

                void this.ensureLocationImage(
                    index
                ).then((loadedSpriteFrame) => {

                    if(
                        !loadedSpriteFrame ||
                        !cardNode.isValid
                    ) {
                        return;
                    }

                    card.setup(
                        index + 1,
                        startLevel,
                        endLevel,
                        loadedSpriteFrame
                    );
                });
            }
        }

        const royalLeagueUnlocked = isDevMode || UserData.instance.getProgress() >= this.chest.getMainLocationsEndLevel();

        const royalLeaguePrefab = royalLeagueUnlocked ? this.royalLeagueUnlockedCardPrefab : this.royalLeagueLockedCardPrefab;

        if(royalLeaguePrefab) {

            const royalLeagueCard =
                instantiate(royalLeaguePrefab);

            royalLeagueCard.setScale(
                this.cardScale,
                this.cardScale,
                1
            );

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

        this.cardsCreated = true;
        this.cardsCreating = false;

        this.content.active = true;

        this.scheduleOnce(() => {
            this.updateCardsLayout();
            this.scrollToCurrentLocation();
        }, 0);

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

        const redesignPath =
            `redesign/location_${number}_menu/spriteFrame`;

        try {
            return await new Promise<SpriteFrame>(
                (resolve, reject) => {

                    bundle.load(
                        redesignPath,
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
        catch {

            const legacyPath =
                `back${locationIndex}/spriteFrame`;

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
    }

    private scrollToCurrentLocation() {

        if(!this.scrollView) {
            return;
        }

        const currentLocation = this.chest.getStage();

        const locationsCount = this.chest.getLocationCount();

        const columns = this.getColumnsCount();

        const rows = Math.ceil(locationsCount / columns);

        const currentRow = Math.floor(currentLocation / columns);

        if(rows <= 1) {
            this.scrollView.scrollToTop(0);
            return;
        }

        const progress =
            currentRow /
            (rows - 1);

        this.scrollView.scrollToPercentVertical(
            1 - progress,
            0
        );
    }


    private getColumnsCount(): number {

        if(typeof window !== 'undefined') {

            const isTabletOrDesktop =
                window.innerWidth >= 768 &&
                window.innerHeight >= 600;

            return isTabletOrDesktop ? 2 : 1;
        }

        return 1;
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

        const firstCardTransform =
            this.cardNodes[0].getComponent(UITransform);

        const contentTransform =
            this.content.getComponent(UITransform);

        if(
            !firstCardTransform ||
            !contentTransform
        ) {
            return;
        }

        const cardWidth =
            firstCardTransform.width *
            this.cardScale;

        const cardHeight =
            firstCardTransform.height *
            this.cardScale;

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
            this.preloadPriorityLocationImages();

        return this.preloadPromise;
    }


    public async getLocationSpriteFrame(
        stage: number
    ): Promise<SpriteFrame | null> {

        return await this.ensureLocationImage(
            stage
        );
    }


    private async preloadPriorityLocationImages():
        Promise<void> {

        this.ensureLocationCacheSize();

        const currentStage =
            this.chest.getStage();

        const locationsCount =
            this.chest.getLocationCount();

        const priorityStages = [
            currentStage + 1,
            currentStage + 2
        ].filter(
            stage =>
                stage >= 0 &&
                stage < locationsCount
        );

        console.log(
            "[LOCATIONS PRELOAD] Priority:",
            priorityStages.map(
                stage => stage + 1
            )
        );

        await Promise.all(
            priorityStages.map(
                stage =>
                    this.ensureLocationImage(
                        stage
                    )
            )
        );

        console.log(
            "[LOCATIONS PRELOAD] Priority finished"
        );

        if(!this.backgroundPreloadPromise) {

            this.backgroundPreloadPromise =
                this.preloadRemainingLocationImages();
        }
    }


    private async preloadRemainingLocationImages():
        Promise<void> {

        this.ensureLocationCacheSize();

        console.log(
            "[LOCATIONS PRELOAD] Background starting"
        );

        const locationsCount =
            this.chest.getLocationCount();

        const tasks: Promise<SpriteFrame | null>[] = [];

        for(
            let stage = 0;
            stage < locationsCount;
            stage++
        ) {
            tasks.push(
                this.ensureLocationImage(
                    stage
                )
            );
        }

        await Promise.all(tasks);

        console.log(
            "[LOCATIONS PRELOAD] Background finished"
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
    }UILocationsFrame

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
