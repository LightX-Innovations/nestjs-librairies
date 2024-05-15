import { Injectable, Type } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { IDatabaseAdapter } from "../adapters";
import { DATABASE_ADAPTER_METADATA } from "../decorators/constant";
import { DatabaseAdapterConfig } from "../models/database-adapter-config.model";

@Injectable()
export class DatabaseAdaptersRegistry {
    private registry: Map<string, IDatabaseAdapter> = new Map<string, IDatabaseAdapter>();

    constructor(private readonly moduleRef: ModuleRef) {}

    public registerAdapters(...adapters: Type<IDatabaseAdapter>[]): void {
        adapters.forEach(policy => this.registerAdapter(policy));
    }

    private registerAdapter(adapter: Type<IDatabaseAdapter>): void {
        const instance = this.moduleRef.get(adapter, { strict: false });
        if (!instance) {
            return;
        }

        const config = this.reflectModel(adapter);
        this.registry.set(config.type, instance);
    }

    private reflectModel(policy: Type<IDatabaseAdapter>): DatabaseAdapterConfig {
        return Reflect.getMetadata(DATABASE_ADAPTER_METADATA, policy);
    }

    public getAdapter(type?: string): IDatabaseAdapter {
        if (!type) {
            throw new Error(`You must provide a type`);
        }

        const adapter =  this.registry.get(type);
        if (!adapter) {
            throw new Error(`No database adapters found for type ${type}`);
        }

        return adapter;
    }

    public getModels(): any[] {
        const models = [];
        for (const [_, adapter] of this.registry) {
            models.push(...adapter.getModels());
        }
        return models;
    }
}
