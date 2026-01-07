import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TextFieldModule } from '@angular/cdk/text-field';

@Component({
  selector: 'app-debate-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TextFieldModule
  ],
  templateUrl: './debate-input.component.html',
  styleUrl: './debate-input.component.scss'
})
export class DebateInputComponent {
  @Input() disabled = false;
  @Input() sending = false;
  @Output() sendMessage = new EventEmitter<string>();

  messageText = '';

  onSend(): void {
    if (this.messageText.trim() && !this.disabled && !this.sending) {
      this.sendMessage.emit(this.messageText.trim());
      this.messageText = '';
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    // Send on Enter, new line on Shift+Enter
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }
}
