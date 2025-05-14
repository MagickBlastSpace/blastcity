import { _decorator, Component, Node, Label, Sprite, SpriteFrame, Button, assetManager } from 'cc';
import { GoalData } from '../../data/GameData';
import { UILevelGoal } from './UILevelGoal';
import { UIFrameBase } from '../UIFrameBase';
import { SaveData } from '../../data/SaveData';
import { Level } from '../../game/Level';
import { AudioController } from '../../utils/AudioController';
const { ccclass, property } = _decorator;

@ccclass('UILevel')
export class UILevel extends UIFrameBase {

    @property(Node)
    level: Node = null;
    @property(Level)
    levelComp: Level = null;

    @property(Label)
    movesCount: Label = null;
    @property(Label)
    movesCount_Duplicate: Label = null;
    /*@property(Label)
    goalLabel: Label = null;*/

    @property([UILevelGoal])
    goalItems: [UILevelGoal] = [];
    @property([UILevelGoal])
    goalItems_Duplicate: [UILevelGoal] = [];

    @property(UIFrameBase)
    levelResult: UIFrameBase = null;
    @property(UIFrameBase)
    levelCompletePopup: UIFrameBase = null;
    @property(UIFrameBase)
    levelFailPopup: UIFrameBase = null;

    @property(Sprite)
    sidePanel_Left: Sprite = null;
    @property(Sprite)
    sidePanel_Right: Sprite = null;

    @property(Sprite)
    picture_1: Sprite = null;
    @property(Sprite)
    picture_2: Sprite = null;
    @property(Sprite)
    picture_win: Sprite = null;

    @property(SpriteFrame)
    common: SpriteFrame = null;
    @property(SpriteFrame)
    hard: SpriteFrame = null;
    @property(SpriteFrame)
    superHard: SpriteFrame = null;

    @property(Button)
    settingsBtn_Portrait: Button = null;
    @property(Button)
    settingsBtn_Landscape: Button = null;

    @property(UIFrameBase)
    settings_Portrait: UIFrameBase = null;
    @property(UIFrameBase)
    settings_Landscape: UIFrameBase = null;

    private isRewarding: boolean = false;
    private rewardGoal: GoalData = null;


    onLoad() {
        //this.loadAssets();
    }
    
    start() {
        this.level.on("init", () => this.init());
        this.level.on("refresh", () => this.refreshAll());
        this.level.on("complete", (isSuccess: boolean, goldEarned: number) => this.showResult(isSuccess, goldEarned));
        this.level.on("all_goals_complete_event", (movesRemain) => this.showLevelCompletePopup());
        this.level.on("reward_move", () => this.addReward());
        this.level.on("no_moves", () => this.showNoMovesPopup());

        SaveData.instance.node.on("level_progress_loaded", () => this.refreshAll());

        this.settingsBtn_Portrait.node.on(Button.EventType.CLICK, this.onSettingsPortraitClick, this);
        this.settingsBtn_Landscape.node.on(Button.EventType.CLICK, this.onSettingsLandscapeClick, this);
    }

    init() {
        //this.goalLabel.string = "Goals";

        this.isRewarding = false;
    }

    refresh(movesCount: number) {
        this.movesCount.string = movesCount;
        this.movesCount_Duplicate.string = movesCount;
    }

    refreshGoals(goals: GoalData[]) {
        for(let i = 0; i < goals.length || i < this.goalItems.length; i++) {
            if(i < goals.length) {
                this.goalItems[i].refresh(goals[i]);
                this.goalItems_Duplicate[i].refresh(goals[i]);
            }
            else {
                let goalData = new GoalData();
                goalData.id = "common";
                this.goalItems[i].refresh(goalData);
                this.goalItems_Duplicate[i].refresh(goalData);
            }
        }
    }

    refreshAll() {
        this.refresh(this.levelComp.getMoves());
        if(!this.isRewarding) {
            this.refreshGoals(this.levelComp.getGoals());
        }
        
        let difficulty = this.levelComp.getDifficulty();
        
        if(difficulty === "hard") {
            this.sidePanel_Left.spriteFrame = this.hard;
            this.sidePanel_Right.spriteFrame = this.hard;
        }
        else if(difficulty === "superhard") {
            this.sidePanel_Left.spriteFrame = this.superHard;
            this.sidePanel_Right.spriteFrame = this.superHard;
        }
        else {
            this.sidePanel_Left.spriteFrame = this.common;
            this.sidePanel_Right.spriteFrame = this.common;
        }
    }

    showResult(isSuccess: boolean, goldEarned: number) {
        this.levelResult.show();
        this.levelResult.refresh(isSuccess, goldEarned);

        if(!isSuccess) {
            //AudioController.instance.playWin();
            AudioController.instance.playLose();
        }
        /*else {
            AudioController.instance.playLose();
        }*/
    }

    showLevelCompletePopup() {
        this.setRewardingMode();

        this.levelCompletePopup.show();

        AudioController.instance.playLevelComplete();

        AudioController.instance.playWin();
    }

    showNoMovesPopup() {
        this.levelFailPopup.show();

        //AudioController.instance.playLose();
    }


    setRewardingMode() {
        this.isRewarding = true;
        //this.goalLabel.string = "Reward";

        let rewardGoals = [];
        this.rewardGoal = new GoalData();
        this.rewardGoal.id = "coin";
        this.rewardGoal.count = this.levelComp.getCompletionReward();

        rewardGoals.push(this.rewardGoal);

        this.refreshGoals(rewardGoals);
    }

    addReward() {
        let mul = this.levelComp.getDifficultyMultiplier();

        this.rewardGoal.count += mul * 2;

        let rewardGoals = [];
        rewardGoals.push(this.rewardGoal);

        this.refreshGoals(rewardGoals);
    }


    onSettingsPortraitClick() {
        this.settings_Portrait.show();
    }

    onSettingsLandscapeClick() {
        this.settings_Landscape.show();
    }


    /*loadAssets() {
        assetManager.loadBundle("gameplay_ui", (err, bundle) => {
            if (err) {
                console.error(`Failed to load bundle: game`, err);
                return;
            }
    
            console.log(`Successfully loaded bundle: game`);
    
            // Check if zeus exists in the bundle
            const zeusInfo = bundle.getInfoWithPath("zeus_gameplay/spriteFrame");
            console.log(`Zeus asset info:`, zeusInfo);
    
            // Load zeus spriteFrame
            bundle.load("zeus_gameplay/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error(`Failed to load spriteFrame: zeus_gameplay`, err);
                    return;
                }
    
                console.log(`Successfully loaded spriteFrame: zeus_gameplay`);
                this.picture_1.spriteFrame = spriteFrame;
                this.picture_2.spriteFrame = spriteFrame;
            });
    
            // Load win spriteFrame
            bundle.load("win/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error(`Failed to load spriteFrame: win`, err);
                    return;
                }
    
                console.log(`Successfully loaded spriteFrame: win`);
                this.picture_win.spriteFrame = spriteFrame;
            });
        });
    }*/
    
}


