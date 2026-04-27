import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

export interface ProductItem {
  Id: string;
  Code?: string;
  ProductId: string;
  ProductName?: string;
  ProductCode?: string;
  SerialNumber: string;
  Status: number;
  StatusName: string;
  ImportReceiptDetailId?: string | null;
  OrderDetailId?: string | null;
  SoldAt?: Date | string | null;
  CreatedDate?: Date | string;
  UpdatedDate?: Date | string;
}

export interface GetProductItemsResponse {
  ProductItems: ProductItem[];
  TotalCount: number;
  Success?: boolean;
  Message?: string;
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

 GetByProduct(
   productId:string,
   status?:number | null,
   keyword?:string | null,
   pageIndex:number=1,
   pageSize:number=20
 ):Observable<GetProductItemsResponse>{

   let params = new HttpParams()
     .set('productId', productId)
     .set('pageIndex', pageIndex)
     .set('pageSize', pageSize);

   if(status !== null && status !== undefined){
     params = params.set('status', status);
   }

   if(keyword){
     params = params.set('keyword', keyword);
   }

   return this.http.get<GetProductItemsResponse>(
     `${ApiUrls.baseUrl}${ApiUrls.productItem.getByProduct}`,
     { params }
   );
 }

}
