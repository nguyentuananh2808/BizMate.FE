import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUrls } from '../../../config/api.config';
import {
  InventoryChatRequest,
  InventoryChatResponse,
} from '../models/inventory-chat.model';

@Injectable({ providedIn: 'root' })
export class InventoryChatService {
  constructor(private http: HttpClient) {}

  ask(question: string): Observable<InventoryChatResponse> {
    const body: InventoryChatRequest = { Question: question };
    return this.http.post<InventoryChatResponse>(
      `${ApiUrls.baseUrl}${ApiUrls.inventoryChat.ask}`,
      body
    );
  }
}
