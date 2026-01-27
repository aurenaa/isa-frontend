import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import * as SockJS from "sockjs-client";
import { Client } from '@stomp/stompjs'

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    private baseUrl: string = "http://localhost:8080/";
    public videoUpdate$ = new Subject<any>();
    public chatMessage$ = new Subject<any>();
    private stompClient: Client | undefined;

    constructor(private http: HttpClient){
        this.initializeWebSocketConnection();
    }

    initializeWebSocketConnection() {
        const socketUrl = this.baseUrl + "socket";
        this.stompClient = new Client({
            webSocketFactory: () => new SockJS(socketUrl),
            debug: (str) => {},
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.stompClient.onConnect = (frame) => {
            this.stompClient?.subscribe('/socket-publisher/video-views', (message) => {
                if (message.body) {
                    this.videoUpdate$.next(JSON.parse(message.body));
                }
            });
        };
        this.stompClient.activate();
    }

    subscribeToChat(videoId: number) {
        if (this.stompClient && this.stompClient.connected) {
            return this.stompClient.subscribe(`/socket-publisher/video/${videoId}`, (message) => {
                if (message.body) {
                    this.chatMessage$.next(JSON.parse(message.body));
                }
            });
        }
        return null;
    }

    sendChatMessage(chatMsg: any) {
        if (this.stompClient && this.stompClient.connected) {
            this.stompClient.publish({
                destination: `/socket-subscriber/send-message/${chatMsg.videoId}`,
                body: JSON.stringify(chatMsg)
            });
        }
    }

    isConnected(): boolean {
        return this.stompClient ? this.stompClient.connected : false;
    }
}