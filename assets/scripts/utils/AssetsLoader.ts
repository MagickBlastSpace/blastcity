import { _decorator, Component, Node, assetManager, AssetManager, Prefab } from 'cc';
import { Field } from '../game/Field';
import { UIAssetsLoadingFrame } from '../ui/loading/UIAssetsLoadingFrame';
import { LevelData } from '../data/GameData';
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

    private isLoadingStarted: boolean = false;
    private isBaseTilesLoaded: boolean = false;


    onLoad() {
        AssetsLoader.instance = this;
    }

    start() {
        this.fieldComp = this.field.getComponent("Field");
    }


    initGameplay(level: LevelData) {
        this.currentSpecs = [];

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

        this.loadBaseBundle();
        this.loadSpecBundle("spec_tiles", false);
        this.loadSpecBundle("big_spec_tiles", false);
        this.loadSpecBundle("statuses", true);
    }


    startLoading() {
        this.isLoadingStarted = true;

        this.loadingFrame.show();
    }

    stopLoading() {
        this.isLoadingStarted = false;

        this.loadingFrame.hide();
    }


    private checkLoadCompletion() {
        this.gamplayAssetsCounter++;

        //console.log("Loaded " + this.gamplayAssetsCounter + " gameplay assets from " + this.maxGamplayAssets + " and " + this.loadedGameplayBundlesCount + " gameplay bundles from " + this.gameplayBundlesCount);

        if(this.gamplayAssetsCounter >= this.maxGamplayAssets && this.loadedGameplayBundlesCount >= this.gameplayBundlesCount) {
            this.fieldComp.setAssetsAsLoaded();

            this.stopLoading();
        }
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
            if (err) {
                console.error(`Failed to load bundle: spec_tiles`, err);
                return;
            }

            console.log(`Successfully loaded Gameplay bundle: spec_tiles`);
            
            const assets = bundle.getDirWithPath('/', Prefab);

            console.log(`Assets in bundle: ${assets.length}`);

            this.maxGamplayAssets += assets.length;
            this.loadedGameplayBundlesCount++;

            assets.forEach(assetInfo => {
                const prefabPath = assetInfo.path;
                const prefabName = prefabPath.toLowerCase();

                if(this.currentSpecs.includes(prefabName)) {
                    bundle!.load(prefabPath, Prefab, (err, prefab) => {
                        if (err) {
                            console.error(`Failed to load prefab: ${prefabPath}`, err);
                            return;
                        }
    
                        console.log(`Successfully loaded prefab: ${prefabPath}`);
    
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
        });
    }
}


