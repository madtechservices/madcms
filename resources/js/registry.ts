import type { ModuleTypeDefinition } from './types';

export type ModuleRegistry = {
    register: (definition: ModuleTypeDefinition) => ModuleRegistry;
    unregister: (type: string) => boolean;
    get: (type: string) => ModuleTypeDefinition | undefined;
    has: (type: string) => boolean;
    all: () => ModuleTypeDefinition[];
};

export function createModuleRegistry(initial: ModuleTypeDefinition[] = []): ModuleRegistry {
    const definitions = new Map<string, ModuleTypeDefinition>();

    const registry: ModuleRegistry = {
        register(definition) {
            const type = definition.type.trim();
            if (!type) throw new Error('MAD CMS module types require a non-empty type.');

            definitions.set(type, { ...definition, type });
            return registry;
        },
        unregister(type) {
            return definitions.delete(type);
        },
        get(type) {
            return definitions.get(type);
        },
        has(type) {
            return definitions.has(type);
        },
        all() {
            return [...definitions.values()];
        },
    };

    initial.forEach((definition) => registry.register(definition));

    return registry;
}
