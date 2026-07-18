import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
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

interface ChatWidgetPosition {
  left: number;
  top: number;
}

interface ChatDragState {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startLeft: number;
  startTop: number;
  moved: boolean;
  source: 'launcher' | 'panel';
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
export class InventoryChatComponent implements AfterViewInit, AfterViewChecked, OnDestroy {
  @ViewChild('widgetRoot') widgetRoot?: ElementRef<HTMLDivElement>;
  @ViewChild('messageViewport') messageViewport?: ElementRef<HTMLDivElement>;

  question = '';
  isLoading = false;
  isOpen = false;
  isDragging = false;
  isPositionReady = false;
  widgetPosition: ChatWidgetPosition = { left: 0, top: 0 };

  private shouldScrollToBottom = true;
  private dragState?: ChatDragState;
  private suppressLauncherClick = false;
  private readonly edgePadding = 12;
  private readonly dragThreshold = 4;

  readonly quickQuestions = [
    'Tổng quan kho hiện tại',
    'Sản phẩm nào hết hàng?',
    'Sản phẩm nào đang bị giữ?',
    'Sản phẩm nào quản lý serial?',
    'Tuần trước có xuất kho sản phẩm nào?',
    'Tháng trước có nhập kho sản phẩm nào?',
    '7 ngày qua có nhập kho sản phẩm nào?',
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

  ngAfterViewInit(): void {
    this.queueDefaultPosition();
  }

  ngAfterViewChecked(): void {
    if (!this.isOpen || !this.shouldScrollToBottom || !this.messageViewport) return;

    const element = this.messageViewport.nativeElement;
    element.scrollTop = element.scrollHeight;
    this.shouldScrollToBottom = false;
  }

  openChat(): void {
    if (this.suppressLauncherClick) return;

    this.isOpen = true;
    this.shouldScrollToBottom = true;
    this.queueClampToViewport();
  }

  closeChat(): void {
    this.isOpen = false;
    this.queueClampToViewport();
  }

  @HostListener('window:resize')
  handleWindowResize(): void {
    if (!this.isPositionReady) {
      this.queueDefaultPosition();
      return;
    }

    this.queueClampToViewport();
  }

  handleLauncherClick(event: MouseEvent): void {
    if (this.suppressLauncherClick) {
      event.preventDefault();
      event.stopPropagation();
      this.suppressLauncherClick = false;
      return;
    }

    this.openChat();
  }

  startLauncherDrag(event: PointerEvent): void {
    this.startDrag(event, 'launcher');
  }

  startPanelDrag(event: PointerEvent): void {
    const target = event.target as HTMLElement | null;
    if (target?.closest('button, a, input, textarea, select')) return;

    this.startDrag(event, 'panel');
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

  private queueDefaultPosition(): void {
    if (typeof window === 'undefined') return;

    window.requestAnimationFrame(() => {
      const rect = this.getWidgetRect();
      const bottomGap = window.innerWidth < 768 ? 88 : 24;
      this.widgetPosition = this.clampPosition({
        left: window.innerWidth - rect.width - 24,
        top: window.innerHeight - rect.height - bottomGap,
      });
      this.isPositionReady = true;
      this.cdr.detectChanges();
    });
  }

  private queueClampToViewport(): void {
    if (typeof window === 'undefined') return;

    window.requestAnimationFrame(() => {
      this.widgetPosition = this.clampPosition(this.widgetPosition);
      this.isPositionReady = true;
      this.cdr.detectChanges();
    });
  }

  private startDrag(event: PointerEvent, source: ChatDragState['source']): void {
    if (typeof window === 'undefined' || event.button !== 0) return;

    if (!this.isPositionReady) {
      const rect = this.getWidgetRect();
      this.widgetPosition = this.clampPosition({
        left: window.innerWidth - rect.width - 24,
        top: window.innerHeight - rect.height - 24,
      });
      this.isPositionReady = true;
    }

    this.dragState = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startLeft: this.widgetPosition.left,
      startTop: this.widgetPosition.top,
      moved: false,
      source,
    };

    document.addEventListener('pointermove', this.handlePointerMove, { passive: false });
    document.addEventListener('pointerup', this.handlePointerUp);
    document.addEventListener('pointercancel', this.handlePointerUp);
  }

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (!this.dragState || event.pointerId !== this.dragState.pointerId) return;

    const deltaX = event.clientX - this.dragState.startClientX;
    const deltaY = event.clientY - this.dragState.startClientY;
    if (!this.dragState.moved
      && Math.abs(deltaX) < this.dragThreshold
      && Math.abs(deltaY) < this.dragThreshold) {
      return;
    }

    event.preventDefault();
    this.dragState.moved = true;
    this.isDragging = true;
    this.widgetPosition = this.clampPosition({
      left: this.dragState.startLeft + deltaX,
      top: this.dragState.startTop + deltaY,
    });
    this.cdr.detectChanges();
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    if (!this.dragState || event.pointerId !== this.dragState.pointerId) return;

    if (this.dragState.moved && this.dragState.source === 'launcher') {
      this.suppressLauncherClick = true;
    }

    this.dragState = undefined;
    this.isDragging = false;
    this.removeDragListeners();
    this.cdr.detectChanges();
  };

  private clampPosition(position: ChatWidgetPosition): ChatWidgetPosition {
    if (typeof window === 'undefined') return position;

    const rect = this.getWidgetRect();
    const maxLeft = Math.max(this.edgePadding, window.innerWidth - rect.width - this.edgePadding);
    const maxTop = Math.max(this.edgePadding, window.innerHeight - rect.height - this.edgePadding);

    return {
      left: Math.min(Math.max(position.left, this.edgePadding), maxLeft),
      top: Math.min(Math.max(position.top, this.edgePadding), maxTop),
    };
  }

  private getWidgetRect(): DOMRect {
    return this.widgetRoot?.nativeElement.getBoundingClientRect()
      ?? new DOMRect(0, 0, this.isOpen ? 420 : 190, this.isOpen ? 620 : 68);
  }

  private removeDragListeners(): void {
    if (typeof document === 'undefined') return;

    document.removeEventListener('pointermove', this.handlePointerMove);
    document.removeEventListener('pointerup', this.handlePointerUp);
    document.removeEventListener('pointercancel', this.handlePointerUp);
  }

  ngOnDestroy(): void {
    this.removeDragListeners();
  }
}
