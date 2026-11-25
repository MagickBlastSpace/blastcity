import {
    _decorator,
    Button,
    instantiate,
    Label,
    Layout,
    Node,
    Sprite,
    SpriteFrame,
    UITransform,
    view,
    Widget,
} from 'cc';
import { GameData, GoalData } from '../../data/GameData';
import { SaveData } from '../../data/SaveData';
import { UserData } from '../../data/UserData';
import { WinRocketLineRequest } from '../../game/Field';
import { Level } from '../../game/Level';
import { AudioController } from '../../utils/AudioController';
import { ResolutionManager } from '../../utils/ResolutionManager';
import { UIFrameBase } from '../UIFrameBase';
import { UILevelGoal } from './UILevelGoal';
import { UILevelResultFrame } from './UILevelResultFrame';
import { UIWinStarsLine } from './UIWinStarsLine';

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

    @property(UIWinStarsLine)
    winStarsLine: UIWinStarsLine = null;

    @property(Node)
    winMovesCounterForeground: Node = null;

    @property(Node)
    winSkipTutorial: Node = null;

    @property(Node)
    goalsCaptionLandscape: Node = null;

    @property(Node)
    prizeCaptionLandscape: Node = null;

    @property(Node)
    goalsCaptionPortrait: Node = null;

    @property(Node)
    prizeCaptionPortrait: Node = null;

    private isFirstLevelAtStart: boolean = false;

    private magicHatCarrotsFlying: number = 0;
    private magicHatVisibleCount: number | null = null;

    private winCounterSource: Node | null = null;
    private winCounterClone: Node | null = null;

    private isRewarding: boolean = false;
    private rewardGoal: GoalData = null;

    private isWinRewardActive: boolean = false;

    private shellPearlsFlying: number = 0;
    private shellVisibleCount: number | null = null;

    start(): void {
        this.level.on('init', this.init, this);
        this.level.on('refresh', this.refreshAll, this);
        this.level.on('complete', this.showResult, this);
        this.level.on('all_goals_complete_event', this.showLevelCompletePopup, this);
        this.level.on('reward_move', this.addReward, this);
        this.level.on('no_moves', this.showNoMovesPopup, this);


        this.levelComp.field.on('win_rocket_line', this.onWinRocketLine, this);
        this.levelComp.field.on('win_conversion_finished', this.hideWinSkipTutorial, this);
        this.levelComp.field.on('win_coin_arrived', this.onWinCoinArrived, this);

        this.levelComp.field.on('shell_pearl_started', this.onShellPearlStarted, this);
        this.levelComp.field.on('shell_pearl_arrived', this.onShellPearlArrived, this);

        this.levelComp.field.on('magic_hat_carrot_started', this.onMagicHatCarrotStarted, this);
        this.levelComp.field.on('magic_hat_carrot_arrived', this.onMagicHatCarrotArrived, this);

        this.levelCompletePopup.node.on('win_conversion_started', this.onWinConversionStarted, this);

        SaveData.instance.node.on('level_progress_loaded', this.refreshAll, this);

        this.settingsBtn_Portrait.node.on(Button.EventType.CLICK, this.onSettingsPortraitClick, this);
        this.settingsBtn_Landscape.node.on(Button.EventType.CLICK, this.onSettingsLandscapeClick, this);
    }

    init() {
        this.isRewarding = false;
        this.isWinRewardActive = false;
        this.rewardGoal = null;
        this.shellPearlsFlying = 0;
        this.shellVisibleCount = null;
        this.magicHatCarrotsFlying = 0;
        this.magicHatVisibleCount = null;

        this.setPrizeCaptionVisible(false)

        const devSelectedLevel = GameData.instance.getDevSelectedLevelNumber();
        const currentProgress = UserData.instance.getProgress();

        this.isFirstLevelAtStart = devSelectedLevel !== null
            ? devSelectedLevel === 1
            : currentProgress === 0;

        this.hideWinSkipTutorial();

        console.log('[WIN TUTORIAL INIT]', {
            devMode: UserData.instance.isDevMode(),
            devSelectedLevel,
            currentProgress,
            firstLevel: this.isFirstLevelAtStart
        });
}

    refresh(movesCount: number) {
        this.movesCount.string = String(movesCount);
        this.movesCount_Duplicate.string = String(movesCount);
    }

    refreshGoals(goals: GoalData[]) {
        for (let i = 0; i < goals.length || i < this.goalItems.length; i++) {
            if(i < goals.length) {
                const actualGoal = goals[i];
                let displayedGoal = actualGoal;

                if(actualGoal.id === 'shell' && this.shellVisibleCount !== null) {

                    if(
                        this.shellPearlsFlying === 0 &&
                        actualGoal.count <= this.shellVisibleCount
                    ) {
                        this.shellVisibleCount = null;
                    } else {
                        const visualGoal = new GoalData();
                        visualGoal.id = actualGoal.id;
                        visualGoal.count = this.shellVisibleCount;

                        displayedGoal = visualGoal;
                    }
                }

                if(actualGoal.id === 'magic_hat' && this.magicHatVisibleCount !== null) {
                    if(
                        this.magicHatCarrotsFlying === 0 &&
                        actualGoal.count <= this.magicHatVisibleCount
                    ) {
                        this.magicHatVisibleCount = null;
                    } else {
                        const visualGoal = new GoalData();
                        visualGoal.id = 'magic_hat';
                        visualGoal.count = this.magicHatVisibleCount;

                        displayedGoal = visualGoal;
                    }
                }

                this.goalItems[i].refresh(displayedGoal);
                this.goalItems_Duplicate[i].refresh(displayedGoal);
            } else {
                const goalData = new GoalData();
                goalData.id = 'common';
                this.goalItems[i].refresh(goalData);
                this.goalItems_Duplicate[i].refresh(goalData);
            }
        }

        this.updateLandscapeGoalsLayout();

        const portraitLayout = this.goalItems_Duplicate[0]?.node.parent?.getComponent(Layout);
        portraitLayout?.updateLayout();
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

    public updateLandscapeGoalsLayout(): void {
        this.updateGoalsGrid(this.goalItems);
        this.updateGoalsGrid(this.goalItems_Duplicate);
    }

    private updateGoalsGrid(items: UILevelGoal[]): void {
        const container = items[0]?.node.parent;
        const transform = container?.getComponent(UITransform);

        if(!container || !transform) return;

        const layout = container.getComponent(Layout);
        if(layout?.enabled) layout.enabled = false;

        const activeGoals = items
            .filter(goal => goal?.node?.active)
            .map(goal => goal.node);

        const count = activeGoals.length;
        if(count === 0) return;

        const cellSize = 110;
        const spacing = 20;

        const columns = Math.min(2, count);
        const rows = Math.ceil(count / 2);

        const totalWidth = columns * cellSize + (columns - 1) * spacing;
        const totalHeight = rows * cellSize + (rows - 1) * spacing;

        const layoutScale = Math.min(
            1,
            transform.width / totalWidth,
            transform.height / totalHeight
        );

        if(layoutScale <= 0) return;

        const isPortrait = ResolutionManager.instance.isPortraitOrientation();

        const visualScale = isPortrait ? layoutScale * 0.32 : layoutScale;
        const step = (cellSize + spacing) * layoutScale;

        for(let i = 0; i < count; i++) {
            const row = Math.floor(i / 2);
            const col = i % 2;
            const itemsInRow = Math.min(2, count - row * 2);

            const x = (col - (itemsInRow - 1) / 2) * step;
            const y = ((rows - 1) / 2 - row) * step;

            const node = activeGoals[i];

            node.setScale(visualScale, visualScale, 1);
            node.setPosition(x, y, node.position.z);
        }
    }

    // private updateLandscapeGoalsLayout(): void {
    //     const container = this.goalItems[0]?.node.parent;
    //     const transform = container?.getComponent(UITransform);

    //     if(!container || !transform) return;

    //     const layout = container.getComponent(Layout);

    //     if(layout?.enabled) {
    //         layout.enabled = false;
    //     }

    //     const activeGoals = this.goalItems
    //         .filter(goal => goal?.node?.active)
    //         .map(goal => goal.node);

    //     const count = activeGoals.length;
    //     if(count === 0) return;

    //     const cellSize = 110;
    //     const spacing = 26;

    //     const columns = Math.min(2, count);
    //     const rows = Math.ceil(count / 2);

    //     const totalWidth = columns * cellSize + (columns - 1) * spacing;
    //     const totalHeight = rows * cellSize + (rows - 1) * spacing;

    //     const scale = Math.min(
    //         1,
    //         transform.width / totalWidth,
    //         transform.height / totalHeight
    //     );

    //     const step = (cellSize + spacing) * scale;

    //     for(let i = 0; i < count; i++) {
    //         const row = Math.floor(i / 2);
    //         const col = i % 2;

    //         const itemsInRow = Math.min(2, count - row * 2);

    //         const x = (col - (itemsInRow - 1) / 2) * step;
    //         const y = ((rows - 1) / 2 - row) * step;

    //         const node = activeGoals[i];

    //         node.setScale(scale, scale, 1);
    //         node.setPosition(x, y, node.position.z);
    //     }
    // }

    private onMagicHatCarrotStarted(): void {
        if(this.magicHatCarrotsFlying === 0) {
            const goal = this.levelComp.getGoals()
                .find(goal => goal.id === 'magic_hat');

            this.magicHatVisibleCount = goal?.count ?? null;
        }

        this.magicHatCarrotsFlying++;
    }

    private onMagicHatCarrotArrived(): void {
        if(this.magicHatCarrotsFlying <= 0) return;

        this.magicHatCarrotsFlying--;

        if(this.magicHatVisibleCount !== null) {
            this.magicHatVisibleCount = Math.max(
                0,
                this.magicHatVisibleCount - 1
            );
        }

        this.refreshGoals(this.levelComp.getGoals());
    }

    private onShellPearlStarted(): void {
        if(this.shellPearlsFlying === 0) {
            const shellGoal = this.levelComp.getGoals()
                .find(goal => goal.id === 'shell');

            this.shellVisibleCount = shellGoal?.count ?? null;
        }

        this.shellPearlsFlying++;

        console.log('[SHELL GOAL] Pearl started', {
            flying: this.shellPearlsFlying,
            visible: this.shellVisibleCount
        });
    }

    private onShellPearlArrived(): void {
        if(this.shellPearlsFlying <= 0) return;

        this.shellPearlsFlying--;

        if(this.shellVisibleCount !== null) {
            this.shellVisibleCount = Math.max(
                0,
                this.shellVisibleCount - 1
            );
        }

        this.refreshGoals(this.levelComp.getGoals());

        console.log('[SHELL GOAL] Pearl arrived', {
            flying: this.shellPearlsFlying,
            visible: this.shellVisibleCount
        });
    }

    private setPrizeCaptionVisible(visible: boolean): void {
        if(this.goalsCaptionLandscape?.isValid) {
            this.goalsCaptionLandscape.active = !visible;
        }

        if(this.prizeCaptionLandscape?.isValid) {
            this.prizeCaptionLandscape.active = visible;
        }

        if(this.goalsCaptionPortrait?.isValid) {
            this.goalsCaptionPortrait.active = !visible;
        }

        if(this.prizeCaptionPortrait?.isValid) {
            this.prizeCaptionPortrait.active = visible;
        }
    }

    private showWinCounterForeground(sourceNode: Node): void {
        if(!this.winMovesCounterForeground?.isValid || !sourceNode?.isValid) return;

        if(this.winCounterSource !== sourceNode || !this.winCounterClone?.isValid) {
            if(this.winCounterClone?.isValid) {
                this.winCounterClone.destroy();
            }

            this.winCounterSource = sourceNode;
            this.winCounterClone = instantiate(sourceNode);
            this.winCounterClone.name = 'WinCounterFront';

            this.winMovesCounterForeground.addChild(this.winCounterClone);
        }

        this.winMovesCounterForeground.active = true;
        this.syncWinCounterForeground();
    }

    private syncWinCounterForeground(): void {
        if(!this.winMovesCounterForeground?.activeInHierarchy) return;
        if(!this.winCounterSource?.isValid || !this.winCounterClone?.isValid) return;

        const source = this.winCounterSource;
        const clone = this.winCounterClone;

        clone.active = source.activeInHierarchy;

        if(!clone.active) return;

        const sourceLabel = source.getComponent(Label);
        const cloneLabel = clone.getComponent(Label);

        if(sourceLabel && cloneLabel) {
            cloneLabel.string = sourceLabel.string;
        }

        clone.setWorldPosition(source.worldPosition);
        clone.setWorldRotation(source.getWorldRotation());
        clone.setWorldScale(source.getWorldScale());
    }

    lateUpdate(): void {
        this.syncWinCounterForeground();
    }

    private hideWinCounterForeground(): void {
        if(this.winMovesCounterForeground?.isValid) {
            this.winMovesCounterForeground.active = false;
        }
    }

    private onWinRocketLine(request: WinRocketLineRequest): void {
        if(!request || request.handled) return;
        if(!request.targetWorld) return;

        if(!this.winStarsLine?.node.activeInHierarchy) {
            console.warn('[WIN LINE] Effects layer unavailable');
            return;
        }

        const visibleSize = view.getVisibleSize();
        const isPortrait = visibleSize.height >= visibleSize.width;

        const startNode = isPortrait
            ? this.movesCount_Duplicate?.node
            : this.movesCount?.node;

        if(!startNode?.isValid || !startNode.activeInHierarchy) {
            console.warn('[WIN LINE] Moves counter unavailable', {
                isPortrait,
                startNode: startNode?.name
            });
            return;
        }

        this.showWinCounterForeground(startNode);

        request.handled = true;

        this.winStarsLine.playLine(
            startNode.worldPosition.clone(),
            request.targetWorld,
            request.onReach
        );
    }

    private updateWinSkipTutorialLayout(): void {
        if(!this.winSkipTutorial?.isValid) return;

        const isPortrait = ResolutionManager.instance.isPortraitOrientation();

        const scale = isPortrait ? 4 : 2;

        this.winSkipTutorial.setScale(scale, scale, 1);

        const widget = this.winSkipTutorial.getComponent(Widget);
        if(!widget) return;

        widget.isAlignHorizontalCenter = true;
        widget.horizontalCenter = 0;

        widget.isAlignBottom = true;
        widget.bottom = 30;

        widget.updateAlignment();
    }

    private onWinConversionStarted(): void {
        this.setRewardingMode();
        this.isWinRewardActive = true;
        this.setPrizeCaptionVisible(true)

        const moves = this.levelComp.getMoves();

        const shouldShow =
            this.isFirstLevelAtStart &&
            moves > 0;

        if(!this.winSkipTutorial?.isValid) return;

        this.winSkipTutorial.active = shouldShow;

        if(shouldShow) {
            this.updateWinSkipTutorialLayout();
        }
    }

    private onWinCoinArrived(): void {
        if(!this.isWinRewardActive || !this.rewardGoal) return;

        const goldPerRocket = this.levelComp.isBonusGoldAvailable()
            ? 2 * this.levelComp.getDifficultyMultiplier()
            : 0;

        if(goldPerRocket <= 0) return;

        this.rewardGoal.count += goldPerRocket;

        this.refreshGoals([this.rewardGoal]);

        console.log('[WIN REWARD] Coin arrived', {
            added: goldPerRocket,
            displayedReward: this.rewardGoal.count
        });
    }

    private hideWinSkipTutorial(): void {
        if(this.winSkipTutorial?.isValid) {
            this.winSkipTutorial.active = false;
        }
    }

    showResult(isSuccess: boolean, goldEarned: number) {
        this.isWinRewardActive = false;
        this.hideWinSkipTutorial();
        this.hideWinCounterForeground();

        if(isSuccess) {
            this.winStarsLine?.clearLines();
            this.levelCompletePopup.hide();
        }

        this.levelResult.show();
        this.levelResult.refresh(isSuccess, goldEarned);

        if(!isSuccess) {
            AudioController.instance.playLose();
        }
    }

    showLevelCompletePopup() {
        this.hideWinSkipTutorial();
        this.hideWinCounterForeground();

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

    setRewardingMode(): void {
        if(this.isRewarding) return;

        this.isRewarding = true;

        this.rewardGoal = new GoalData();
        this.rewardGoal.id = 'coin';
        this.rewardGoal.count = this.levelComp.getCompletionReward();

        this.refreshGoals([this.rewardGoal]);

        console.log('[WIN REWARD] Reward panel initialized', {
            baseReward: this.rewardGoal.count
        });
    }

    onSettingsPortraitClick() {
        this.settings_Portrait.show();
    }

    onSettingsLandscapeClick() {
        this.settings_Landscape.show();
    }

    protected onDestroy(): void {
        if(this.level?.isValid) {
            this.level.off('init', this.init, this);
            this.level.off('refresh', this.refreshAll, this);
            this.level.off('complete', this.showResult, this);
            this.level.off('all_goals_complete_event', this.showLevelCompletePopup, this);
            this.level.off('reward_move', this.addReward, this);
            this.level.off('no_moves', this.showNoMovesPopup, this);
        }

        if(this.levelComp?.field?.isValid) {
            this.levelComp.field.off('win_rocket_line', this.onWinRocketLine, this);
            this.levelComp.field.off('win_conversion_finished', this.hideWinSkipTutorial, this);
            this.levelComp.field.off('win_coin_arrived', this.onWinCoinArrived, this);
            this.levelComp.field.off('shell_pearl_started', this.onShellPearlStarted, this);
            this.levelComp.field.off('shell_pearl_arrived', this.onShellPearlArrived, this);
            this.levelComp.field.off('magic_hat_carrot_started', this.onMagicHatCarrotStarted, this);
            this.levelComp.field.off('magic_hat_carrot_arrived', this.onMagicHatCarrotArrived, this);
        }

        if(this.levelCompletePopup?.node?.isValid) {
            this.levelCompletePopup.node.off('win_conversion_started', this.onWinConversionStarted, this);
        }

        if(SaveData.instance?.node?.isValid) {
            SaveData.instance.node.off('level_progress_loaded', this.refreshAll, this);
        }

        if(this.settingsBtn_Portrait?.node?.isValid) {
            this.settingsBtn_Portrait.node.off(Button.EventType.CLICK, this.onSettingsPortraitClick, this);
        }

        if(this.settingsBtn_Landscape?.node?.isValid) {
            this.settingsBtn_Landscape.node.off(Button.EventType.CLICK, this.onSettingsLandscapeClick, this);
        }
    }
}
