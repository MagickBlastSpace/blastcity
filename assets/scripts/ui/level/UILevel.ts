import {
    _decorator,
    Button,
    Label,
    Node,
    Sprite,
    SpriteFrame,
} from 'cc';
import { GoalData } from '../../data/GameData';
import { SaveData } from '../../data/SaveData';
import { Level } from '../../game/Level';
import { AudioController } from '../../utils/AudioController';
import { UIFrameBase } from '../UIFrameBase';
import { UILevelGoal } from './UILevelGoal';
import { UILevelResultFrame } from './UILevelResultFrame';

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

    @property([UILevelGoal])
    goalItems: UILevelGoal[] = [];

    @property([UILevelGoal])
    goalItems_Duplicate: UILevelGoal[] = [];

    @property(UILevelResultFrame)
    levelResult: UILevelResultFrame = null;

    @property(UIFrameBase)
    levelCompletePopup: UIFrameBase = null;

    @property(UIFrameBase)
    levelFailPopup: UIFrameBase = null;

    @property(Sprite)
    sidePanel_Left: Sprite = null;

    @property(Sprite)
    sidePanel_Right: Sprite = null;

    @property(Sprite)
    upperPanel_Portrait: Sprite = null;

    @property(Sprite)
    bottomPanel_Portrait: Sprite = null;

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

    @property(SpriteFrame)
    common_Portrait: SpriteFrame = null;

    @property(SpriteFrame)
    hard_Portrait: SpriteFrame = null;

    @property(SpriteFrame)
    superHard_Portrait: SpriteFrame = null;

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

    start() {
        this.level.on('init', () => this.init());
        this.level.on('refresh', () => this.refreshAll());
        this.level.on('complete', (isSuccess: boolean, goldEarned: number) =>
            this.showResult(isSuccess, goldEarned),
        );
        this.level.on('all_goals_complete_event', () =>
            this.showLevelCompletePopup(),
        );
        this.level.on('reward_move', () => this.addReward());
        this.level.on('no_moves', () => this.showNoMovesPopup());

        SaveData.instance.node.on('level_progress_loaded', () => this.refreshAll());

        this.settingsBtn_Portrait.node.on(
            Button.EventType.CLICK,
            this.onSettingsPortraitClick,
            this,
        );

        this.settingsBtn_Landscape.node.on(
            Button.EventType.CLICK,
            this.onSettingsLandscapeClick,
            this,
        );
    }

    init() {
        this.isRewarding = false;
    }

    refresh(movesCount: number) {
        this.movesCount.string = String(movesCount);
        this.movesCount_Duplicate.string = String(movesCount);
    }

    refreshGoals(goals: GoalData[]) {
        for (let i = 0; i < goals.length || i < this.goalItems.length; i++) {
            if (i < goals.length) {
                this.goalItems[i].refresh(goals[i]);
                this.goalItems_Duplicate[i].refresh(goals[i]);
            } else {
                const goalData = new GoalData();
                goalData.id = 'common';
                this.goalItems[i].refresh(goalData);
                this.goalItems_Duplicate[i].refresh(goalData);
            }
        }
    }

    refreshAll() {
        this.refresh(this.levelComp.getMoves());

        if (!this.isRewarding) {
            this.refreshGoals(this.levelComp.getGoals());
        }

        const difficulty = this.levelComp.getDifficulty();

        let sideSprite = this.common;
        let portraitSprite = this.common_Portrait;

        if (difficulty === 'hard') {
            sideSprite = this.hard;
            portraitSprite = this.hard_Portrait;
        }
        else if (difficulty === 'superhard') {
            sideSprite = this.superHard;
            portraitSprite = this.superHard_Portrait;
        }

        if (sideSprite) {
            if (this.sidePanel_Left) {
                this.sidePanel_Left.spriteFrame = sideSprite;
            }

            if (this.sidePanel_Right) {
                this.sidePanel_Right.spriteFrame = sideSprite;
            }
        }

        if (portraitSprite) {
            if (this.upperPanel_Portrait) {
                this.upperPanel_Portrait.spriteFrame = portraitSprite;
            }

            if (this.bottomPanel_Portrait) {
                this.bottomPanel_Portrait.spriteFrame = portraitSprite;
            }
        }
    }

    showResult(isSuccess: boolean, goldEarned: number) {
        this.levelResult.show();
        this.levelResult.refresh(isSuccess, goldEarned);

        if (!isSuccess) {
            AudioController.instance.playLose();
        }
    }

    showLevelCompletePopup() {
        this.setRewardingMode();

        this.levelCompletePopup.show();

        AudioController.instance.playLevelComplete();
        AudioController.instance.playWin();
    }

    showNoMovesPopup() {
        if (this.levelFailPopup) {
            this.levelFailPopup.show();
        }
    }

    addReward() {
        this.isRewarding = true;
    }

    setRewardingMode() {
        this.isRewarding = true;
    }

    onSettingsPortraitClick() {
        this.settings_Portrait.show();
    }

    onSettingsLandscapeClick() {
        this.settings_Landscape.show();
    }
}
