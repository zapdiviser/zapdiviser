/**
 * Generated by @openapi-codegen
 *
 * @version 1.0.0
 */
export type CreateProductDto = {
  name: string;
};

export type FlowEventEntity = {
  id: string;
  /**
   * @format date-time
   */
  deleted_at: string;
  /**
   * @format date-time
   */
  created_at: string;
  /**
   * @format date-time
   */
  updated_at: string;
  product_flow: ProductFlowEntity;
  product_flow_id: string;
  type: string;
  sort: number;
  metadata: {
    text?: string;
  };
  times_sent: number;
};

export type ProductFlowEntity = {
  id: string;
  /**
   * @format date-time
   */
  deleted_at: string;
  /**
   * @format date-time
   */
  created_at: string;
  /**
   * @format date-time
   */
  updated_at: string;
  product: ProductEntity;
  product_id: string;
  name: string;
  events: FlowEventEntity[];
};

export type EventsHistoryEntity = {
  id: string;
  /**
   * @format date-time
   */
  deleted_at: string;
  /**
   * @format date-time
   */
  created_at: string;
  /**
   * @format date-time
   */
  updated_at: string;
  instanceId: string;
  to: string;
  product: ProductEntity;
  product_id: string;
};

export type ProductEntity = {
  id: string;
  /**
   * @format date-time
   */
  deleted_at: string;
  /**
   * @format date-time
   */
  created_at: string;
  /**
   * @format date-time
   */
  updated_at: string;
  whatsapps: WhatsappEntity[];
  user: UserEntity;
  user_id: string;
  name: string;
  flows: ProductFlowEntity[];
  eventsHistory: EventsHistoryEntity[];
};

export type RedirectLinkEntity = {
  id: string;
  /**
   * @format date-time
   */
  deleted_at: string;
  /**
   * @format date-time
   */
  created_at: string;
  /**
   * @format date-time
   */
  updated_at: string;
  link: string;
  redirect: RedirectEntity;
};

export type RedirectEntity = {
  id: string;
  /**
   * @format date-time
   */
  deleted_at: string;
  /**
   * @format date-time
   */
  created_at: string;
  /**
   * @format date-time
   */
  updated_at: string;
  name: string;
  slug: string;
  links: RedirectLinkEntity[];
  user: UserEntity;
};

export type MessageEntity = {
  id: string;
  /**
   * @format date-time
   */
  deleted_at: string;
  /**
   * @format date-time
   */
  created_at: string;
  /**
   * @format date-time
   */
  updated_at: string;
  chat: ChatEntity;
  content: Record<string, any>;
  fromMe: boolean;
};

export type ChatEntity = {
  id: string;
  /**
   * @format date-time
   */
  deleted_at: string;
  /**
   * @format date-time
   */
  created_at: string;
  /**
   * @format date-time
   */
  updated_at: string;
  phone: string | null;
  name: string | null;
  user: UserEntity;
  currentWhatsapp: WhatsappEntity;
  messages: MessageEntity[];
  /**
   * @format date-time
   */
  lastInteraction: string | null;
};

export type UserEntity = {
  id: string;
  /**
   * @format date-time
   */
  deleted_at: string;
  /**
   * @format date-time
   */
  created_at: string;
  /**
   * @format date-time
   */
  updated_at: string;
  name: string;
  email: string;
  phone: string;
  is_active?: boolean;
  level: string;
  products: ProductEntity[];
  redirects: RedirectEntity[];
  whatsapps: WhatsappEntity[];
  chats: ChatEntity[];
};

export type WhatsappEntity = {
  id: string;
  /**
   * @format date-time
   */
  deleted_at: string;
  /**
   * @format date-time
   */
  created_at: string;
  /**
   * @format date-time
   */
  updated_at: string;
  phone: string | null;
  profileUrl: string | null;
  status: "PENDING" | "CONNECTING" | "CONNECTED" | "PAUSED" | "BANNED";
  user: UserEntity;
  user_id: string;
  products: ProductEntity[];
  chats: ChatEntity[];
};

export type CreateFlowEventDto = {
  flow_name:
    | "card_approved"
    | "card_declined"
    | "pix_generated"
    | "pix_approved"
    | "cart_abandoned";
  product_id: string;
  metadata: {
    message?: string;
    delay?: number;
  };
  type: "message" | "delay" | "file";
  sort: number;
};

export type UpdateFlowEventDto = {
  metadata: {
    message?: string;
  };
  type: "message" | "delay" | "file";
};

export type SetWhatsappsDto = {
  whatsappId: string;
};

export type Object = {};

export type ForgetPasswordDto = {
  email: string;
};

export type CheckCodeDto = {
  code: string;
  email: string;
};

export type ForgetPasswordWithCodeDto = {
  code: string;
  email: string;
  newPassword: string;
};

export type UpdateUserDto = {
  name: string;
  phone: string;
  has_installed: boolean;
  has_downloaded: boolean;
};

export type UpdatePasswordWithOldPasswordDto = {};

export type UpdatePasswordWithTokenDto = {};

export type Costumer = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

export type CreateUserDto = {
  costumer: Costumer;
};

export type CreateRedirectDto = {
  name: string;
  slug: string;
  links: Record<string, any>[];
};

export type CreateRedirectLinkDto = {
  link: string;
};

export type UpdateRedirectDto = {
  name?: string;
  slug?: string;
  links?: Record<string, any>[];
};

export type UpdateRedirectLinkDto = {
  link?: string;
};
