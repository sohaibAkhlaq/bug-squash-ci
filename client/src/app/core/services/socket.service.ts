import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    // Remove /api from end of url if present to get base url for socket.io
    const baseUrl = environment.apiUrl.replace('/api', '');
    this.socket = io(baseUrl, {
      withCredentials: true
    });
  }

  on(eventName: string): Observable<any> {
    return new Observable(observer => {
      this.socket.on(eventName, (data) => {
        observer.next(data);
      });
    });
  }

  emit(eventName: string, data: any): void {
    this.socket.emit(eventName, data);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
