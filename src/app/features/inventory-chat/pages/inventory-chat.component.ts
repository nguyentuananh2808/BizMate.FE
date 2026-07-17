import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { ToastrService } from 'ngx-toastr';
import { InventoryChatService } from '../services/inventory-chat.service';
import { InventoryChatTable } from '../models/inventory-chat.model';

interface InventoryChatMessage {
  role: 'user' | 'bot';
  text: string;
  createdAt: Date;
  intent?: string;
  table?: InventoryChatTable | null;
  suggestions?: string[];
}

@Component({
  selector: 'inventory-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    NzTableModule,
  ],
  templateUrl: './inventory-chat.component.html',
  styleUrls: ['./inventory-chat.component.scss'],
})
export class InventoryChatComponent implements AfterViewChecked {
  @ViewChild('messageViewport') messageViewport?: ElementRef<HTMLDivElement>;

  question = '';
  isLoading = false;
  isOpen = false;
  private shouldScrollToBottom = true;

  readonly quickQuestions = [
    'camera H5AE còn bao nhiêu?',
    'sản phẩm nào còn tồn dưới 2?',
    'kỹ thuật Tuấn Anh đang giữ hàng gì?',
    'hôm nay có nhập kho sản phẩm nào?',
    'hôm nay có xuất kho sản phẩm nào?',
    'lịch sử sản phẩm H5AE tháng này',
  ];

  messages: InventoryChatMessage[] = [
    {
      role: 'bot',
      text: 'Xin chào, mình là Miu Kho. Bạn cần tra tồn kho, hàng kỹ thuật giữ hay lịch sử nhập xuất cứ hỏi mình nhé.',
      createdAt: new Date(),
      suggestions: this.quickQuestions,
    },
  ];

  constructor(
    private inventoryChatService: InventoryChatService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewChecked(): void {
    if (!this.isOpen || !this.shouldScrollToBottom || !this.messageViewport) return;

    const element = this.messageViewport.nativeElement;
    element.scrollTop = element.scrollHeight;
    this.shouldScrollToBottom = false;
  }

  openChat(): void {
    this.isOpen = true;
    this.shouldScrollToBottom = true;
  }

  closeChat(): void {
    this.isOpen = false;
  }

  askFromSuggestion(question: string): void {
    this.openChat();
    this.question = question;
    this.ask();
  }

  ask(): void {
    const value = this.question.trim();
    if (!value || this.isLoading) return;

    this.appendMessage({
      role: 'user',
      text: value,
      createdAt: new Date(),
    });
    this.question = '';
    this.isLoading = true;
    this.shouldScrollToBottom = true;
    this.cdr.markForCheck();

    this.inventoryChatService.ask(value).subscribe({
      next: (response) => {
        this.appendMessage({
          role: 'bot',
          text: response.Answer || response.Message || 'Không có dữ liệu phù hợp.',
          createdAt: new Date(),
          intent: response.Intent,
          table: response.Table,
          suggestions: response.Suggestions?.length
            ? response.Suggestions
            : this.quickQuestions,
        });
        this.isLoading = false;
        this.shouldScrollToBottom = true;
      },
      error: (err) => {
        const message =
          err.error?.Answer ||
          err.error?.Message ||
          'Không thể hỏi trợ lý kho. Vui lòng thử lại.';

        this.appendMessage({
          role: 'bot',
          text: message,
          createdAt: new Date(),
          suggestions: this.quickQuestions,
        });
        this.isLoading = false;
        this.shouldScrollToBottom = true;
        this.toastr.error(message);
      },
    });
  }

  handleEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.shiftKey) return;

    keyboardEvent.preventDefault();
    this.ask();
  }

  trackMessage(index: number): number {
    return index;
  }

  trackRow(index: number): number {
    return index;
  }

  private appendMessage(message: InventoryChatMessage): void {
    this.messages = [...this.messages, message];
    this.shouldScrollToBottom = true;
    this.cdr.markForCheck();
  }
}
