import { DealerPrice } from "../../features/dealer-price/models/dealer-price.model";
import { InventoryDetail } from "../../features/inventory-receipt/models/warehouse-receipt-detail.model";

export function mapInventoryDetailToDealerPrice(details: InventoryDetail[]): DealerPrice[] {
  return details.map(d => ({
    Id: d.Id,
    ProductId: d.ProductId,
    ProductName: d.ProductName,
    ProductCode: d.ProductCode,
    ProductUnit: d.Unit ?? '',   // nếu có field Unit trong InventoryDetail
    Price: 0,                    // default giá = 0
    DealerPriceId: '',
    RowVersionDealerPrice: ''
  })
);
  
}
