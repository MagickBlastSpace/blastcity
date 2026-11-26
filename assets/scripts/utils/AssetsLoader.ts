import { _decorator, assetManager, Component, Node, Prefab, SpriteFrame } from 'cc';
import { LevelData } from '../data/GameData';
import { Field } from '../game/Field';
import { UIAssetsLoadingFrame } from '../ui/loading/UIAssetsLoadingFrame';
const { ccclass, property } = _decorator;

@ccclass('AssetsLoader')
export class AssetsLoader extends Component {

    @property(Node)
    field: Node = null;

    @property(UIAssetsLoadingFrame)
    loadingFrame: UIAssetsLoadingFrame = null;

    public static instance: AssetsLoader = null;

    private gamplayAssetsCounter: number = 0;
    private maxGamplayAssets: number = 0;

    private loadedGameplayBundlesCount: number = 0;
    private gameplayBundlesCount: number = 4;

    private fieldComp: Field = null;

    private currentSpecs: string[] = [];

    private currentGoalIcons: string[] = [];
    private areGoalIconsReady: boolean = false;

    private isLoadingStarted: boolean = false;
    private isBaseTilesLoaded: boolean = false;

    onLoad() {
        AssetsLoader.instance = this;
    }

    start() {
        const fieldComp = this.field.getComponent(Field);

        if(!fieldComp) {
            console.error('AssetsLoader: Field component not found');
            return;
        }

        this.fieldComp = fieldComp;
    }


    initGameplay(level: LevelData) {
        this.currentSpecs = [];

        this.currentGoalIcons = Array.from(new Set([
            ...level.goals.map(goal => goal.id.toLowerCase()),
            'coin'
        ])).filter(id => id !== 'common');

        for(let i = 0; i < level.specialTiles.length; i++) {
            let spec = level.specialTiles[i].id;

            if(!this.currentSpecs.includes(spec)) {
                this.currentSpecs.push(spec);
            }
        }

        for(let i = 0; i < level.statuses.length; i++) {
            let spec = level.statuses[i].id;

            if(!this.currentSpecs.includes(spec)) {
                this.currentSpecs.push(spec);
            }
        }

        for(let i = 0; i < level.goals.length; i++) {
            let spec = level.goals[i].id;

            if(!this.currentSpecs.includes(spec)) {
                this.currentSpecs.push(spec);
            }
        }

        if(level.difficulty === "bonus") {
            this.currentSpecs.push("coin");
        }

        for(let i = 0; i < level.startPool.length; i++) {
            if(!this.currentSpecs.includes(level.startPool[i])) {
                this.currentSpecs.push(level.startPool[i]);
            }
        }

        for(let i = 0; i < level.spawnPools.length; i++) {
            for(let j = 0; j < level.spawnPools[i].length; j++) {
                if(!this.currentSpecs.includes(level.spawnPools[i][j])) {
                    this.currentSpecs.push(level.spawnPools[i][j]);
                }
            }
        }

        if(this.currentSpecs.includes("easteregg")) {
            if(!this.currentSpecs.includes("easteregg_blue")) {
                this.currentSpecs.push("easteregg_blue");
            }
            if(!this.currentSpecs.includes("easteregg_green")) {
                this.currentSpecs.push("easteregg_green");
            }
            if(!this.currentSpecs.includes("easteregg_yellow")) {
                this.currentSpecs.push("easteregg_yellow");
            }
            if(!this.currentSpecs.includes("easteregg_red")) {
                this.currentSpecs.push("easteregg_red");
            }
            if(!this.currentSpecs.includes("easteregg_purple")) {
                this.currentSpecs.push("easteregg_purple");
            }
            if(!this.currentSpecs.includes("easteregg_orange")) {
                this.currentSpecs.push("easteregg_orange");
            }
        }

        if(this.currentSpecs.includes("honey_jar")) {
            if(!this.currentSpecs.includes("honey")) {
                this.currentSpecs.push("honey");
            }
        }

        this.gamplayAssetsCounter = 0;
    }

    loadGameplayAssets() {
        if(this.isLoadingStarted) {
            return;
        }

        this.startLoading();

        this.maxGamplayAssets = 0;
        this.loadedGameplayBundlesCount = 0;
        this.areGoalIconsReady = false;

        this.loadBaseBundle();
        this.loadSpecBundle("spec_tiles", false);
        this.loadSpecBundle("big_spec_tiles", false);
        this.loadSpecBundle("statuses", true);

        this.loadGoalIcons();
    }

    startLoading() {
        this.isLoadingStarted = true;

        this.loadingFrame.show();
    }

    stopLoading() {
        this.isLoadingStarted = false;

        this.loadingFrame.hide();
    }

    private checkLoadCompletion(): void {
        this.gamplayAssetsCounter++;

        this.tryFinishGameplayLoading();
    }

    private tryFinishGameplayLoading(): void {
        if(!this.isLoadingStarted) return;

        const areGameplayAssetsReady =
            this.gamplayAssetsCounter >= this.maxGamplayAssets &&
            this.loadedGameplayBundlesCount >= this.gameplayBundlesCount;

        if(!areGameplayAssetsReady || !this.areGoalIconsReady) return;

        this.fieldComp.setAssetsAsLoaded();

        this.field.emit('goal_icons_ready');

        this.stopLoading();
    }

    private loadGoalIcons(): void {
        const finish = (): void => {
            this.areGoalIconsReady = true;

            console.log('[GOAL ICONS] Loading completed');

            this.tryFinishGameplayLoading();
        };

        if(this.currentGoalIcons.length === 0) {
            finish();
            return;
        }

        assetManager.loadBundle('goals', (bundleError, bundle) => {
            if(bundleError || !bundle) {
                console.error('[GOAL ICONS] Bundle loading failed:', bundleError);
                finish();
                return;
            }

            let remaining = this.currentGoalIcons.length;

            const finishIcon = (): void => {
                remaining--;

                if(remaining === 0) {
                    finish();
                }
            };

            for(const iconId of this.currentGoalIcons) {
                const assetPath = `${iconId}_goal/spriteFrame`;
                const cachedIcon = bundle.get(assetPath, SpriteFrame);

                if(cachedIcon?.isValid) {
                    console.log('[GOAL ICONS] Cached:', iconId);
                    finishIcon();
                    continue;
                }

                bundle.load(assetPath, SpriteFrame, (error, spriteFrame) => {
                    if(error || !spriteFrame) {
                        console.error('[GOAL ICONS] Loading failed:', assetPath, error);
                    } else {
                        console.log('[GOAL ICONS] Loaded:', iconId);
                    }

                    finishIcon();
                });
            }
        });
    }

    private loadBaseBundle() {
        if(this.isBaseTilesLoaded) {
            this.loadedGameplayBundlesCount++;

            return;
        }

        this.isBaseTilesLoaded = true;

        assetManager.loadBundle("base_tiles", (err, bundle) => {
            if (err) {
                console.error(`Failed to load bundle: base_tiles`, err);
                return;
            }

            console.log(`Successfully loaded Gameplay bundle: base_tiles`);

            const assets = bundle.getDirWithPath('/', Prefab);

            console.log(`Assets in bundle: ${assets.length}`);

            this.maxGamplayAssets += assets.length;
            this.loadedGameplayBundlesCount++;

            bundle.load("Tile", Prefab, (err, prefab) => {
                if (err) {
                    console.error(`Failed to load prefab: Tile`, err);
                    return;
                }

                console.log(`Successfully loaded prefab: Tile`);

                this.fieldComp.setTilePrefab(prefab);
                this.checkLoadCompletion();
            });

            bundle.load("EmptyTile", Prefab, (err, prefab) => {
                if (err) {
                    console.error(`Failed to load prefab: EmptyTile`, err);
                    return;
                }

                console.log(`Successfully loaded prefab: EmptyTile`);

                this.fieldComp.setEmptyTilePrefab(prefab);
                this.checkLoadCompletion();
            });

            bundle.load("Bomb", Prefab, (err, prefab) => {
                if (err) {
                    console.error(`Failed to load prefab: Bomb`, err);
                    return;
                }

                console.log(`Successfully loaded prefab: Bomb`);

                this.fieldComp.setBombPrefab(prefab);
                this.checkLoadCompletion();
            });

            bundle.load("Rocket", Prefab, (err, prefab) => {
                if (err) {
                    console.error(`Failed to load prefab: Rocket`, err);
                    return;
                }

                console.log(`Successfully loaded prefab: Rocket`);

                this.fieldComp.setRocketPrefab(prefab);
                this.checkLoadCompletion();
            });

            bundle.load("Discoball", Prefab, (err, prefab) => {
                if (err) {
                    console.error(`Failed to load prefab: Discoball`, err);
                    return;
                }

                console.log(`Successfully loaded prefab: Discoball`);

                this.fieldComp.setDiscoballPrefab(prefab);
                this.checkLoadCompletion();
            });
        });
    }

    private loadSpecBundle(bundleName: string, isStatus: boolean) {
        assetManager.loadBundle(bundleName, (err, bundle) => {
            if(err) {
                console.error(`Failed to load bundle: ${bundleName}`, err);
                return;
            }

            const assets = bundle.getDirWithPath('/', Prefab);

            this.maxGamplayAssets += assets.length;
            this.loadedGameplayBundlesCount++;

            assets.forEach(assetInfo => {
                const prefabPath = assetInfo.path;
                const prefabName = prefabPath.toLowerCase();

                if(this.currentSpecs.includes(prefabName)) {
                    bundle.load(prefabPath, Prefab, (err, prefab) => {
                        if(err) {
                            console.error(`Failed to load prefab: ${prefabPath}`, err);
                            this.checkLoadCompletion();
                            return;
                        }

                        if(isStatus) {
                            this.fieldComp.addStatusPrefab(prefab, prefabName);
                        }
                        else {
                            this.fieldComp.addSpecialPrefab(prefab, prefabName);
                        }

                        this.checkLoadCompletion();
                    });
                }
                else {
                    this.checkLoadCompletion();
                }
            });

            this.tryFinishGameplayLoading();
        });
    }
}


