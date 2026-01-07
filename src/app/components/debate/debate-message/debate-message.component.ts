import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface DebateMessageDTO {
  id?: string;
  electionId: string;
  userId: string;
  username: string;
  message: string;
  timestamp?: string;
  edited?: boolean;
  editedAt?: string;
  deleted?: boolean;
  deletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-debate-message',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './debate-message.component.html',
  styleUrl: './debate-message.component.scss'
})
export class DebateMessageComponent {
  @Input() message!: DebateMessageDTO;
  @Input() currentUserId: string | null = null;
  @Input() isOwnMessage = false;
  @Output() editMessage = new EventEmitter<DebateMessageDTO>();
  @Output() deleteMessage = new EventEmitter<string>();

  onEdit(): void {
    this.editMessage.emit(this.message);
  }

  onDelete(): void {
    if (this.message.id && confirm('Are you sure you want to delete this message?')) {
      this.deleteMessage.emit(this.message.id);
    }
  }

  formatTimestamp(timestamp: string | undefined): string {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
