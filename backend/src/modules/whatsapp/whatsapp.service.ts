import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { Status, WhatsappEntity } from './entities/whatsapp.entity';
import Docker from 'dockerode';
import { ConfigService } from '@nestjs/config';
import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import crypto from 'crypto';
import BluePromise from 'bluebird';
import { ChatService } from '../chat/chat.service';
import pusher from '@/pusher';

const docker = new Docker({
  // @ts-expect-error as it is not in the types
  Promise: BluePromise,
});

@Injectable()
export class WhatsappService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @InjectRepository(WhatsappEntity)
    protected readonly repository: Repository<WhatsappEntity>,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly chatService: ChatService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async onModuleInit() {
    const whatsapps = await this.repository.find();

    const containersNames = (await docker.listContainers({ all: true })).map(
      (container) => container.Names,
    );

    await BluePromise.map(
      whatsapps.filter((whatsapp) => whatsapp.status === Status.CONNECTED),
      async (whatsapp) => {
        try {
          if (
            containersNames.some((name) =>
              name.some((n) => n.includes(whatsapp.id)),
            )
          ) {
            const container = docker.getContainer(
              `zapdiviser-node-${whatsapp.id}`,
            );

            const { State } = await container.inspect();

            if (!State.Running) {
              await container.start();
            }
          }
        } catch (e) {
          console.log(e);
        }
      },
      { concurrency: 10 },
    );
  }

  async onModuleDestroy() {
    if (this.configService.get('NODE_ENV') !== 'production') {
      const containers = await docker.listContainers({ all: true });
      const containersToStop = containers.filter(
        (container) =>
          container.Names.some((name) => name.startsWith('/zapdiviser-node')) &&
          container.State === 'running',
      );
      await BluePromise.map(
        containersToStop,
        async (container) => {
          try {
            await docker.getContainer(container.Id).stop();
          } catch (e) {
            console.log(e);
          }
        },
        { concurrency: 10 },
      );
    }
  }

  async findAll(user_id: string) {
    return await this.repository.find({
      where: {
        user_id,
      },
    });
  }

  async setWhatsappPhone(id: string, phone: string | null) {
    const whatsapp = await this.repository.findOne({
      where: { id },
    });

    if (!whatsapp) return null;

    whatsapp.phone = phone;
    whatsapp.status = phone !== null ? Status.CONNECTED : Status.PENDING;

    return await this.repository.save(whatsapp);
  }

  async getProductIdFromInstance(instanceId: string) {
    const whatsapp = await this.repository.findOne({
      where: { id: instanceId },
      relations: ['products'],
    });

    if (!whatsapp) return null;

    const products = whatsapp.products;

    return products[products.length - 1].id;
  }

  async isAvailable(id: string) {
    const whatsapp = await this.repository.findOne({
      where: { id },
    });

    return whatsapp?.status === Status.CONNECTED;
  }

  async getByUserId(userId: string) {
    return this.repository.find({
      where: {
        user_id: userId,
      },
    });
  }

  async create(
    userId: string,
    whatsapp?: WhatsappEntity,
  ): Promise<WhatsappEntity> {
    if (!whatsapp) {
      whatsapp = await this.repository.save({
        user_id: userId,
      });
    }

    const id = whatsapp.id;

    const container = await docker.createContainer({
      Image: 'whatsapp',
      name: `zapdiviser-node-${id}`,
      HostConfig: {
        NetworkMode: 'zapdiviser',
      },
      Env: [
        `INSTANCE_ID=${id}`,
        `REDIS_PASSWORD=${this.configService.get('REDIS_PASSWORD')}`,
        `MINIO_ACCESS_KEY=${this.configService.get('MINIO_ACCESS_KEY')}`,
        `MINIO_SECRET_KEY=${this.configService.get('MINIO_SECRET_KEY')}`,
      ],
    });

    await container.start();

    return whatsapp;
  }

  async updateAll() {
    const whatsapps = await this.repository.find({
      where: { status: Status.CONNECTED },
    });

    const containersNames = (await docker.listContainers({ all: true })).map(
      (container) => container.Names,
    );

    await BluePromise.map(
      whatsapps,
      async (whatsapp) => {
        try {
          if (
            containersNames.some((names) =>
              names.some((name) =>
                name.startsWith(`/zapdiviser-node-${whatsapp.id}`),
              ),
            )
          ) {
            if (
              containersNames.some((names) =>
                names.some((name) =>
                  name.startsWith(`/zapdiviser-node-${whatsapp.id}-old`),
                ),
              )
            ) {
              const container = docker.getContainer(
                `zapdiviser-node-${whatsapp.id}-old`,
              );

              if ((await container.inspect()).State.Running) {
                await container.stop();
                await container.remove();
              }
            }

            await docker.getContainer(`zapdiviser-node-${whatsapp.id}`).rename({
              name: `zapdiviser-node-${whatsapp.id}-old`,
            });
          }
        } catch (e) {
          console.log(e);
        }
      },
      { concurrency: 10 },
    );

    await BluePromise.map(
      whatsapps,
      async (whatsapp) => {
        try {
          const container = await docker.createContainer({
            Image: 'whatsapp',
            name: `zapdiviser-node-${whatsapp.id}`,
            HostConfig: {
              NetworkMode:
                this.configService.get('NODE_ENV') !== 'production'
                  ? 'default'
                  : 'zapdiviser',
            },
            Env: [
              `INSTANCE_ID=${whatsapp.id}`,
              `REDIS_URL=${this.configService.get('REDIS_URL')}`,
              `MINIO_ACCESS_KEY=${this.configService.get('MINIO_ACCESS_KEY')}`,
              `MINIO_SECRET_KEY=${this.configService.get('MINIO_SECRET_KEY')}`,
              `MINIO_HOST=${this.configService.get('MINIO_HOST')}`,
              `MINIO_PORT=${this.configService.get('MINIO_PORT')}`,
            ],
          });

          await container.start();
        } catch (e) {
          console.log(e);
        }
      },
      { concurrency: 10 },
    );
  }

  async stopOldWhatsapp(instanceId: string) {
    const containersNames = (await docker.listContainers({ all: true })).map(
      (container) => container.Names,
    );

    if (
      containersNames.some((names) =>
        names.some((name) =>
          name.startsWith(`/zapdiviser-node-${instanceId}-old`),
        ),
      )
    ) {
      const container = docker.getContainer(
        `zapdiviser-node-${instanceId}-old`,
      );

      await container.stop();
      await container.remove();
    }
  }

  async updateCode() {
    const redis = this.redisService.getClient();
    await redis.del('whatsapp-node-code');
  }

  async findOne(id: string, user_id: string) {
    return this.repository.findOne({
      where: {
        id,
        user_id,
      },
    });
  }

  setStatus(id: string, status: Status) {
    return this.repository.update(id, {
      status,
    });
  }

  async getInstance(instanceId: string) {
    return await this.repository.findOneOrFail({
      where: { id: instanceId },
      relations: { user: true },
    });
  }

  async remove(id: string, user_id: string) {
    const whatsapp = await this.repository.findOne({
      where: {
        id,
        user_id,
      },
    });

    await this.chatService.unlinkWhatsapp(user_id, id);

    if (!whatsapp) throw new HttpException('Whatsapp não encontrado', 404);

    try {
      const container = docker.getContainer(`zapdiviser-node-${whatsapp.id}`);
      if ((await container.inspect()).State.Running) {
        await container.stop();
      }
      await container.remove();
    } catch (e) {
      console.log(e);
    }

    whatsapp.products = [];
    await whatsapp.save();

    await this.repository.delete({
      id: whatsapp.id,
    });

    return whatsapp;
  }

  async webhook(payload: any, signature: string) {
    if (!this.verifySignature(payload, signature)) {
      throw new HttpException('Invalid signature', 401);
    }

    const data = JSON.parse(payload);

    if (data.action === 'created') {
      const whatsapp = await this.repository.findOne({
        where: {
          phone: data.issue.title,
        },
      });

      if (whatsapp) {
        await this.repository.update(whatsapp.id, {
          status: Status.CONNECTED,
        });
      }
    }
  }

  private verifySignature(payload: string, signatureHeader: string): boolean {
    const secret = this.configService.get('GITHUB_WEBHOOK_SECRET');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);

    const expectedSignature = `sha256=${hmac.digest('hex')}`;

    return crypto.timingSafeEqual(
      new Uint8Array(Buffer.from(expectedSignature)),
      new Uint8Array(Buffer.from(signatureHeader)),
    );
  }

  async createWhatsapp(instanceId: string) {
    const redis = this.redisService.getClient();
    const hasQRCodeSaved = await redis.get(`whatsapp-${instanceId}-qr`);
    if (!hasQRCodeSaved) return;

    pusher.trigger(
      `whatsapp-${instanceId}`,
      'qr',
      await redis.get(`whatsapp-${instanceId}-qr`),
    );

    return null;
  }
}
