import { ResourceEventAccessControlService } from "@recursyve/nestjs-access-control";
import { Document, Schema } from "mongoose";

export function accessControlPlugin(schema: Schema, { service }: { service: ResourceEventAccessControlService<any> }) {
    schema.pre("save", function(next) {
        this.$wasCreated = this.$isNew;
        next();
    });

    schema.post(["save"], async (doc: Document, next) => {
        if ((doc as any).$wasCreated) {
            const session = doc.$session();
            if (session && session.afterCommit) {
                session.afterCommit.subscribe(() => service.onResourceCreated(`${doc.collection.name}-mongoose`, doc));
            } else {
                await service.onResourceCreated(`${doc.collection.name}-mongoose`, doc);
            }
        }
        next();
    });
}
