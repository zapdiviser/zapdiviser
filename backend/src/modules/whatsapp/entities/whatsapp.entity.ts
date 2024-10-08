import DefaultEntity from '@/common/defaults/entities/base.entity';
import { ProductEntity } from '@/modules/product/entities/product.entity';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Relation,
} from 'typeorm';
import { ChatEntity } from '../../chat/entities/chat.entity';

export enum Status {
  PENDING = 'PENDING',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  PAUSED = 'PAUSED',
  BANNED = 'BANNED',
}

@Entity('whatsapp')
export class WhatsappEntity extends DefaultEntity {
  @Column({ type: String, nullable: true })
  @ApiProperty({ type: String, nullable: true })
  phone: string | null;

  @Column({ type: String, nullable: true })
  profileUrl: string | null;

  @Column({
    type: String,
    enum: Status,
    default: Status.PENDING,
  })
  status: Status;

  @ManyToOne(() => UserEntity, (user) => user.whatsapps)
  @JoinColumn({ name: 'user_id' })
  user: Relation<UserEntity>;

  @Column()
  user_id: string;

  @ManyToMany(() => ProductEntity, (product) => product.whatsapps)
  products: ProductEntity[];

  @OneToMany(() => ChatEntity, (chat) => chat.currentWhatsapp, {
    onDelete: 'SET NULL',
  })
  chats: ChatEntity[];
}
