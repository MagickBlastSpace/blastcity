import { _decorator, assetManager, AssetManager, Button, instantiate, macro, Node, Prefab, Sprite, SpriteFrame, UITransform, Vec3, view, Widget } from 'cc';
import { ChestRewardData } from '../../data/ChestData';
import { SaveData } from '../../data/SaveData';
import { UserData } from '../../data/UserData';
import { Chest } from '../../game/Chest';
import { Clans } from '../../game/Clans';
import { Net } from '../../net/Net';
import { AdsTimer } from '../../utils/AdsTimer';
import { AudioController } from '../../utils/AudioController';
import { ResolutionManager } from '../../utils/ResolutionManager';
import { UICollectionFrameAdaptivity } from '../collection/adaptivity/UICollectionFrameAdaptivity';
import { UICollectionCard } from '../collection/UICollectionCard';
import { UICollectionCardRecievePopup } from '../collection/UICollectionCardRecievePopup';
import { UICollectionDuplicateExchange } from '../collection/UICollectionDuplicateExchange';
import { UICollectionFrame } from '../collection/UICollectionFrame';
import { UICollectionInfoPopup } from '../collection/UICollectionInfoPopup';
import { UILeaderboardFrame } from '../leaderboard/UILeaderboardFrame';
import { UIAssetsLoadingFrame } from '../loading/UIAssetsLoadingFrame';
import { UILocationsFrame } from '../locations/UILocationsFrame';
import { UILocationUnlockedPopup } from '../locations/UILocationUnlockedPopup';
import { UIProfilePopup } from '../profile/UIProfilePopup';
import { UIShopFrame } from '../shop/UIShopFrame';
import { UISettingsFrame } from '../start/UISettingsFrame';
import { UIEventTutorialPopup } from '../tutorial/UIEventTutorialPopup';
import { UIFrameBase } from '../UIFrameBase';
import { UIPopupReward } from '../UIPopupReward';
import { UIMainMenuButton } from './UIMainMenuButton';
import { UIMainMenuFrame } from './UIMainMenuFrame';

const { ccclass, property } = _decorator;

@ccclass('UIMainMenu')
export class UIMainMenu extends UIFrameBase {

    @property(Button)
    locationsBtn: Button = null;

    @property(Button)
    clanBtn: Button = null;

    @property(Button)
    playBtn: Button = null;

    @property(Button)
    tbdBtn: Button = null;

    @property(Button)
    tbd2Btn: Button = null;

    @property(Button)
    settingsBtn: Button = null;

    @property(Button)
    profileBtn: Button = null;

    @property(Sprite)
    background: Sprite = null;

    @property(Sprite)
    background_1: Sprite = null;

    @property(Node)
    leftSidePanel: Node = null;

    @property(Node)
    rightSidePanel: Node = null;

    @property(Sprite)
    chestPicture: Sprite = null;

    @property([UIMainMenuButton])
    buttonsUi: UIMainMenuButton[] = [];

    @property([UIMainMenuFrame])
    framesUi: UIMainMenuFrame[] = [];

    @property(Node)
    startFrame: Node = null;

    @property(Chest)
    chest: Chest = null;

    @property(UISettingsFrame)
    settingsFrame: UISettingsFrame = null;

    @property(AdsTimer)
    adsTimer: AdsTimer = null;

    @property(UIPopupReward)
    rewardPopup: UIPopupReward;

    @property(UIProfilePopup)
    profilePopup: UIProfilePopup;

    @property(UIAssetsLoadingFrame)
    assetsLoadingFrame: UIAssetsLoadingFrame;

    @property(Node)
    resourcesNode: Node = null;

    @property(UICollectionCardRecievePopup)
    recievePopup: UICollectionCardRecievePopup;

    @property(Clans)
    clans: Clans = null;

    @property(UILeaderboardFrame)
    leaderboardFrame: UILeaderboardFrame = null;

    @property(UIShopFrame)
    shopFrame: UIShopFrame = null;

    @property(UILocationsFrame)
    locationsFrame: UILocationsFrame = null;

    @property(UILocationUnlockedPopup)
    locationUnlockedPopup: UILocationUnlockedPopup = null;

    @property(SpriteFrame)
    royalLeaguePopupImage: SpriteFrame = null;

    private collectionFramePromise: Promise<UIMainMenuFrame> = null;

    private collectionOpenRequestId: number = 0;

    private boundOnBackgroundResize: (() => void) | null = null;

    private bigGraphicsBundlePromise: Promise<AssetManager.Bundle> | null = null;
    private loadedBackgroundLocation: number = -1;

    private backgroundLoadPromise: Promise<void> | null = null;
    private backgroundLoadLocation: number = -1;

    private backgroundPreloadPromise: Promise<void> | null = null;
    private preloadedNextBackgroundLocation: number = -1;

    private artPreviewMenuInitialized = false;

    // Скрываем сундук чисто визуально
    private hideChestVisual() {
        if(this.chestPicture) {
            this.chestPicture.enabled = false;
        }
    }

    private getLocationNumber(index: number): string {
        return index < 10
            ? `0${index}`
            : `${index}`;
    }

    private getBackgroundArea(sprite: Sprite): {
        width: number;
        height: number;
        centerX: number;
    } {
        const visibleSize = view.getVisibleSize();

        const fullScreen = {
            width: visibleSize.width,
            height: visibleSize.height,
            centerX: 0
        };

        if(
            !this.leftSidePanel ||
            !this.rightSidePanel ||
            !this.leftSidePanel.activeInHierarchy ||
            !this.rightSidePanel.activeInHierarchy
        ) {
            return fullScreen;
        }

        const leftTransform = this.leftSidePanel.getComponent(UITransform);

        const rightTransform = this.rightSidePanel.getComponent(UITransform);

        const parentTransform = sprite.node.parent?.getComponent(UITransform);

        if(!leftTransform || !rightTransform || !parentTransform) {
            return fullScreen;
        }

        const leftEdgeWorld =
            leftTransform.convertToWorldSpaceAR(
                new Vec3(
                    leftTransform.width *
                    (1 - leftTransform.anchorX),
                    0,
                    0
                )
            );

        const rightEdgeWorld =
            rightTransform.convertToWorldSpaceAR(
                new Vec3(
                    -rightTransform.width *
                    rightTransform.anchorX,
                    0,
                    0
                )
            );


        const leftEdgeLocal = parentTransform.convertToNodeSpaceAR( leftEdgeWorld );

        const rightEdgeLocal =  parentTransform.convertToNodeSpaceAR( rightEdgeWorld );

        const width = rightEdgeLocal.x - leftEdgeLocal.x;

        if(width <= 0) {
            return fullScreen;
        }

        return {
            width,
            height: visibleSize.height,

            centerX:
                (
                    leftEdgeLocal.x +
                    rightEdgeLocal.x
                ) / 2
        };
    }

    private fitBackgroundCover(sprite: Sprite) {
        if(!sprite || !sprite.node || !sprite.node.isValid ||!sprite.spriteFrame ) {
            return;
        }

        const transform = sprite.node.getComponent( UITransform );

        if(!transform) {
            console.warn(
                `[BACKGROUND] UITransform not found: ${sprite.node.name}`
            );

            return;
        }

        const sourceSize = sprite.spriteFrame.originalSize;

        const area = this.getBackgroundArea(sprite);

        if( sourceSize.width <= 0 || sourceSize.height <= 0 || area.width <= 0 || area.height <= 0 ) {
            return;
        }

        const coverScale =
            Math.max(
                area.width /
                sourceSize.width,

                area.height /
                sourceSize.height
            );

        const resultWidth = sourceSize.width * coverScale;

        const resultHeight = sourceSize.height *  coverScale;

        sprite.sizeMode = Sprite.SizeMode.CUSTOM;

        sprite.node.setScale(
            1,
            1,
            1
        );

        transform.setContentSize( resultWidth, resultHeight );

        sprite.node.setPosition( area.centerX, 0, sprite.node.position.z );

        console.log(
            `[BACKGROUND COVER] ${sprite.node.name}` +
            ` | source=${sourceSize.width}x${sourceSize.height}` +
            ` | area=${area.width.toFixed(0)}x${area.height.toFixed(0)}` +
            ` | centerX=${area.centerX.toFixed(0)}` +
            ` | result=${resultWidth.toFixed(0)}x${resultHeight.toFixed(0)}`
        );
    }

    private refreshBackgroundLayout() {
        this.fitBackgroundCover(this.background);
        this.fitBackgroundCover(this.background_1);
    }

    private scheduleBackgroundLayoutRefresh() {
        this.scheduleOnce(
            () => {
                this.refreshBackgroundLayout();
            },
            0
        );
    }

    private connectCollectionPopups(collectionNode: Node, popupsNode: Node) {
        const collectionUi = collectionNode.getComponent(UICollectionFrame);
        const adaptivity = collectionNode.getComponent(UICollectionFrameAdaptivity);

        if (!collectionUi) {
            throw new Error("UICollectionFrame component not found on CollectionFrame");
        }
        if (!adaptivity) {
            throw new Error("UICollectionFrameAdaptivity component not found on CollectionFrame");
        }

        const collectionPopup = popupsNode.getChildByName("CollectionPopup");
        const sendCard = popupsNode.getChildByName("SendCard");
        const duplicateExchangePopup = popupsNode.getChildByName("DuplicateExchangePopup");
        const info = popupsNode.getChildByName("Info");
        const info2 = popupsNode.getChildByName("Info2");
        const badgeInfo1 = popupsNode.getChildByName("BadgeInfo1");
        const badgeInfo2 = popupsNode.getChildByName("BadgeInfo2");

        if (
            !collectionPopup ||
            !sendCard ||
            !duplicateExchangePopup ||
            !info ||
            !info2 ||
            !badgeInfo1 ||
            !badgeInfo2
        ) {
            throw new Error("CollectionFramePopups structure is incomplete");
        }

        adaptivity.popups = [collectionPopup, sendCard, duplicateExchangePopup, info, info2, badgeInfo1, badgeInfo2,];
        const collectionInfoPopup = collectionPopup.getComponent(UICollectionInfoPopup);
        const duplicateExchange = duplicateExchangePopup.getComponent(UICollectionDuplicateExchange);
        const infoPopup1 = info.getComponent(UIEventTutorialPopup);
        const infoPopup2 = info2.getComponent(UIEventTutorialPopup);
        const badgeInfoPopup1 = badgeInfo1.getComponent(UIEventTutorialPopup);
        const badgeInfoPopup2 = badgeInfo2.getComponent(UIEventTutorialPopup);

        if (!collectionInfoPopup) {
            throw new Error("UICollectionInfoPopup component not found on CollectionPopup");
        }
        if (!duplicateExchange) {
            throw new Error("UICollectionDuplicateExchange component not found on DuplicateExchangePopup");
        }
        if (!infoPopup1 || !infoPopup2) {
            throw new Error("UIEventTutorialPopup component not found on Collection info popups");
        }
        if (!badgeInfoPopup1 || !badgeInfoPopup2) {
            throw new Error("UIEventTutorialPopup component not found on Collection badge info popups");
        }

        const collectionCards = collectionPopup.getComponentsInChildren(UICollectionCard);
        if (collectionCards.length !== 9) {
            throw new Error(`Expected 9 UICollectionCard components in CollectionPopup, found ${collectionCards.length}`);
        }

        collectionInfoPopup.cards = collectionCards;
        collectionUi.collectionInfoPopup = collectionInfoPopup;
        collectionUi.duplicateExchange = duplicateExchange;
        collectionUi.infoPopups = [infoPopup1, infoPopup2,];
        collectionUi.badgeInfoPopups = [badgeInfoPopup1, badgeInfoPopup2,];
    }

    private getBigGraphicsBundle(): Promise<AssetManager.Bundle> {
        if (this.bigGraphicsBundlePromise) {
            return this.bigGraphicsBundlePromise;
        }

        this.bigGraphicsBundlePromise = new Promise((resolve, reject) => {
            assetManager.loadBundle("big_graphics", (err, bundle) => {
                if (err) {
                    this.bigGraphicsBundlePromise = null;
                    reject(err);
                    return;
                }

                console.log("[BACKGROUND] big_graphics bundle ready");

                resolve(bundle);
            });
        });

        return this.bigGraphicsBundlePromise;
    }


    private loadBackgroundSprite(
        bundle: AssetManager.Bundle,
        path: string
    ): Promise<SpriteFrame> {
        return new Promise((resolve, reject) => {
            bundle.load(
                path,
                SpriteFrame,
                (err, spriteFrame) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(spriteFrame);
                }
            );
        });
    }


    private async loadBackgroundWithFallback(
        bundle: AssetManager.Bundle,
        path: string,
        legacyPath: string,
        name: string
    ): Promise<SpriteFrame> {
        try {
            return await this.loadBackgroundSprite(bundle, path);
        }
        catch (error) {
            console.warn(
                `[BACKGROUND] ${name} not found: ${path}. Using ${legacyPath}`,
                error
            );

            return await this.loadBackgroundSprite(
                bundle,
                legacyPath
            );
        }
    }

    private preloadBackgroundAsset(
        bundle: AssetManager.Bundle,
        path: string
    ): Promise<boolean> {

        return new Promise((resolve) => {

            bundle.preload(
                path,
                SpriteFrame,
                (error) => {

                    if(error) {

                        console.warn(
                            `[BACKGROUND PRELOAD] Failed: ${path}`,
                            error
                        );

                        resolve(false);
                        return;
                    }

                    console.log(
                        `[BACKGROUND PRELOAD] Ready: ${path}`
                    );

                    resolve(true);
                }
            );
        });
    }

    private preloadNextBackgroundPair(): Promise<void> {

        const nextLocationIndex =
            this.chest.getStage() + 2;

        const locationsCount =
            this.chest.getLocationCount();

        if(nextLocationIndex > locationsCount) {
            return Promise.resolve();
        }

        if(
            this.preloadedNextBackgroundLocation ===
            nextLocationIndex
        ) {
            return Promise.resolve();
        }

        if(this.backgroundPreloadPromise) {
            return this.backgroundPreloadPromise;
        }

        const preloadPromise =
            (async () => {

                try {

                    const bundle =
                        await this.getBigGraphicsBundle();

                    const locationToPreload =
                        this.chest.getStage() + 2;

                    const currentLocationsCount =
                        this.chest.getLocationCount();

                    if(
                        locationToPreload >
                        currentLocationsCount
                    ) {
                        return;
                    }

                    if(
                        this.preloadedNextBackgroundLocation ===
                        locationToPreload
                    ) {
                        return;
                    }

                    const preloadSucceeded =
                        await this.preloadBackgroundPair(
                            bundle,
                            locationToPreload
                        );

                    if(preloadSucceeded) {

                        this.preloadedNextBackgroundLocation =
                            locationToPreload;

                        console.log(
                            `[BACKGROUND PRELOAD] Next pair ready: ${locationToPreload}`
                        );
                    }
                }
                catch(error) {

                    console.warn(
                        "[BACKGROUND PRELOAD] Next pair failed",
                        error
                    );
                }
                finally {

                    if(
                        this.backgroundPreloadPromise ===
                        preloadPromise
                    ) {
                        this.backgroundPreloadPromise =
                            null;
                    }

                    const desiredNext =
                        this.chest.getStage() + 2;

                    if(
                        desiredNext <=
                            this.chest.getLocationCount() &&
                        desiredNext !==
                            this.preloadedNextBackgroundLocation
                    ) {
                        void this.preloadNextBackgroundPair();
                    }
                }
            })();

        this.backgroundPreloadPromise =
            preloadPromise;

        return preloadPromise;
    }

    private async preloadBackgroundPair(
        bundle: AssetManager.Bundle,
        locationIndex: number
    ): Promise<boolean> {

        console.log(
            `[BACKGROUND PRELOAD] Pair ${locationIndex} started`
        );

        if(locationIndex <= 7) {

            const number =
                this.getLocationNumber(
                    locationIndex
                );

            const menuPath = `redesign/location_${number}_menu/spriteFrame`;

            const gameplayPath = `redesign/location_${number}_gameplay/spriteFrame`;

            const menuReady =
                await this.preloadBackgroundAsset(
                    bundle,
                    menuPath
                );

            if(!menuReady) {
                return false;
            }

            const gameplayReady =
                await this.preloadBackgroundAsset(
                    bundle,
                    gameplayPath
                );

            if(!gameplayReady) {
                return false;
            }
        }
        else {

            const legacyReady =
                await this.preloadBackgroundAsset(
                    bundle,
                    `back${locationIndex}/spriteFrame`
                );

            if(!legacyReady) {
                return false;
            }
        }

        console.log(
            `[BACKGROUND PRELOAD] Pair ${locationIndex} finished`
        );

        return true;
    }

    private preloadCollectionCovers(): Promise<void> {
        return new Promise((resolve) => {
            const controller = UserData.instance?.collections;
            if(!controller) {
                console.error("[COLLECTION] Cannot preload covers: controller is not ready");
                resolve();
                return;
            }

            const collections = controller.getCollections();
            const seasonPrefix = controller.getSeasonPrefix();

            if(!collections || collections.length === 0) {
                resolve();
                return;
            }

            const paths = collections.map(
                collection =>
                    seasonPrefix + collection.id + "/spriteFrame"
            );

            assetManager.loadBundle("covers", (bundleErr, bundle) => {
                if(bundleErr) {
                    console.error("Failed to preload bundle: covers", bundleErr);
                    resolve();
                    return;
                }

                bundle.load(
                    paths,
                    SpriteFrame,
                    (loadErr) => {
                        if(loadErr) {
                            console.error("Failed to preload collection covers", loadErr);
                        }
                        resolve();
                    }
                );
            });
        });
    }

    private async checkLocationUnlockedPopup() {

        if(
            !this.chest ||
            !this.locationsFrame ||
            !this.locationUnlockedPopup
        ) {
            console.warn(
                "[LOCATION UNLOCK] Missing references",
                {
                    chest: !!this.chest,
                    locationsFrame: !!this.locationsFrame,
                    popup: !!this.locationUnlockedPopup
                }
            );

            return;
        }

        this.chest.updateStageData(true);

        const currentStage =
            this.chest.getStage();

        const isComplete =
            this.chest.isStageComplete();

        console.log(
            "[LOCATION UNLOCK] Check",
            {
                progress:
                    UserData.instance.getProgress(),

                currentStage:
                    currentStage,

                chapter:
                    currentStage + 1,

                endLevel:
                    this.chest.getLocationEndLevel(
                        currentStage
                    ),

                isComplete:
                    isComplete,

                pickedRewards:
                    this.chest.getPickedRewards()
            }
        );

        if(!isComplete) {
            return;
        }

        if(this.locationUnlockedPopup.node.active) {
            return;
        }

        const nextStage = currentStage + 1;

        const locationsCount = this.chest.getLocationCount();

        if(nextStage >= locationsCount) {
            if(!this.royalLeaguePopupImage) {
                console.warn(
                    "[LOCATION UNLOCK] " +
                    "Royal League image is missing"
                );

                return;
            }

            this.locationUnlockedPopup.init(
                this.royalLeaguePopupImage,
                "locations.royalLeagueUnlocked"
            );

            this.locationUnlockedPopup.show();

            console.log(
                "[LOCATION UNLOCK] " +
                "Royal League popup shown"
            );

            return;
        }

        console.log(
            "[LOCATION UNLOCK] Loading image for stage",
            nextStage
        );

       const spriteFrame =
            await this.locationsFrame
                .getLocationSpriteFrame(
                    nextStage
                );

        if(!spriteFrame) {
            console.warn(
                `[LOCATION UNLOCK] Image not found ` +
                `for stage ${nextStage}`
            );

            return;
        }

        this.locationUnlockedPopup.init(
            spriteFrame,
            "locations.unlocked"
        );

        this.locationUnlockedPopup.show();
    }

    private ensureCollectionFrame(): Promise<UIMainMenuFrame> {
        if(this.framesUi[4]) {
            return Promise.resolve(this.framesUi[4]);
        }
        if(this.collectionFramePromise) {
            return this.collectionFramePromise;
        }

        console.log(`[PRELOAD +${performance.now().toFixed(0)}ms] Collection preload started`);

        this.collectionFramePromise = new Promise((resolve, reject) => {
            const popupsNode = this.node.getChildByName("CollectionFramePopups");
            if(!popupsNode) {
                this.collectionFramePromise = null;
                reject(new Error("Existing CollectionFramePopups node not found in MainFrame"));
                return;
            }

            assetManager.loadBundle("collection_ui", (bundleErr, bundle) => {
                if(bundleErr) {
                    console.error("Failed to load bundle: collection_ui", bundleErr);
                    this.collectionFramePromise = null;
                    reject(bundleErr);
                    return;
                }

                bundle.load(
                    "CollectionFrame",
                    Prefab,
                    (collectionErr, collectionPrefab) => {
                        if(collectionErr) {
                            console.error("Failed to load CollectionFrame", collectionErr);
                            this.collectionFramePromise = null;
                            reject(collectionErr);
                            return;
                        }

                        const collectionNode = instantiate(collectionPrefab);
                        collectionNode.active = false;
                        this.node.addChild(collectionNode);

                        const landscapeItems =
                            this.node.getChildByName("LandscapeItems");
                        if(landscapeItems) {
                            collectionNode.setSiblingIndex(landscapeItems.getSiblingIndex());
                        }

                        const mainBtnsFrame =
                           this.node.getChildByName("MainBtnsFrame");
                        if(mainBtnsFrame) {
                            mainBtnsFrame.setSiblingIndex(collectionNode.getSiblingIndex() + 1);
                        }

                        const mainMenuButtonsPanel =
                            this.node.getChildByName("MainMenuButtonsPanel");

                        if(mainMenuButtonsPanel) {
                            const navbarIndex = mainBtnsFrame
                                ? mainBtnsFrame.getSiblingIndex() + 1
                                : collectionNode.getSiblingIndex() + 1;
                            mainMenuButtonsPanel.setSiblingIndex(navbarIndex);
                            popupsNode.setSiblingIndex(mainMenuButtonsPanel.getSiblingIndex() + 1);
                        }
                        else {
                            console.error("[COLLECTION] MainMenuButtonsPanel not found");
                        }

                        const collectionWidget =
                            collectionNode.getComponent(Widget);
                        if(collectionWidget) {
                            collectionWidget.target = this.node;
                            collectionWidget.isAlignLeft = true;
                            collectionWidget.isAlignRight = true;
                            collectionWidget.isAlignTop = true;
                            collectionWidget.isAlignBottom = true;
                            collectionWidget.isAlignVerticalCenter = false;
                            collectionWidget.left = 0;
                            collectionWidget.right = 0;
                            collectionWidget.top = 0;
                            collectionWidget.bottom = 0;
                            collectionWidget.updateAlignment();
                        }

                        const fail = (error: Error) => {
                            console.error(error);
                            collectionNode.destroy();
                            this.collectionFramePromise = null;
                            reject(error);
                        };

                        const collectionUi =
                            collectionNode.getComponent(UICollectionFrame);
                        if(!collectionUi) {
                            fail(new Error("UICollectionFrame component not found on CollectionFrame"));
                            return;
                        }
                        if(
                            !UserData.instance ||
                            !UserData.instance.collections
                        ) {
                            fail(new Error("CollectionEvent controller is not ready"));
                            return;
                        }

                        const collectionFrame =
                            collectionNode.getComponent(UIMainMenuFrame);
                        if(!collectionFrame) {
                            fail(new Error("UIMainMenuFrame component not found on CollectionFrame"));
                            return;
                        }
                        try {
                            this.connectCollectionPopups(collectionNode, popupsNode);
                        }
                        catch(error) {
                            fail(error instanceof Error ? error : new Error("Failed to connect CollectionFramePopups"));
                            return;
                        }

                        collectionUi.eventController =
                            UserData.instance.collections;
                        if(ResolutionManager.instance) {
                            ResolutionManager.instance.addAdaptiveFrame(collectionNode);
                        }

                        this.preloadCollectionCovers()
                            .then(() => {
                                this.framesUi[4] = collectionFrame;
                                console.log(`[PRELOAD +${performance.now().toFixed(0)}ms] Collection preload finished`);
                                resolve(collectionFrame);
                            });
                    }
                );
            });
        });
        return this.collectionFramePromise;
    }

    private async initializeArtPreviewMenu(): Promise<void> {

        if (this.artPreviewMenuInitialized) {
            return;
        }

        this.artPreviewMenuInitialized = true;

        try {
            console.log(
                "[Art Preview] Initializing menu after Chest refresh"
            );

            console.log(
                "[Art Preview] progress:",
                UserData.instance.getProgress()
            );

            console.log(
                "[Art Preview] chest stage:",
                this.chest.getStage()
            );

            await this.updateBackgroundGraphics();

            console.log(
                "[Art Preview] Initial background ready"
            );

            void this.preloadNextBackgroundPair();

            AudioController.instance.playMainMenuSoundtrack();
            AudioController.instance.loadSoundsAssets();

            this.preloadShopInBackground();
            this.preloadCollectionInBackground();

            console.log(
                "[Art Preview] Menu initialization finished"
            );
        }
        catch (error) {
            console.error(
                "[Art Preview] Menu initialization failed",
                error
            );
        }
        finally {
            console.log(
                "[Art Preview] Hiding assets loading frame"
            );

            this.assetsLoadingFrame.hide();
        }
    }

    onLoad() {
        macro.ENABLE_MULTI_TOUCH = false;

        if(this.background) this.background.enabled = false;
        if(this.background_1) this.background_1.enabled = false;

        this.boundOnBackgroundResize = () => {
            if(!this.node || !this.node.isValid) return;
            this.scheduleBackgroundLayoutRefresh();
        };

        if(typeof window !== "undefined") {
            window.addEventListener("resize", this.boundOnBackgroundResize);
        }
    }

    onDestroy() {
        if(this.locationUnlockedPopup) {
            this.locationUnlockedPopup.node.off(
                'continue',
                this.onLocationUnlockedContinue,
                this
            );
        }

        if(this.boundOnBackgroundResize && typeof window !== "undefined") {
            window.removeEventListener("resize", this.boundOnBackgroundResize);
        }

        this.boundOnBackgroundResize = null;
    }

    start() {
        if(this.locationUnlockedPopup) {
            this.locationUnlockedPopup.node.on(
                'continue',
                this.onLocationUnlockedContinue,
                this
            );
        }

        this.assetsLoadingFrame.show();
        this.hideChestVisual();

        void this.getBigGraphicsBundle()
        .catch((error) => {
            console.error(
                "[BACKGROUND] Failed to preload big_graphics",
                error
            );
        });

        const isArtPreview = (globalThis as any).gamepush?.__artPreview === true;
        if (isArtPreview) {
            console.log(
                "[Art Preview] Waiting for Chest data"
            );

            this.chest.node.once(
                "refresh",
                () => {
                    console.log(
                        "[Art Preview] Chest data ready"
                    );

                    void this.initializeArtPreviewMenu();
                }
            );

            this.scheduleOnce(
                () => {
                    if (this.artPreviewMenuInitialized) {
                        return;
                    }

                    console.warn(
                        "[Art Preview] Chest refresh timeout. " +
                        "Starting menu with current Chest state."
                    );

                    void this.initializeArtPreviewMenu();
                },
                8
            );
        }

       SaveData.instance.node.on(
            "level_progress_loaded",
            () => {

                if (isArtPreview) {
                    console.log(
                        "[Art Preview] level_progress_loaded ignored"
                    );

                    return;
                }

                void this.playWhenBackgroundReady();
            }
        );
        UserData.instance.node.on(
            "premium_purchase",
            () => this.showPremiumPurchase()
        );

        SaveData.instance.node.on(
            "level_progress_checked",
            () => {

                if (isArtPreview) {
                    return;
                }

                void (async () => {

                    console.log(
                        `[STARTUP +${performance.now().toFixed(0)}ms] Level progress checked`
                    );

                   const progress = UserData.instance.getProgress();

                    console.log(
                        "[ART PREVIEW DEBUG] progress:",
                        progress
                    );

                    try {
                        console.log(
                            "[BACKGROUND] Initial background loading started"
                        );

                        await this.updateBackgroundGraphics();

                        console.log(
                            "[BACKGROUND] Initial background loading finished"
                        );
                    }
                    catch (error) {
                        console.error(
                            "[BACKGROUND] Initial background loading failed",
                            error
                        );

                        return;
                    }

                    void this.preloadNextBackgroundPair();

                    if (progress <= 0) {
                        return;
                    }

                    this.assetsLoadingFrame.hide();

                    AudioController.instance.playMainMenuSoundtrack();
                    AudioController.instance.loadSoundsAssets();

                    this.preloadLocationsInBackground();

                    this.preloadShopInBackground();
                    this.preloadCollectionInBackground();
                    this.preloadLeaderboardInBackground();

                    this.scheduleOnce(() => {void this.checkLocationUnlockedPopup();}, 0);

                    this.scheduleOnce(() => {
                        void (async () => {
                            try {
                                if(!this.clans.isDataLoaded()) {
                                    console.log(
                                        "[CLANS] Background preload started"
                                    );

                                    await this.clans.refresh();
                                }

                                if(!this.clans.isDataLoaded()) {
                                    console.warn(
                                        "[LEADERBOARD CLANS] Clan data is still not ready"
                                    );

                                    return;
                                }

                                if(!this.leaderboardFrame) {
                                    console.warn(
                                        "[LEADERBOARD CLANS] leaderboardFrame is not assigned"
                                    );

                                    return;
                                }

                                await this.leaderboardFrame.preloadClans();

                                console.log(
                                    "[LEADERBOARD CLANS] fully ready"
                                );
                            }
                            catch(error) {
                                console.error(
                                    "[LEADERBOARD CLANS] preload failed",
                                    error
                                );
                            }
                        })();

                    }, 1.0);

                })();
            }
        );

        this.startFrame.on("play", () => void this.playWhenBackgroundReady());

        this.startFrame.on("assets_ready", () => {
            AudioController.instance.loadSoundsAssets();
        });

        this.chest.node.on("complete", () => {
          void this.updateBackgroundGraphics()
            .then(() => {

                void this.preloadNextBackgroundPair();

            })
            .catch((error) => {

                console.error(
                    "[BACKGROUND] Failed to change location",
                    error
                );

            });
        });
        this.chest.node.on("reward", (data) => this.showChestReward(data));

        this.resourcesNode.on("shop", () => this.onBtnShopClick());

        SaveData.instance.loadStartBonusesData();
        SaveData.instance.loadButlersGiftData();

        this.locationsBtn.node.on(Button.EventType.CLICK, this.onBtnLocationsClick, this);
        this.clanBtn.node.on(Button.EventType.CLICK, this.onBtnClanClick, this);
        this.playBtn.node.on(Button.EventType.CLICK, this.onBtnPlayClick, this);
        this.tbdBtn.node.on(Button.EventType.CLICK, this.onBtnTbdClick, this);
        this.tbd2Btn.node.on(Button.EventType.CLICK, this.onBtnTbd2Click, this);
        this.settingsBtn.node.on(Button.EventType.CLICK, this.onSettingsBtnClick, this);
        this.profileBtn.node.on(Button.EventType.CLICK, this.onProfileBtnClick, this);

        this.recievePopup.node.on("check", (id) => {
            this.removeRecievedCard(id);
            this.checkRecievedCards();
        });

        this.setAllBtnsPassive();

        this.onBtnPlayClick();

        this.updateButtonsAdaptivity();

        this.scheduleOnce(() => {
            const clanId = this.clans.getClanId();
            if (clanId > 0) {
                Net.instance.fetchMembersOfChannel(clanId);
            }
        }, 5);
    }

   show() {
        super.show();
        this.hideChestVisual();
        this.scheduleBackgroundLayoutRefresh();
        this.onBtnPlayClick();
        this.adsTimer.startMenuTimer();

        AudioController.instance
            .playMainMenuSoundtrack();

        this.scheduleOnce(() => {
            void this.checkLocationUnlockedPopup();
        }, 0);
    }

    play() {
        console.log("play event handle");
        this.hide();
        this.adsTimer.startGameplayTimer();
    }

    private onLocationUnlockedContinue() {

        if(!this.chest) {
            return;
        }

        if(!this.chest.isStageComplete()) {
            return;
        }

        this.chest.completeStage();
    }

    private async playWhenBackgroundReady() {
        try {
            console.log(
                "[BACKGROUND] Waiting for background before gameplay"
            );

            await this.updateBackgroundGraphics();

            console.log(
                "[BACKGROUND] Background ready, opening gameplay"
            );

            this.play();
        }
        catch (error) {
            console.error(
                "[BACKGROUND] Cannot open gameplay: background failed to load",
                error
            );
        }
    }

    private preloadLeaderboardInBackground() {
        if(!this.leaderboardFrame) {
            console.error("[LEADERBOARD PRELOAD] leaderboardFrame is not assigned");
            return;
        }

        console.log("[LEADERBOARD PRELOAD] scheduled");

        this.scheduleOnce(() => {
            console.log("[LEADERBOARD PRELOAD] starting");

            void (async () => {
                try {
                    await this.leaderboardFrame.preloadWeekly();

                    console.log("[LEADERBOARD PRELOAD] weekly ready");

                    await this.leaderboardFrame.preloadPlayers();

                    console.log("[LEADERBOARD PRELOAD] players ready");

                    await this.leaderboardFrame.preloadFriends();

                    console.log("[LEADERBOARD PRELOAD] friends + requests ready");
                    console.log("[LEADERBOARD PRELOAD] fully ready");
                }
                catch(error) {
                    console.error("[LEADERBOARD PRELOAD] failed", error);
                }
            })();
        }, 0.5);
    }

    private preloadLocationsInBackground() {

        if(!this.locationsFrame) {
            console.warn(
                "[LOCATIONS PRELOAD] Locations frame is not assigned"
            );
            return;
        }

        console.log("[LOCATIONS PRELOAD] starting");

        void this.locationsFrame
            .prepareInBackground()
            .then(() => {
                console.log(
                    "[LOCATIONS PRELOAD] fully ready"
                );
            })
            .catch((error) => {
                console.error(
                    "[LOCATIONS PRELOAD] failed",
                    error
                );
            });
    }

    private preloadShopInBackground() {
        this.scheduleOnce(() => {
            if(!this.shopFrame) {
                console.warn("[SHOP PRELOAD] Shop frame is not assigned");
                return;
            }

            console.log("[SHOP PRELOAD] starting");

            void this.shopFrame.preloadAssets();
        }, 0);
    }

    private preloadCollectionInBackground() {
        this.scheduleOnce(() => {
            console.log("[COLLECTION PRELOAD] starting");

            void this.ensureCollectionFrame()
                .then(() => {
                    console.log("[COLLECTION PRELOAD] fully ready");
                })
                .catch((error) => {
                    console.error("[COLLECTION PRELOAD] failed", error);
                });
        }, 0.1);
    }

    onBtnShopClick() {
        this.collectionOpenRequestId++;

        this.setAllBtnsPassive();
        this.hideAllFrames();

        this.shopFrame.show();

        this.updateButtonsAdaptivity();
        this.checkRecievedCards();
    }

    onBtnLocationsClick() {
        this.collectionOpenRequestId++;

        this.setAllBtnsPassive();
        this.hideAllFrames();

        this.buttonsUi[0].setActiveIcon(true);

        if(this.locationsFrame) {
            this.locationsFrame.show();
        }

        this.updateButtonsAdaptivity();
        this.checkRecievedCards();
    }

    onBtnClanClick() {
        this.onMainMenuBtnClick(1);
    }

    onBtnPlayClick() {
        this.onMainMenuBtnClick(2);
    }

    onBtnTbdClick() {
        this.onMainMenuBtnClick(3);
    }

    async onBtnTbd2Click() {
        const requestId = ++this.collectionOpenRequestId;
        try {
            await this.ensureCollectionFrame();

            if(requestId !== this.collectionOpenRequestId) {
                return;
            }
            this.onMainMenuBtnClick(4);
        }
        catch(error) {
            console.error("Failed to open CollectionFrame", error);
        }
    }

    onMainMenuBtnClick(index: number) {
        if(index !== 4) {
            this.collectionOpenRequestId++;
        }

        this.setAllBtnsPassive();
        this.hideAllFrames();

        this.buttonsUi[index].setActiveIcon(true);
        this.framesUi[index].show();

        this.updateButtonsAdaptivity();
        this.checkRecievedCards();
    }

    onSettingsBtnClick() {
        this.settingsFrame.show();
    }

    onProfileBtnClick() {
        this.profilePopup.init(UserData.instance.getPlayerId());
        this.profilePopup.show();
    }

    setAllBtnsPassive() {
        for(let i = 0; i < this.buttonsUi.length; i++) {
            this.buttonsUi[i].setActiveIcon(false);
        }
    }

    hideAllFrames() {
        for(let i = 0; i < this.framesUi.length; i++) {
            if(this.framesUi[i]) {
                this.framesUi[i].hide();
            }
        }

        if(this.locationsFrame) {
            this.locationsFrame.hide();
        }

        if(this.shopFrame) {
            this.shopFrame.hide();
        }
    }

    private async loadCurrentBackgroundPair(
        locationIndex: number
    ): Promise<void> {

        const bundle =
            await this.getBigGraphicsBundle();

        const legacyPath =
            `back${locationIndex}/spriteFrame`;

        if(locationIndex <= 7) {

            const locationNumber =
                this.getLocationNumber(
                    locationIndex
                );

            const menuPath = `redesign/location_${locationNumber}_menu/spriteFrame`;

            const gameplayPath = `redesign/location_${locationNumber}_gameplay/spriteFrame`;

            const menuSpriteFrame =
                await this.loadBackgroundWithFallback(
                    bundle,
                    menuPath,
                    legacyPath,
                    "menu"
                );

            if(
                this.chest.getStage() + 1 !==
                locationIndex
            ) {
                return;
            }

            this.background_1.spriteFrame =
                menuSpriteFrame;

            this.background_1.enabled = true;

            this.fitBackgroundCover(
                this.background_1
            );

            console.log(
                `[BACKGROUND] Menu ready: location ${locationIndex}`
            );

            const gameplaySpriteFrame =
                await this.loadBackgroundWithFallback(
                    bundle,
                    gameplayPath,
                    legacyPath,
                    "gameplay"
                );

            if(
                this.chest.getStage() + 1 !==
                locationIndex
            ) {
                return;
            }

            this.background.spriteFrame =
                gameplaySpriteFrame;

            this.background.enabled = true;

            this.fitBackgroundCover(
                this.background
            );

            console.log(
                `[BACKGROUND] Gameplay ready: location ${locationIndex}`
            );
        }
        else {

            const legacySpriteFrame =
                await this.loadBackgroundSprite(
                    bundle,
                    legacyPath
                );

            if(
                this.chest.getStage() + 1 !==
                locationIndex
            ) {
                return;
            }

            this.background_1.spriteFrame =
                legacySpriteFrame;

            this.background.spriteFrame =
                legacySpriteFrame;

            this.background_1.enabled = true;
            this.background.enabled = true;
        }

        this.loadedBackgroundLocation =
            locationIndex;

        this.refreshBackgroundLayout();

        console.log(
            `[BACKGROUND] Current pair ready: location ${locationIndex}`
        );
    }

    async updateBackgroundGraphics(): Promise<void> {

        const locationIndex =
            this.chest.getStage() + 1;

        if(
            this.loadedBackgroundLocation === locationIndex &&
            this.background_1?.spriteFrame &&
            this.background?.spriteFrame
        ) {
            return;
        }

        if(this.backgroundLoadPromise) {

            if(
                this.backgroundLoadLocation ===
                locationIndex
            ) {
                await this.backgroundLoadPromise;
                return;
            }

            try {
                await this.backgroundLoadPromise;
            }
            catch {
            }

            return this.updateBackgroundGraphics();
        }

        this.backgroundLoadLocation =
            locationIndex;

        const loadPromise =
            this.loadCurrentBackgroundPair(
                locationIndex
            );

        this.backgroundLoadPromise =
            loadPromise;

        try {

            await loadPromise;

        }
        finally {

            if(
                this.backgroundLoadPromise === loadPromise
            ) {
                this.backgroundLoadPromise = null;
                this.backgroundLoadLocation = -1;
            }
        }
    }

    showPremiumPurchase() {
        this.rewardPopup.show();
        this.rewardPopup.init_Battlepass();
    }

    showChestReward(data: ChestRewardData) {
        this.rewardPopup.show();
        this.rewardPopup.init_Chest(data);
    }

    updateButtonsAdaptivity() {
        for(let i = 0; i < this.buttonsUi.length; i++) {
            this.buttonsUi[i].refreshAdaptivity();
        }
    }

    removeRecievedCard(id: string) {
        UserData.instance.removeRecievedCard(id);
    }

    checkRecievedCards() {
        let recievedCards = UserData.instance.getRecievedCards();

        if(recievedCards.length > 0) {
            this.recievePopup.hideClean();
            this.recievePopup.init(recievedCards[0].id, recievedCards[0].playerId);
            this.recievePopup.show();
        }
    }
}
