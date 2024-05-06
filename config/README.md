# Config

## Features
- access .env variable through decorator

## Getting started

### Install
```
npm i --save @lightx-innovations/nestjs-librairies
```

### example
``` ts
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
@Module({imports: [ConfigModule.forRoot(VariableEnvTest)]})
export class AppModule {}
```


