import { Controller, Get, Post, Delete, Body, Param, Query, Res } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { Subject } from 'rxjs';
import { Response } from 'express';

@Controller('webhook')
export class WebhookController {
  private metricsUpdates = new Subject<any>();

  constructor(private readonly webhookService: WebhookService) {}

  @Get('stream')
  metricsStream(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

    const heartbeat = setInterval(() => {
      res.write(`: heartbeat\n\n`);
    }, 30000);

    const subscription = this.metricsUpdates.subscribe({
      next: (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      },
      error: (err) => {
        console.error('SSE error:', err);
        clearInterval(heartbeat);
        res.end();
      }
    });

    res.on('close', () => {
      clearInterval(heartbeat);
      subscription.unsubscribe();
    });
  }

  @Get('subscriptions')
  getSubscriptions() {
    return this.webhookService.getSubscriptions();
  }

  @Get('events')
  getEvents(@Query() query: { type?: string; nodeId?: string; limit?: string }) {
    return this.webhookService.getEvents({
      type: query.type,
      nodeId: query.nodeId,
      limit: query.limit ? parseInt(query.limit) : undefined,
    });
  }

  @Post('events')
  receiveEvent(@Body() event: {
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
  }) {
    return this.webhookService.addEvent(event);
  }

  @Post('subscribe')
  subscribe(@Body() data: { name: string; url: string; events: string[]; active?: boolean }) {
    return this.webhookService.subscribe({
      name: data.name,
      url: data.url,
      events: data.events,
      active: data.active ?? true,
    });
  }

  @Delete('subscribe/:id')
  unsubscribe(@Param('id') id: string) {
    const success = this.webhookService.unsubscribe(id);
    return { success };
  }

  @Post('metrics')
  receiveMetrics(@Body() data: {
    nodeId: string;
    podIndex: number;
    status?: string;
    cpu?: number;
    memory?: number;
    disk?: number;
    message?: string;
    level?: string;
  }) {
    const metrics = {
      nodeId: data.nodeId,
      podIndex: data.podIndex,
      status: data.status,
      cpu: data.cpu,
      memory: data.memory,
      disk: data.disk,
      timestamp: new Date().toISOString()
    };

    this.metricsUpdates.next(metrics);

    this.webhookService.addEvent({
      type: 'metrics',
      source: data.nodeId,
      podId: `${data.nodeId}-pod-${data.podIndex}`,
      nodeId: data.nodeId,
      data: {
        status: data.status,
        cpu: data.cpu,
        memory: data.memory,
        disk: data.disk,
        message: data.message,
        level: data.level as any,
      }
    });

    return { success: true, metrics };
  }
}
