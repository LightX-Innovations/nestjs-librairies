export abstract class JsonData {
    public toJSON() {
        const jsonObj = Object.assign({}, this);
        const proto = Object.getPrototypeOf(this);
        for (const key of Object.getOwnPropertyNames(proto)) {
            const desc = Object.getOwnPropertyDescriptor(proto, key);
            const hasGetter = desc && typeof desc.get === "function";
            if (hasGetter) {
                (jsonObj as any)[key] = (this as any)[key];
            }
        }
        return jsonObj;
    }
}
