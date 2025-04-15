declare const gamepush: any;

import { _decorator, Component, Node, Label, Button, Sprite, SpriteFrame, assetManager, sp, Texture2D } from 'cc';
import { UILevelMovesShop } from './UILevelMovesShop';
import { SaveData } from '../../data/SaveData';
import { ButlersGift } from '../../game/boosters/ButlersGift';
import { Level } from '../../game/Level';
import { UserData } from '../../data/UserData';
import { GameData } from '../../data/GameData';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { UIMainMenu } from '../main/UIMainMenu';
import { Field } from '../../game/Field';
import { ResolutionManager } from '../../utils/ResolutionManager';
import { Localization } from '../../utils/Localization';
import { EventBase } from '../../game/events/EventBase';
const { ccclass, property } = _decorator;

@ccclass('UILevelResultFrame')
export class UILevelResultFrame extends UIPopupFrameBase {

    @property(Label)
    buttonLabel: Label = null;
    @property(Label)
    goldLabel: Label = null;
    @property(Label)
    levelLabel: Label = null;
    @property(Label)
    adLabel: Label = null;
    @property(Label)
    progressLoseLabel: Label = null;
    @property(Label)
    rocketsCount: Label = null;
    @property(Label)
    redTilesCount: Label = null;

    @property(Sprite)
    frame: Sprite = null;
    @property(SpriteFrame)
    common: SpriteFrame = null;
    @property(SpriteFrame)
    hard: SpriteFrame = null;
    @property(SpriteFrame)
    superHard: SpriteFrame = null;

    @property(Sprite)
    header: Sprite = null;
    @property(SpriteFrame)
    header_common: SpriteFrame = null;
    @property(SpriteFrame)
    header_hard: SpriteFrame = null;
    @property(SpriteFrame)
    header_superHard: SpriteFrame = null;

    @property(Sprite)
    picture: Sprite = null;

    @property(Sprite)
    bgStageLose: Sprite = null;
    @property(SpriteFrame)
    bgStageLose_0: SpriteFrame = null;
    @property(SpriteFrame)
    bgStageLose_1: SpriteFrame = null;
    @property(SpriteFrame)
    bgStageLose_2: SpriteFrame = null;
    @property(SpriteFrame)
    bgStageLose_3: SpriteFrame = null;

    @property(Button)
    playBtn: Button = null;
    @property(Button)
    showAdBtn: Button = null;
    @property(Button)
    closeBtn: Button = null;

    @property(Node)
    progressLose: Node = null;
    @property(Node)
    commonMovesShopPanel: Node = null;
    @property(Node)
    winPanel: Node = null;
    @property(Node)
    giftPanel: Node = null;
    @property(Node)
    rocketsCountNode: Node = null;
    @property(Node)
    redTilesCountNode: Node = null;

    @property(UIMainMenu)
    mainFrame: UIMainMenu = null;

    @property(UILevelMovesShop)
    movesShop: UILevelMovesShop = null;

    @property(ButlersGift)
    butlersGift: ButlersGift = null;

    @property(Level)
    level: Level = null;
    @property(Field)
    field: Field = null;

    @property(EventBase)
    eventRocketFever: EventBase;
    @property(EventBase)
    eventAphrodite: EventBase;

    /*@property(sp.Skeleton)
    animationFireworks: sp.Skeleton = null;*/
    @property(sp.Skeleton)
    animationEffect: sp.Skeleton = null;

    private isSuccess: boolean = false;

    private difficulty: string = "";
    private goldEarned: number = 0;


    onLoad() {
        this.loadAssets();
    }
    
    start() {
        this.playBtn.node.on(Button.EventType.CLICK, this.onPlayBtnClick, this);
        this.showAdBtn.node.on(Button.EventType.CLICK, this.onShowAdBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.onPlayBtnClick, this);

        this.movesShop.node.on("buy", () => this.hide());
        this.movesShop.node.on("close", () => this.onPlayBtnClick());
        this.movesShop.node.on("show_panel_lose_progress", () => this.showPanelLoseProgress());
    }
    
    refresh(isSuccess: boolean, goldEarned: number) {
        this.isSuccess = isSuccess;

        let isKingLeague = this.isKingLeagueMode();

        let currentLevelNumber = isKingLeague ? UserData.instance.getKingLeagueProgress(): UserData.instance.getProgress();
        //let lvlString = isKingLeague ? "Round " + currentLevelNumber : "Level " + currentLevelNumber;
        let lvlString = isKingLeague ? Localization.instance.getLabelByKey("StartFrame.Stage") + " " + currentLevelNumber : Localization.instance.getLabelByKey("StartFrame.Level") + " " + currentLevelNumber;

        this.levelLabel.string = isSuccess ? lvlString : Localization.instance.getLabelByKey("combat.continue");

        this.buttonLabel.string = isSuccess ? Localization.instance.getLabelByKey("combat.continue") : Localization.instance.getLabelByKey("combat.replay");
        this.goldLabel.string = "x" + goldEarned;

        this.movesShop.node.active = !isSuccess;
        //this.commonMovesShopPanel.active = !isSuccess && this.butlersGift.getStreak() === 0;
        this.commonMovesShopPanel.active = true;
        this.progressLose.active = false;
        this.movesShop.setBasicState();
        this.winPanel.active = isSuccess;

        this.movesShop.refresh();

        this.goldEarned = goldEarned;

        this.showAdBtn.node.active = false;

        this.giftPanel.active = this.butlersGift.isAvailable();

        if(isSuccess) {
            /*let isPortrait = ResolutionManager.instance.isPortraitOrientation();
            let fireworksName = isPortrait ? "vertical" : "horizontal";

            if(this.animationFireworks.skeletonData) {
                this.animationFireworks.setAnimation(0, fireworksName, false);
            }*/
            if(this.animationEffect.skeletonData) {
                this.animationEffect.setAnimation(0, 'animation', true);
            }
        }

        try {
            let levelData = GameData.instance.getLastLevel();

            this.difficulty = levelData.difficulty;

            if(levelData.difficulty === "hard") {
                this.frame.spriteFrame = this.hard;
                this.header.spriteFrame = this.header_hard;

                //this.showAdBtn.node.active = true;
                //this.adLabel.string = "x3";
            }
            else if(levelData.difficulty === "superhard") {
                this.frame.spriteFrame = this.superHard;
                this.header.spriteFrame = this.header_superHard;

                //this.showAdBtn.node.active = true;
                //this.adLabel.string = "x5";
            }
            else {
                this.frame.spriteFrame = this.common;
                this.header.spriteFrame = this.header_common;
            }
        } catch (error) {
            console.error('Error setting level result:', error);
        }
    }


    showPanelLoseProgress() {
        this.commonMovesShopPanel.active = false;
        this.rocketsCountNode.active = false;
        this.redTilesCountNode.active = false;

        if(this.butlersGift.getStreak() === 2) {
            this.bgStageLose.spriteFrame = this.bgStageLose_2;
        }
        else if(this.butlersGift.getStreak() === 3) {
            this.bgStageLose.spriteFrame = this.bgStageLose_3;
        }
        else if(this.butlersGift.getStreak() === 1) {
            this.bgStageLose.spriteFrame = this.bgStageLose_1;
        }
        else {
            this.bgStageLose.spriteFrame = this.bgStageLose_0;
        }

        if(!this.isSuccess && this.eventRocketFever.isInteractable() && this.level.getRocketsStat() > 0) {
            this.progressLose.active = true;
            this.rocketsCountNode.active = true;

            this.progressLoseLabel.string = Localization.instance.getLabelByKey("combat.failatrp");

            this.rocketsCount.string = this.level.getRocketsStat();
        }
        else if(!this.isSuccess && this.eventAphrodite.isInteractable() && this.level.getRedTilesStat() > 0) {
            this.progressLose.active = true;
            this.redTilesCountNode.active = true;

            this.progressLoseLabel.string = Localization.instance.getLabelByKey("combat.failataf");

            this.redTilesCount.string = this.level.getRedTilesStat();
        }
        else if(!this.isSuccess && this.butlersGift.getStreak() > 0) {
            this.progressLose.active = true;

            this.progressLoseLabel.string = Localization.instance.getLabelByKey("combat.failat");
        }
        else {
            this.onPlayBtnClick();
        }
    }


    onPlayBtnClick() {
        SaveData.instance.clearLevelProgress();

        if(!this.isSuccess) {
            this.butlersGift.clearStreak();
            this.level.fail();
        }

        this.mainFrame.show();

        this.hide();

        this.node.emit("level_close");

        this.field.unloadAssets();
    }

    fail() {
        SaveData.instance.clearLevelProgress();

        this.butlersGift.clearStreak();
        this.level.fail();

        this.mainFrame.show();

        this.hide();

        this.node.emit("level_close");

        this.field.unloadAssets();
    }

    async onShowAdBtnClick() {
        const success = await gamepush.ads.showRewardedVideo();
        if (success) {
            this.getAdReward();

            this.onPlayBtnClick();
        }
    }

    getAdReward() {
        if(this.difficulty === "hard") {
            UserData.instance.addResource("gold", this.goldEarned * 2);
        }
        else if(this.difficulty === "superhard") {
            UserData.instance.addResource("gold", this.goldEarned * 4);
        }
    }


    isKingLeagueMode(): boolean {
        return UserData.instance.getProgress() >= GameData.instance.getMaxProgress();
    }


    loadAssets() {
        assetManager.loadBundle("game", (err, bundle) => {
            if (err) {
                console.error(`Failed to load bundle: game`, err);
                return;
            }

            console.log(`Successfully loaded bundle: game"`);


            bundle.load("win/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error(`Failed to load prefab: win`, err);
                    return;
                }

                console.log(`Successfully loaded prefab: win`);

                this.picture.spriteFrame = spriteFrame;
            });
        });
    }


    /*loadAssets() {
        assetManager.loadBundle("animations_effect", (err, bundle) => {
            if (err) {
                return;
            }

            bundle.load("effect", sp.SkeletonData, (err, anim) => {
                if (err) {
                    console.log("Effect load error");
                    return;
                }

                this.animationEffect.skeletonData = anim;
            });

            bundle.load("fireworks", sp.SkeletonData, (err, anim) => {
                if (err) {
                    console.log("fireworks load error");
                    return;
                }

                this.animationFireworks.skeletonData = anim;
            });
        });
    }*/

    /*loadAssets() {
        assetManager.loadBundle("animations_effect", (err, bundle) => {
            if (err) {
                console.error("Failed to load asset bundle:", err);
                return;
            }
    
            bundle.load('effect.atlas', (err, atlasText) => {
                if (err) {
                    console.error("Failed to load atlas:", err);
                    return;
                }
    
                bundle.load('effect', (err, skeletonJson: sp.TextAsset) => {
                    if (err) {
                        console.error("Failed to load skeleton json:", err);
                        return;
                    }
    
                    bundle.load('effect/texture', (err, textureAsset: Texture2D) => {
                        if (err) {
                            console.error("Failed to load texture:", err);
                            return;
                        }
    
                        const skeletonData = new sp.SkeletonData();
                        skeletonData.skeletonJson = skeletonJson;
                        skeletonData.atlasText = atlasText;
                        skeletonData.textures = [textureAsset];
                        skeletonData.textureNames = ['effect.png'];
    
                        if (this.animationEffect) {
                            this.animationEffect.skeletonData = skeletonData;
                        }
                    });
                });
            });


            bundle.load('firework.atlas', (err, atlasText) => {
                if (err) {
                    console.error("Failed to load atlas:", err);
                    return;
                }
    
                bundle.load('firework', (err, skeletonJson) => {
                    if (err) {
                        console.error("Failed to load skeleton json:", err);
                        return;
                    }
    
                    bundle.load('firework/texture', (err, textureAsset: Texture2D) => {
                        if (err) {
                            console.error("Failed to load texture:", err);
                            return;
                        }
    
                        const skeletonData = new sp.SkeletonData();
                        skeletonData.skeletonJson = skeletonJson;
                        skeletonData.atlasText = atlasText;
                        skeletonData.textures = [textureAsset];
                        skeletonData.textureNames = ['firework.png'];
    
                        if (this.animationFireworks) {
                            this.animationFireworks.skeletonData = skeletonData;
                        }
                    });
                });
            });
        });
    }*/
}


