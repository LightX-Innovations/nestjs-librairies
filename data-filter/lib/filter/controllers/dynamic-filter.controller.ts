import {
    Body,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Optional,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import { ExportTypes, FilterQueryModel, FilterResultModel, SelectFilterValue } from "../..";
import { FILTER_OPTION } from "../../constant";
import { UserDeserializer } from "../../deserializers";
import { DataFilterUserModel } from "../../models/user.model";
import { FilterOptionConfig } from "../filter.config";
import { FilterService } from "../filter.service";
import { FilterQueryGuard } from "../guards/filter-query.guard";
import { DataFileDownloadInterceptor } from "../interceptors/data-file-download.interceptor";
import { FilterConfigurationSearchModel } from "../models/filter-configuration-search.model";
import { FilterConfigurationModel } from "../models/filter-configuration.model";
import { FilterResourceValueModel } from "../models/filter-resource-value.model";

export abstract class DynamicFilterController<Data> {
    @Inject()
    @Optional()
    private readonly userUserDeserializer!: UserDeserializer<DataFilterUserModel>;

    @Inject(FILTER_OPTION)
    private readonly option!: FilterOptionConfig;

    protected constructor(protected readonly filterService: FilterService<Data>) {}

    @Post("filter")
    @HttpCode(HttpStatus.OK)
    @UseGuards(FilterQueryGuard)
    public async filter(@Body() query: FilterQueryModel, @Req() req: any): Promise<FilterResultModel<Data>> {
        query = this.transformQuery(query, req);
        const user = await this.getUser(req);
        return user ? this.filterService.filter(user, query) : this.filterService.filter(query);
    }

    @Post("filter-count")
    @HttpCode(HttpStatus.OK)
    public async filterCount(@Body() query: FilterQueryModel, @Req() req: any): Promise<number> {
        query = this.transformQuery(query, req);
        const user = await this.getUser(req);
        return user ? this.filterService.count(user, query) : this.filterService.count(query);
    }

    @Post("download/:type")
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(DataFileDownloadInterceptor)
    public async downloadData(
        @Body() query: FilterQueryModel,
        @Param("type") type: ExportTypes,
        @Req() req: any
    ): Promise<Buffer | string> {
        query = this.transformQuery(query, req);
        const user = await this.getUser(req);
        return await this.filterService.downloadData(user, type, query);
    }

    @Get("filter/config")
    public async getFilterConfig(@Req() req: any): Promise<FilterConfigurationModel[]> {
        return await this.filterService.getConfig(req, await this.getUser(req) ?? {} as DataFilterUserModel);
    }

    @Get("filter/config/id")
    public async searchFilterResourceValue(
        @Query() search: FilterResourceValueModel,
        @Req() req: any
    ): Promise<SelectFilterValue | null> {
        return await this.filterService.findResourceValueById(req, search, await this.getUser(req) ?? {} as DataFilterUserModel);
    }

    @Get("filter/config/value")
    public async searchFilterConfigValues(
        @Query() search: FilterConfigurationSearchModel,
        @Req() req: any
    ): Promise<SelectFilterValue[]> {
        return await this.filterService.searchConfigValues(req, search, await this.getUser(req) ?? {} as DataFilterUserModel);
    }

    protected async getUser(req: any): Promise<DataFilterUserModel | null> {
        if (!this.userUserDeserializer || this.option.disableAccessControl) {
            return null;
        }

        return this.userUserDeserializer.deserializeUser(req);
    }

    protected abstract transformQuery(query: FilterQueryModel, req: any): FilterQueryModel;
}
