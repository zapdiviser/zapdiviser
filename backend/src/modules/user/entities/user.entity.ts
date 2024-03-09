import { Column, Entity, OneToMany } from 'typeorm';
import { ApiHideProperty } from '@nestjs/swagger';
import DefaultEntity from '../../../common/defaults/entities/base.entity';
import { RedirectEntity } from '@/modules/redirects/entities/redirect.entity';
import { WhatsappEntity } from '@/modules/whatsapp/entities/whatsapp.entity';
import { ProductEntity } from '@/modules/product/entities/product.entity';

@Entity('users')
export class UserEntity extends DefaultEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @ApiHideProperty()
  @Column({ select: false, nullable: true })
  password: string;

  @Column()
  phone: string;

  @Column({ default: true })
  is_active?: boolean;

  @Column({
    default: 'user',
  })
  level: string;

  @OneToMany(() => ProductEntity, (funnel) => funnel.user)
  products: ProductEntity[];

  @OneToMany(() => RedirectEntity, (redirect) => redirect.user)
  redirects: RedirectEntity[];

  @OneToMany(() => WhatsappEntity, (whatsapp) => whatsapp.user)
  whatsapps: WhatsappEntity[];
}
