declare module "#app" {
    interface PageMeta {
        guards: string[];
    }
}

// It is always important to ensure you import/export something when augmenting a type
export {};
