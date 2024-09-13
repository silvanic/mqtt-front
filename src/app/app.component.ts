import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import mqtt from 'mqtt';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'mqtt-front';
  private client: mqtt.MqttClient | undefined;
  username: string = '';
  error: string = '';
  message: string = '';
  messages: string[] = [];

  ngOnInit(): void {}

  sendMessage() {
    if (this.client) {
      const message = {
        username: this.username,
        message: this.message,
      };
      this.client.publish('chat', JSON.stringify(message));
    }
  }

  isOnline() {
    return this.client && this.client?.connected;
  }

  login() {
    if (this.username) {
      this.error = '';

      // this.client = mqtt.connect('http://localhost:8888', {
      this.client = mqtt.connect('ws://mqtt-back.onrender.com', {
        username: this.username,
      });

      this.client.on('error', (error) => {
        console.log('error', error.cause, error.message, error.name);
        this.error = error.message;
        this.client?.end();
      });

      this.client.on('connect', () => {
        console.log('Connecté au broker MQTT');
        // S'abonner au topic "chat"
        if (this.client) {
          this.client.subscribe('chat', function (err: any) {
            if (!err) {
              console.log('Abonné au topic "chat"');
            } else {
              console.log(err);
            }
          });
        }
      });

      // Recevoir les messages
      this.client.on('message', (topic: any, message: any) => {
        try {
          const data = JSON.parse(message);
          // Afficher les messages reçus
          this.messages.push(`[${topic}] ${data.username} : ${data.message}`);
        } catch (err) {
          this.messages.push(`[${topic}] : ${message}`);
        }
      });
    }
  }
}
