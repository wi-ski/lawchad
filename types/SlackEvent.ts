export interface SlackEvent {
  type: string;
  event_id: string;
  event_time: number;
  team_id: string;
  api_app_id: string;
  event: SlackEventData;
  authorizations?: SlackAuthorization[];
}

export interface SlackEventData {
  type: string;
  channel?: string;
  user?: string;
  text?: string;
  ts?: string;
  thread_ts?: string;
  event_ts?: string;
  channel_type?: 'channel' | 'group' | 'im' | 'mpim';
  subtype?: string;
  bot_id?: string;
  files?: SlackFile[];
  blocks?: SlackBlock[];
}

export interface SlackAuthorization {
  enterprise_id?: string;
  team_id: string;
  user_id: string;
  is_bot: boolean;
  is_enterprise_install: boolean;
}

export interface SlackMessage {
  channel: string;
  text?: string;
  blocks?: SlackBlock[];
  attachments?: SlackAttachment[];
  thread_ts?: string;
  reply_broadcast?: boolean;
  unfurl_links?: boolean;
  unfurl_media?: boolean;
}

export interface SlackBlock {
  type: string;
  block_id?: string;
  elements?: SlackElement[];
  text?: SlackTextObject;
  fields?: SlackTextObject[];
  accessory?: SlackElement;
}

export interface SlackElement {
  type: string;
  action_id?: string;
  text?: SlackTextObject;
  value?: string;
  url?: string;
  style?: 'primary' | 'danger';
  confirm?: SlackConfirmationDialog;
}

export interface SlackTextObject {
  type: 'plain_text' | 'mrkdwn';
  text: string;
  emoji?: boolean;
  verbatim?: boolean;
}

export interface SlackAttachment {
  color?: string;
  fallback?: string;
  title?: string;
  title_link?: string;
  text?: string;
  fields?: SlackAttachmentField[];
  actions?: SlackAction[];
  footer?: string;
  footer_icon?: string;
  ts?: number;
}

export interface SlackAttachmentField {
  title: string;
  value: string;
  short?: boolean;
}

export interface SlackAction {
  type: string;
  text: string;
  url?: string;
  style?: 'default' | 'primary' | 'danger';
  value?: string;
  confirm?: SlackConfirmationDialog;
}

export interface SlackConfirmationDialog {
  title: SlackTextObject;
  text: SlackTextObject;
  confirm: SlackTextObject;
  deny: SlackTextObject;
  style?: 'primary' | 'danger';
}

export interface SlackFile {
  id: string;
  name: string;
  title: string;
  mimetype: string;
  filetype: string;
  size: number;
  url_private: string;
  url_private_download: string;
  permalink: string;
  permalink_public?: string;
}

export interface SlackInteractivePayload {
  type: 'block_actions' | 'interactive_message' | 'dialog_submission' | 'message_action' | 'shortcut';
  token: string;
  team: SlackTeam;
  user: SlackUser;
  channel?: SlackChannel;
  message?: SlackMessage;
  actions?: SlackAction[];
  callback_id?: string;
  trigger_id?: string;
  response_url?: string;
}

export interface SlackTeam {
  id: string;
  domain: string;
}

export interface SlackUser {
  id: string;
  name: string;
  username?: string;
  team_id?: string;
}

export interface SlackChannel {
  id: string;
  name: string;
}

export interface SlackBotConfig {
  token: string;
  signingSecret: string;
  appToken?: string;
  socketMode?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
