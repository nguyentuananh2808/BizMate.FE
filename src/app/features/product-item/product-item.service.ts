import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUrls } from '../../config/api.config';

export interface ProductItemInput{
  serialNumber:string;
  qrRawContent?:string;
}

export interface ImportProductItemsRequest{
  productId:string;
  importReceiptDetailId?:string | null;
  note?:string;
  items:ProductItemInput[];
}

export interface ImportProductItemsResponse{
  success:boolean;
  message:string;
  importedCount:number;
  duplicateSerials:string[];
}

@Injectable({
  providedIn:'root'
})
export class ProductItemService {

 constructor(
   private http:HttpClient
 ){}

 ImportSerial(
   productId:string,
   serialNumber:string,
   importReceiptDetailId?:string | null,
   note:string='Scan QR nhập kho'
 ):Observable<ImportProductItemsResponse>{

   const body:ImportProductItemsRequest={
      productId,
      importReceiptDetailId,
      note,
      items:[
        {
          serialNumber,
          qrRawContent:serialNumber
        }
      ]
   };

   console.log('import payload:',body);

   return this.http.post<ImportProductItemsResponse>(
      `${ApiUrls.baseUrl}${ApiUrls.productItem.import}`,
      body
   );
 }

 GetBySN(
   sn:string
 ):Observable<any>{

   return this.http.get<any>(
     `${ApiUrls.baseUrl}${ApiUrls.productItem.getBySN(sn)}`
   );
 }

 GetHistory(
   sn:string
 ):Observable<any>{

   return this.http.get<any>(
      `${ApiUrls.baseUrl}${ApiUrls.productItem.getHistory(sn)}`
   );
 }

}