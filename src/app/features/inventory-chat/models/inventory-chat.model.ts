export interface InventoryChatColumn {
  Key: string;
  Label: string;
}

export interface InventoryChatTable {
  Title: string;
  Columns: InventoryChatColumn[];
  Rows: Record<string, string>[];
}

export interface InventoryChatRequest {
  Question: string;
}

export interface InventoryChatResponse {
  Success: boolean;
  Message?: string;
  Intent: string;
  Answer: string;
  Table?: InventoryChatTable | null;
  Suggestions: string[];
}
