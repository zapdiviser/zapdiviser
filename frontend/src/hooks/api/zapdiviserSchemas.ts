/**
 * Generated by @openapi-codegen
 *
 * @version 1.0.0
 */
export type CreateProductDto = {};

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
  instanceId: string;
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
};

export type CreateFlowEventDto = {};

export type UpdateFlowEventDto = {};

export type SetWhatsappsDto = {};

export type Object = {};

export type ForgetPasswordDto = {};

export type CheckCodeDto = {};

export type ForgetPasswordWithCodeDto = {};

export type UpdateUserDto = {};

export type UpdatePasswordWithOldPasswordDto = {};

export type UpdatePasswordWithTokenDto = {};

export type CreateUserDto = {};

export type LoginUserDto = {};

export type CreateRedirectDto = {};

export type CreateRedirectLinkDto = {};

export type UpdateRedirectDto = {};

export type UpdateRedirectLinkDto = {};
