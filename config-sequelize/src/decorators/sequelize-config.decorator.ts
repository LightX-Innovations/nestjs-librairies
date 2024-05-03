import { Config, ConfigConfig } from "@lightx-innovations/nestjs-config";
import { SequelizeConfigProvider } from "../providers/sequelize.config-provider";

export const SequelizeConfig = (config: Omit<ConfigConfig, "provider"> = {}): ClassDecorator => {
    (config as ConfigConfig).provider = SequelizeConfigProvider.type;
    return Config(config);
};
