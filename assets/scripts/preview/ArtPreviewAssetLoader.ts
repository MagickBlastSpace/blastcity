import {
    assetManager,
    ImageAsset,
    native,
    Node,
    Sprite,
    SpriteFrame,
    Texture2D,
} from 'cc';

import { NATIVE } from 'cc/env';


type FrameHint = {
    value: string;
    priority: number;
};


type FrameGroup = {
    original: SpriteFrame;
    hints: FrameHint[];
};


type FrameSlot = {
    group: FrameGroup;
    slot: string;
};


export class ArtPreviewAssetLoader {

    private static cache =
        new Map<string, Promise<SpriteFrame | null>>();

    private static loggedPrefabSlots =
        new Set<string>();


    private static isArtPreview(): boolean {
        return (
            NATIVE &&
            (globalThis as any).gamepush?.__artPreview === true
        );
    }


    private static findFile(
        relativePath: string,
    ): string | null {

        if (!NATIVE) {
            return null;
        }

        const normalizedPath =
            relativePath
                .replace(/\\/g, '/')
                .replace(/^\/+/, '');

        const searchPaths =
            native.fileUtils.getSearchPaths();

        for (const searchPath of searchPaths) {

            const root =
                searchPath
                    .replace(/\\/g, '/')
                    .replace(/\/?$/, '/');

            const fullPath =
                root + normalizedPath;

            if (
                native.fileUtils.isFileExist(fullPath)
            ) {
                return fullPath;
            }
        }

        return null;
    }


    private static loadRelative(
        relativePath: string,
    ): Promise<SpriteFrame | null> {

        if (!this.isArtPreview()) {
            return Promise.resolve(null);
        }

        const absolutePath =
            this.findFile(relativePath);

        if (!absolutePath) {
            return Promise.resolve(null);
        }

        const cached =
            this.cache.get(absolutePath);

        if (cached) {
            return cached;
        }

        console.log(
            `[Art Preview Art] loading: ${absolutePath}`,
        );

        const request =
            new Promise<SpriteFrame | null>(
                (resolve) => {

                    assetManager.loadRemote<ImageAsset>(
                        absolutePath,
                        (error, imageAsset) => {

                            if (
                                error ||
                                !imageAsset
                            ) {
                                console.error(
                                    `[Art Preview Art] failed: ${relativePath}`,
                                    error,
                                );

                                resolve(null);

                                return;
                            }

                            const texture =
                                new Texture2D();

                            texture.image =
                                imageAsset;

                            const spriteFrame =
                                new SpriteFrame();

                            spriteFrame.texture =
                                texture;

                            console.log(
                                `[Art Preview Art] loaded: ${relativePath}`,
                            );

                            resolve(spriteFrame);
                        },
                    );
                },
            );

        this.cache.set(
            absolutePath,
            request,
        );

        return request;
    }


    static loadTile(
        category: string,
        id: string,
    ): Promise<SpriteFrame | null> {

        const relativePath =
            `art/tiles/${category}/${id}.png`;

        return this.loadRelative(
            relativePath,
        );
    }


    static async applyPrefabArt(
        root: Node,
        categories: string[],
        id: string,
    ): Promise<void> {

        if (
            !this.isArtPreview() ||
            !root ||
            !root.isValid
        ) {
            return;
        }

        const groups =
            this.collectFrameGroups(root);

        if (groups.length === 0) {
            return;
        }

        const slots =
            this.buildSlots(groups);

        this.logSlotsOnce(
            categories,
            id,
            slots,
        );

        const replacements =
            new Map<SpriteFrame, SpriteFrame>();

        await Promise.all(
            slots.map(
                async ({ group, slot }) => {

                    const result =
                        await this.loadPrefabSlot(
                            categories,
                            id,
                            slot,
                        );

                    if (!result) {
                        return;
                    }

                    replacements.set(
                        group.original,
                        result.spriteFrame,
                    );

                    console.log(
                        `[Art Preview Art] prefab slot loaded: ${result.relativePath}`,
                    );
                },
            ),
        );

        if (
            replacements.size === 0 ||
            !root ||
            !root.isValid
        ) {
            return;
        }

        this.replaceFrameReferences(
            root,
            replacements,
        );
    }


    private static async loadPrefabSlot(
        categories: string[],
        id: string,
        slot: string,
    ): Promise<{
        spriteFrame: SpriteFrame;
        relativePath: string;
    } | null> {

        for (const category of categories) {

            const relativePath =
                `art/tiles/${category}/${id}/${slot}.png`;

            const spriteFrame =
                await this.loadRelative(
                    relativePath,
                );

            if (spriteFrame) {
                return {
                    spriteFrame,
                    relativePath,
                };
            }
        }

        return null;
    }


    private static collectFrameGroups(
        root: Node,
    ): FrameGroup[] {

        const groups =
            new Map<SpriteFrame, FrameGroup>();

        const addFrame = (
            frame: SpriteFrame | null,
            hint: string,
            priority: number,
        ) => {

            if (!frame) {
                return;
            }

            let group =
                groups.get(frame);

            if (!group) {
                group = {
                    original: frame,
                    hints: [],
                };

                groups.set(
                    frame,
                    group,
                );
            }

            if (hint) {
                group.hints.push({
                    value: hint,
                    priority,
                });
            }
        };


        for (
            const currentNode
            of this.collectNodes(root)
        ) {

            const components: any[] = (currentNode as any).components ?? [];

            for (
                const component
                of components
            ) {

                if (!component) {
                    continue;
                }

                if (
                    component instanceof Sprite
                ) {

                    addFrame(
                        component.spriteFrame,
                        this.getRelativeNodePath(
                            root,
                            currentNode,
                        ),
                        10,
                    );

                    continue;
                }

                for (
                    const key
                    of Object.keys(component)
                ) {

                    if (
                        key.startsWith('_')
                    ) {
                        continue;
                    }

                    let value: any;

                    try {
                        value =
                            component[key];
                    }
                    catch {
                        continue;
                    }

                    if (
                        value instanceof SpriteFrame
                    ) {

                        addFrame(
                            value,
                            key,
                            100,
                        );

                        continue;
                    }

                    if (
                        Array.isArray(value)
                    ) {

                        for (
                            let i = 0;
                            i < value.length;
                            i++
                        ) {

                            if (
                                value[i]
                                instanceof SpriteFrame
                            ) {

                                addFrame(
                                    value[i],
                                    `${key}_${i + 1}`,
                                    100,
                                );
                            }
                        }
                    }
                }
            }
        }

        return Array.from(
            groups.values(),
        );
    }


    private static buildSlots(
        groups: FrameGroup[],
    ): FrameSlot[] {

        if (groups.length === 1) {
            return [{
                group: groups[0],
                slot: 'main',
            }];
        }

        const usedNames =
            new Map<string, number>();

        return groups.map(
            (group, index) => {

                const sortedHints =
                    [...group.hints]
                        .sort(
                            (a, b) => {

                                if (
                                    a.priority !==
                                    b.priority
                                ) {
                                    return (
                                        b.priority -
                                        a.priority
                                    );
                                }

                                return (
                                    a.value.length -
                                    b.value.length
                                );
                            },
                        );

                const bestHint =
                    sortedHints[0]?.value ??
                    `slot_${index + 1}`;

                let baseName =
                    this.normalizeSlotName(
                        bestHint,
                    );

                if (!baseName) {
                    baseName =
                        `slot_${index + 1}`;
                }

                const count =
                    (usedNames.get(baseName) ?? 0) + 1;

                usedNames.set(
                    baseName,
                    count,
                );

                const slot =
                    count === 1
                        ? baseName
                        : `${baseName}_${count}`;

                return {
                    group,
                    slot,
                };
            },
        );
    }


    private static replaceFrameReferences(
        root: Node,
        replacements:
            Map<SpriteFrame, SpriteFrame>,
    ): void {

        for (
            const currentNode
            of this.collectNodes(root)
        ) {

            const components: any[] = (currentNode as any).components ?? [];

            for (
                const component
                of components
            ) {

                if (!component) {
                    continue;
                }

                if (
                    component instanceof Sprite
                ) {

                    const currentFrame =
                        component.spriteFrame;

                    if (currentFrame) {

                        const replacement =
                            replacements.get(
                                currentFrame,
                            );

                        if (replacement) {
                            component.spriteFrame =
                                replacement;
                        }
                    }

                    continue;
                }

                for (
                    const key
                    of Object.keys(component)
                ) {

                    if (
                        key.startsWith('_')
                    ) {
                        continue;
                    }

                    let value: any;

                    try {
                        value =
                            component[key];
                    }
                    catch {
                        continue;
                    }

                    if (
                        value instanceof SpriteFrame
                    ) {

                        const replacement =
                            replacements.get(value);

                        if (replacement) {
                            component[key] =
                                replacement;
                        }

                        continue;
                    }

                    if (
                        Array.isArray(value)
                    ) {

                        for (
                            let i = 0;
                            i < value.length;
                            i++
                        ) {

                            if (
                                !(
                                    value[i]
                                    instanceof SpriteFrame
                                )
                            ) {
                                continue;
                            }

                            const replacement =
                                replacements.get(
                                    value[i],
                                );

                            if (replacement) {
                                value[i] =
                                    replacement;
                            }
                        }
                    }
                }
            }
        }
    }


    private static collectNodes(
        root: Node,
    ): Node[] {

        const result: Node[] = [];
        const queue: Node[] = [root];

        while (queue.length > 0) {

            const current =
                queue.shift();

            if (!current) {
                continue;
            }

            result.push(current);

            for (
                const child
                of current.children
            ) {
                queue.push(child);
            }
        }

        return result;
    }


    private static getRelativeNodePath(
        root: Node,
        node: Node,
    ): string {

        if (node === root) {
            return root.name;
        }

        const parts: string[] = [];

        let current: Node | null =
            node;

        while (
            current &&
            current !== root
        ) {

            parts.unshift(
                current.name,
            );

            current =
                current.parent;
        }

        return parts.join('_');
    }


    private static normalizeSlotName(
        value: string,
    ): string {

        return value
            .replace(
                /([a-z0-9])([A-Z])/g,
                '$1_$2',
            )
            .replace(
                /[^A-Za-z0-9]+/g,
                '_',
            )
            .replace(
                /^_+|_+$/g,
                '',
            )
            .toLowerCase();
    }


    private static logSlotsOnce(
        categories: string[],
        id: string,
        slots: FrameSlot[],
    ): void {

        const key =
            `${categories.join('|')}/${id}`;

        if (
            this.loggedPrefabSlots.has(key)
        ) {
            return;
        }

        this.loggedPrefabSlots.add(key);

        console.log(
            `[Art Preview Art] slots ${key}: ` +
            slots
                .map(item => item.slot)
                .join(', '),
        );
    }
}
