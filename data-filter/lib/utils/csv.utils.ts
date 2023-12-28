import { ObjectUtils } from "@lightxinnovations/nestjs-common";
import * as csv from "csv-stringify";
import { promisify } from "util";

export class CsvUtils {
    public static async arrayToCsvBuffer(rows: Object[], header?: string[]): Promise<Buffer> {
        // Convert to array of array.
        let aoa: any[][] = rows.map((row: Object) => {
            // Replace undefined values.
            ObjectUtils.forEachProperty(row, (value: any) => {
                return value ? value : "N/A";
            });

            return ObjectUtils.objectToArrayOfProperties(row);
        });

        if (header) {
            aoa.unshift(header);
        }

        const csvAsPromise = promisify<any[][], string>(csv);
        return Buffer.from(await csvAsPromise(aoa));
    }
}
