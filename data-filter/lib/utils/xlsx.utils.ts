import { ObjectUtils } from "@lightx-innovations/nestjs-common";
import * as xlsx from "xlsx";

export class XlsxUtils {
    public static arrayToXlsxBuffer(rows: Object[], name: string, header?: string[]): Buffer {
        // Sheet name cannot be longer than 31 chars.
        if (name?.length > 31) {
            name = name.substr(0, 31);
        }

        // Convert to array of array.
        const aoa: any[][] = rows.map((row: Object) => {
            // Replace undefined values.
            ObjectUtils.forEachProperty(row, (value: any) => {
                return value !== null && value !== undefined ? value : "N/A";
            });

            return ObjectUtils.objectToArrayOfProperties(row);
        });

        if (header) {
            aoa.unshift(header);
        }

        let sheet = {};
        sheet[name] = xlsx.utils.aoa_to_sheet(aoa);

        let xlsxContent: string = xlsx.write(
            {
                Sheets: sheet,
                SheetNames: [name],
            },
            {
                type: "binary",
            }
        );

        return Buffer.from(xlsxContent, "binary");
    }
}
