import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import * as express from "express";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ExportTypes } from "../../models/export-types.model";

@Injectable()
export class DataFileDownloadInterceptor implements NestInterceptor {
    public intercept(context: ExecutionContext, next: CallHandler<Buffer | string>): Observable<void> {
        const type = context.switchToHttp().getRequest<express.Request>().params.type as ExportTypes;
        const res = context.switchToHttp().getResponse<express.Response>();
        return next.handle().pipe(
            map(value => {
                if (type === ExportTypes.XLSX) {
                    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                    res.setHeader("Content-Length", value.length);
                } else if (type === ExportTypes.CSV) {
                    res.setHeader("Content-Type", "text/csv");
                    res.setHeader("Content-Length", value.length);
                } else if (type === ExportTypes.PDF) {
                    res.setHeader("Content-Type", "applications/pdf");
                    res.setHeader("Content-Length", value.length);
                }

                res.send(value);
            })
        );
    }
}
