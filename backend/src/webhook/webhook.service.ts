import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface MonitorEvent {
  id: string;
  timestamp: string;
  type: 'pod_status' | 'metrics' | 'alert' | 'error';
  source: string;
  podId?: string;
  nodeId?: string;
  data: {
    status?: string;
    cpu?: number;
    memory?: number;
    disk?: number;
    message?: string;
    level?: 'info' | 'warning' | 'error' | 'critical';
  };
}

export interface WebhookSubscription {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
}

@Injectable()
export class WebhookService {
  private events: MonitorEvent[] = [];
  private subscriptions: WebhookSubscription[] = [];

  addEvent(event: Omit<MonitorEvent, 'id' | 'timestamp'>): MonitorEvent {
    const newEvent: MonitorEvent = {
      ...event,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };
    this.events.push(newEvent);
    
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
    
    this.notifySubscribers(newEvent);
    
    return newEvent;
  }

  getEvents(filters?: { type?: string; nodeId?: string; limit?: number }): MonitorEvent[] {
    let result = [...this.events];
    
    if (filters?.type) {
      result = result.filter(e => e.type === filters.type);
    }
    if (filters?.nodeId) {
      result = result.filter(e => e.nodeId === filters.nodeId);
    }
    
    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (filters?.limit) {
      result = result.slice(0, filters.limit);
    }
    
    return result;
  }

  subscribe(subscription: Omit<WebhookSubscription, 'id' | 'createdAt'>): WebhookSubscription {
    const newSub: WebhookSubscription = {
      ...subscription,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    this.subscriptions.push(newSub);
    return newSub;
  }

  unsubscribe(id: string): boolean {
    const index = this.subscriptions.findIndex(s => s.id === id);
    if (index !== -1) {
      this.subscriptions.splice(index, 1);
      return true;
    }
    return false;
  }

  getSubscriptions(): WebhookSubscription[] {
    return [...this.subscriptions];
  }

  private async notifySubscribers(event: MonitorEvent): Promise<void> {
    const activeSubs = this.subscriptions.filter(s => s.active && s.events.includes(event.type));
    
    for (const sub of activeSubs) {
      try {
        console.log(`[Webhook] Notifying ${sub.name}: ${JSON.stringify(event)}`);
      } catch (error) {
        console.error(`[Webhook] Failed to notify ${sub.name}:`, error);
      }
    }
  }
}
