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

    @property(Button)
    playBtn: Button = null;
    @property(Button)
    showAdBtn: Button = null;

    @property(Node)
    progressLose: Node = null;
    @property(Node)
    commonMovesShopPanel: Node = null;
    @property(Node)
    winPanel: Node = null;

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

    @property(sp.Skeleton)
    animationFireworks: sp.Skeleton = null;
    @property(sp.Skeleton)
    animationEffect: sp.Skeleton = null;

    private isSuccess: boolean = false;

    private difficulty: string = "";
    private goldEarned: number = 0;


    onLoad() {
        //this.loadAssets();
    }
    
    start() {
        this.playBtn.node.on(Button.EventType.CLICK, this.onPlayBtnClick, this);
        this.showAdBtn.node.on(Button.EventType.CLICK, this.onShowAdBtnClick, this);

        this.movesShop.node.on("buy", () => this.hide());
        this.movesShop.node.on("close", () => this.onPlayBtnClick());
    }
    
    refresh(isSuccess: boolean, goldEarned: number) {
        this.isSuccess = isSuccess;

        let isKingLeague = this.isKingLeagueMode();

        let currentLevelNumber = isKingLeague ? UserData.instance.getKingLeagueProgress(): UserData.instance.getProgress();
        let lvlString = isKingLeague ? "Round " + currentLevelNumber : "Level " + currentLevelNumber;

        this.levelLabel.string = isSuccess ? lvlString : "Continue?";

        this.buttonLabel.string = isSuccess ? "Continue" : "Replay";
        this.goldLabel.string = "x" + goldEarned;

        this.movesShop.node.active = !isSuccess;
        this.progressLose.active = !isSuccess && this.butlersGift.getStreak() > 0;
        this.commonMovesShopPanel.active = !isSuccess && this.butlersGift.getStreak() === 0;
        this.winPanel.active = isSuccess;

        this.movesShop.refresh();

        this.goldEarned = goldEarned;

        this.showAdBtn.node.active = false;

        if(isSuccess) {
            let isPortrait = ResolutionManager.instance.isPortraitOrientation();
            let fireworksName = isPortrait ? "vertical" : "horizontal";

            if(this.animationFireworks.skeletonData) {
                this.animationFireworks.setAnimation(0, fireworksName, false);
            }
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

                this.showAdBtn.node.active = true;
                this.adLabel.string = "x3";
            }
            else if(levelData.difficulty === "superhard") {
                this.frame.spriteFrame = this.superHard;
                this.header.spriteFrame = this.header_superHard;

                this.showAdBtn.node.active = true;
                this.adLabel.string = "x5";
            }
            else {
                this.frame.spriteFrame = this.common;
                this.header.spriteFrame = this.header_common;
            }
        } catch (error) {
            console.error('Error setting level result:', error);
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


    loadAsstets() {
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


