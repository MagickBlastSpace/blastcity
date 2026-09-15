import { _decorator,  Node, Button, assetManager, Sprite, SpriteFrame, macro, Prefab, instantiate, Widget} from 'cc';
import { UIMainMenuButton } from './UIMainMenuButton';
import { UIMainMenuFrame } from './UIMainMenuFrame';
import { UICollectionFrame } from '../collection/UICollectionFrame';
import { ResolutionManager } from '../../utils/ResolutionManager';
import { UIFrameBase } from '../UIFrameBase';
import { AdsTimer } from '../../utils/AdsTimer';
import { SaveData } from '../../data/SaveData';
import { Chest } from '../../game/Chest';
import { AudioController } from '../../utils/AudioController';
import { UISettingsFrame } from '../start/UISettingsFrame';
import { UserData } from '../../data/UserData';
import { UIPopupReward } from '../UIPopupReward';
import { UIProfilePopup } from '../profile/UIProfilePopup';
import { UIAssetsLoadingFrame } from '../loading/UIAssetsLoadingFrame';
import { ChestRewardData } from '../../data/ChestData';
import { UICollectionCardRecievePopup } from '../collection/UICollectionCardRecievePopup';
import { Net } from '../../net/Net';
import { Clans } from '../../game/Clans';
import { UICollectionFrameAdaptivity } from '../collection/adaptivity/UICollectionFrameAdaptivity';
import { UICollectionDuplicateExchange } from '../collection/UICollectionDuplicateExchange';
import { UIEventTutorialPopup } from '../tutorial/UIEventTutorialPopup';
import { UICollectionInfoPopup } from '../collection/UICollectionInfoPopup';
import { UICollectionCard } from '../collection/UICollectionCard';
import { UILeaderboardFrame } from '../leaderboard/UILeaderboardFrame';
const { ccclass, property } = _decorator;

@ccclass('UIMainMenu')
export class UIMainMenu extends UIFrameBase {

    @property(Button)
    shopBtn: Button = null;
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

    private collectionFramePromise: Promise<UIMainMenuFrame> = null;

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

        adaptivity.popups = [
            collectionPopup,
            sendCard,
            duplicateExchangePopup,
            info,
            info2,
            badgeInfo1,
            badgeInfo2,
        ];

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
            throw new Error(
                `Expected 9 UICollectionCard components in CollectionPopup, found ${collectionCards.length}`
            );
        }

        collectionInfoPopup.cards = collectionCards;

        collectionUi.collectionInfoPopup = collectionInfoPopup;
        collectionUi.duplicateExchange = duplicateExchange;

        collectionUi.infoPopups = [
            infoPopup1,
            infoPopup2,
        ];

        collectionUi.badgeInfoPopups = [
            badgeInfoPopup1,
            badgeInfoPopup2,
        ];
    }

    private preloadCollectionCovers(): Promise<void> {
        return new Promise((resolve) => {
            const controller = UserData.instance?.collections;

            if(!controller) {
                console.error(
                    "[COLLECTION] Cannot preload covers: controller is not ready"
                );
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
                    console.error(
                        "Failed to preload bundle: covers",
                        bundleErr
                    );
                    resolve();
                    return;
                }

                bundle.load(
                    paths,
                    SpriteFrame,
                    (loadErr) => {
                        if(loadErr) {
                            console.error(
                                "Failed to preload collection covers",
                                loadErr
                            );
                        }

                        resolve();
                    }
                );
            });
        });
    }

   private ensureCollectionFrame(): Promise<UIMainMenuFrame> {
        if(this.framesUi[4]) {
            return Promise.resolve(this.framesUi[4]);
        }

        if(this.collectionFramePromise) {
            return this.collectionFramePromise;
        }

        console.log(
            `[PRELOAD +${performance.now().toFixed(0)}ms] Collection preload started`
        );

        this.collectionFramePromise = new Promise((resolve, reject) => {
            const popupsNode = this.node.getChildByName("CollectionFramePopups");

            if(!popupsNode) {
                this.collectionFramePromise = null;
                reject(
                    new Error(
                        "Existing CollectionFramePopups node not found in MainFrame"
                    )
                );
                return;
            }

            assetManager.loadBundle("collection_ui", (bundleErr, bundle) => {
                if(bundleErr) {
                    console.error(
                        "Failed to load bundle: collection_ui",
                        bundleErr
                    );
                    this.collectionFramePromise = null;
                    reject(bundleErr);
                    return;
                }

                bundle.load(
                    "CollectionFrame",
                    Prefab,
                    (collectionErr, collectionPrefab) => {
                        if(collectionErr) {
                            console.error(
                                "Failed to load CollectionFrame",
                                collectionErr
                            );
                            this.collectionFramePromise = null;
                            reject(collectionErr);
                            return;
                        }

                        const collectionNode = instantiate(collectionPrefab);

                        collectionNode.active = false;

                        this.node.addChild(collectionNode);

                        /*
                        * Collection должна находиться под элементами,
                        * которые рисуются поверх основного контента.
                        */
                        const landscapeItems =
                            this.node.getChildByName("LandscapeItems");

                        if(landscapeItems) {
                            collectionNode.setSiblingIndex(
                                landscapeItems.getSiblingIndex()
                            );
                        }

                        /*
                        * Фон панели навигации
                        */

                        const mainBtnsFrame =
                           this.node.getChildByName("MainBtnsFrame");

                        if(mainBtnsFrame) {
                            mainBtnsFrame.setSiblingIndex(
                                collectionNode.getSiblingIndex() + 1
                            );
                        }

                        /*
                        * Нижняя навигация должна всегда рисоваться
                        * поверх динамически добавленной Collection.
                        */
                        const mainMenuButtonsPanel =
                            this.node.getChildByName("MainMenuButtonsPanel");

                        if(mainMenuButtonsPanel) {
                            const navbarIndex = mainBtnsFrame
                                ? mainBtnsFrame.getSiblingIndex() + 1
                                : collectionNode.getSiblingIndex() + 1;

                            mainMenuButtonsPanel.setSiblingIndex(navbarIndex);

                            popupsNode.setSiblingIndex(
                                mainMenuButtonsPanel.getSiblingIndex() + 1
                            );
                        }
                        else {
                            console.error(
                                "[COLLECTION] MainMenuButtonsPanel not found"
                            );
                        }

                        /*
                        * Collection занимает весь MainFrame.
                        * В том числе пространство под navbar:
                        * сам navbar рисуется поверх Collection.
                        */
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
                            fail(
                                new Error(
                                    "UICollectionFrame component not found on CollectionFrame"
                                )
                            );
                            return;
                        }

                        if(
                            !UserData.instance ||
                            !UserData.instance.collections
                        ) {
                            fail(
                                new Error(
                                    "CollectionEvent controller is not ready"
                                )
                            );
                            return;
                        }

                        const collectionFrame =
                            collectionNode.getComponent(UIMainMenuFrame);

                        if(!collectionFrame) {
                            fail(
                                new Error(
                                    "UIMainMenuFrame component not found on CollectionFrame"
                                )
                            );
                            return;
                        }

                        try {
                            this.connectCollectionPopups(
                                collectionNode,
                                popupsNode
                            );
                        }
                        catch(error) {
                            fail(
                                error instanceof Error
                                    ? error
                                    : new Error(
                                        "Failed to connect CollectionFramePopups"
                                    )
                            );
                            return;
                        }

                        collectionUi.eventController =
                            UserData.instance.collections;

                        if(ResolutionManager.instance) {
                            ResolutionManager.instance.addAdaptiveFrame(
                                collectionNode
                            );
                        }

                        this.preloadCollectionCovers()
                            .then(() => {
                                this.framesUi[4] = collectionFrame;

                                console.log(
                                    `[PRELOAD +${performance.now().toFixed(0)}ms] Collection preload finished`
                                );

                                resolve(collectionFrame);
                            });
                    }
                );
            });
        });

        return this.collectionFramePromise;
    }

    onLoad() {
        macro.ENABLE_MULTI_TOUCH = false;
    }

    start() {
        this.assetsLoadingFrame.show();

        SaveData.instance.node.on("level_progress_loaded", () => this.play());

        UserData.instance.node.on(
            "premium_purchase",
            () => this.showPremiumPurchase()
        );

        SaveData.instance.node.on("level_progress_checked", () => {
            console.log(
                `[STARTUP +${performance.now().toFixed(0)}ms] Level progress checked`
            );

            if (UserData.instance.getProgress() > 0) {

                this.assetsLoadingFrame.hide();

                AudioController.instance.playMainMenuSoundtrack();
                AudioController.instance.loadSoundsAssets();

                this.preloadLeaderboardInBackground();


                this.scheduleOnce(() => {

                    if (!this.clans.isDataLoaded()) {

                        console.log(
                            "[CLANS] Background preload started"
                        );

                        this.clans.refresh();
                    }

                }, 1.0);
            }
        });

        this.startFrame.on("play", () => this.play());

        this.startFrame.on("assets_ready", () => {
            this.updateBackgroundGraphics();

            AudioController.instance.loadSoundsAssets();
        });

        this.chest.node.on("complete", () => this.updateBackgroundGraphics());
        this.chest.node.on("reward", (data) => this.showChestReward(data));

        this.resourcesNode.on("shop", () => this.onBtnShopClick());

        SaveData.instance.loadStartBonusesData();
        SaveData.instance.loadButlersGiftData();

        this.shopBtn.node.on(Button.EventType.CLICK, this.onBtnShopClick, this);
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

        this.onBtnPlayClick();

        this.adsTimer.startMenuTimer();

        AudioController.instance.playMainMenuSoundtrack();
    }

    play() {
        console.log("play event handle");

        this.hide();

        this.adsTimer.startGameplayTimer();
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
                    console.log("[LEADERBOARD PRELOAD] fully ready");
                }
                catch(error) {
                    console.error("[LEADERBOARD PRELOAD] failed", error);
                }
            })();
        }, 0.5);
    }

    onBtnShopClick() {
        this.onMainMenuBtnClick(0);
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
        try {
            await this.ensureCollectionFrame();
            this.onMainMenuBtnClick(4);
        }
        catch(error) {
            console.error("Failed to open CollectionFrame", error);
        }
    }


    onMainMenuBtnClick(index: number) {
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
    }


    updateBackgroundGraphics() {
        assetManager.loadBundle("big_graphics", (err, bundle) => {
            if (err) {
                console.error(`Failed to load bundle: big_graphics`, err);
                return;
            }

            console.log(`Successfully loaded bundle: big_graphics"`);

            let backIndex = this.chest.getStage() + 1;

            bundle.load("back" + backIndex + "/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error(`Failed to load prefab: background`, err);
                    return;
                }

                console.log(`Successfully loaded prefab: background`);

                this.background.spriteFrame = spriteFrame;
                this.background_1.spriteFrame = spriteFrame;
            });
        });
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



