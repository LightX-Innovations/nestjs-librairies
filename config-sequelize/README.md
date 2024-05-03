# Config sequelize

An extension for the `@lightx-innovations/nestjs-config` library, which adds a Sequelize provider, which is used to fetch
variables from a database.

## Getting started

### Install
```
npm i --save @lightx-innovations/nestjs-config-sequelize
```

### example
``` ts
@SequelizeConfig()
class VariableEnvTest {

    @Variable(false)
    DB_HOST: string;

    @Variable({
        variableName: "DB_NAME",
        required: false
    })
    dbName: string;

    @Variable
    DB_PORT: string;
}
```
``` ts
@Module({
    imports: [
        SequelizeModule.forRoot({ ... }),
        ConfigModule.forRoot(VariableEnvTest),
        ConfigSequelizeModule.forRoot(),
    ]
})
export class AppModule {}
```


