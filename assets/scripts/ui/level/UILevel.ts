import { _decorator, Component, Node, Label, Sprite, SpriteFrame } from 'cc';
import { GoalData } from '../../data/GameData';
import { UILevelGoal } from './UILevelGoal';
import { UIFrameBase } from '../UIFrameBase';
import { SaveData } from '../../data/SaveData';
import { Level } from '../../game/Level';
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
    goalLabel: Label = null;

    @property([UILevelGoal])
    goalItems: [UILevelGoal] = [];

    @property(UIFrameBase)
    levelResult: UIFrameBase = null;
    @property(UIFrameBase)
    levelCompletePopup: UIFrameBase = null;

    @property(Sprite)
    sidePanel_Left: Sprite = null;
    @property(Sprite)
    sidePanel_Right: Sprite = null;

    @property(SpriteFrame)
    common: SpriteFrame = null;
    @property(SpriteFrame)
    hard: SpriteFrame = null;
    @property(SpriteFrame)
    superHard: SpriteFrame = null;

    private isRewarding: boolean = false;
    private rewardGoal: GoalData = null;


    start() {
        this.level.on("init", () => this.init());
        this.level.on("refresh", () => this.refreshAll());
        this.level.on("complete", (isSuccess: boolean, goldEarned: number) => this.showResult(isSuccess, goldEarned));
        this.level.on("all_goals_complete_event", (movesRemain) => this.showLevelCompletePopup());
        this.level.on("reward_move", () => this.addReward());

        SaveData.instance.node.on("level_progress_loaded", () => this.refreshAll());
    }

    init() {
        this.goalLabel.string = "Goals";

        this.isRewarding = false;
    }

    refresh(movesCount: number) {
        this.movesCount.string = movesCount;
    }

    refreshGoals(goals: GoalData[]) {
        for(let i = 0; i < goals.length || i < this.goalItems.length; i++) {
            if(i < goals.length) {
                this.goalItems[i].refresh(goals[i]);
            }
            else {
                let goalData = new GoalData();
                goalData.id = "common";
                this.goalItems[i].refresh(goalData);
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
    }

    showLevelCompletePopup() {
        this.setRewardingMode();

        this.levelCompletePopup.show();
    }


    setRewardingMode() {
        this.isRewarding = true;
        this.goalLabel.string = "Reward";

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
}


