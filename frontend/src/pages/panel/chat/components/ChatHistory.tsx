import { useCallback, useEffect, useRef } from 'react';

// material-ui
import { Card, CardContent, Grid, Stack, Theme, Typography } from '@mui/material';

// project-imports
import UserAvatar from './UserAvatar';
import ChatMessageAction from './ChatMessageAction';
import IconButton from 'components/@extended/IconButton';

// assets
import { Edit } from 'iconsax-react';

// types
import { ThemeMode } from 'types/config';
import { UserProfile } from 'types/user-profile';
import { useChatControllerGetMessages, useChatControllerGetMedia } from 'hooks/api/zapdiviserComponents';

import { format } from 'date-fns';

// ==============================|| CHAT - HISTORY ||============================== //

interface ChatHistoryProps {
  theme: Theme;
  user: UserProfile;
}

const Content: React.FC<{ content: any }> = ({ content }) => {
  const isFile = content.type === 'file';
  const { data, isLoading } = useChatControllerGetMedia({ queryParams: { id: content.file } }, { enabled: isFile });

  if (isFile && isLoading) return <Typography variant="h6" className='italic'>Carregando...</Typography>;

  switch (content.type) {
    case 'text':
      return <Typography variant="h6">{content.content}</Typography>;
    case 'file':
      switch (content.file_type) {
        case 'image':
          // @ts-ignore
          return <img src={data?.download_url} alt="file" style={{ maxWidth: '100%' }} />;
        case 'document':
          // @ts-ignore
          return <Typography variant="h6">Documento: {data?.download_url}</Typography>;
        case 'video':
          // @ts-ignore
          return <video src={data?.download_url} controls style={{ maxWidth: '100%' }} />;
        case 'audio':
          // @ts-ignore
          return <audio src={data?.download_url} controls style={{ maxWidth: '100%' }} />;
        default:
          return <Typography variant="h6">Este conteúdo não pode ser exibido</Typography>;
      }
    default:
      return <Typography variant="h6">Este conteúdo não pode ser exibido</Typography>;
  }
}

const ChatHistory = ({ theme, user }: ChatHistoryProps) => {
  // scroll to bottom when new message is sent or received
  const wrapper = useRef(document.createElement('div'));
  const el = wrapper.current;
  const scrollToBottom = useCallback(() => {
    el.scrollIntoView(false);
  }, [el])

  const { data } = useChatControllerGetMessages({ pathParams: { id: user.id! } }, { refetchInterval: 1000 })

  useEffect(() => {
    scrollToBottom();
  }, [data?.length, scrollToBottom]);

  return (
    <Grid container spacing={2.5} ref={wrapper}>
      {data?.map((history, index) => (
        <Grid item xs={12} key={history.id}>
          {history.fromMe ? (
            <Stack spacing={1.25} direction="row">
              <Grid container spacing={1} justifyContent="flex-end">
                <Grid item xs={2} md={3} xl={4} />

                <Grid item xs={10} md={9} xl={8}>
                  <Stack direction="row" justifyContent="flex-end" alignItems="flex-start">
                    <ChatMessageAction index={index} />
                    <IconButton size="small" color="secondary">
                      <Edit />
                    </IconButton>
                    <Card
                      sx={{
                        display: 'inline-block',
                        float: 'right',
                        bgcolor: theme.palette.primary.main,
                        boxShadow: 'none',
                        ml: 1
                      }}
                    >
                      <CardContent sx={{ p: 1, pb: '8px !important', width: 'fit-content', ml: 'auto' }}>
                        <Grid container spacing={1}>
                          <Grid item xs={12}>
                            <Content content={history.content} />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Typography align="right" variant="subtitle2" color="textSecondary">
                    {format(new Date(history.created_at), 'dd/MM/yyyy HH:mm')}
                  </Typography>
                </Grid>
              </Grid>
              <UserAvatar user={{ online_status: 'available', avatar: 'avatar-1.png', name: 'User 1' }} />
            </Stack>
          ) : (
            <Stack direction="row" spacing={1.25} alignItems="flext-start">
              <UserAvatar user={{ online_status: user.online_status, avatar: user.avatar, name: user.name }} />

              <Grid container>
                <Grid item xs={12} sm={7}>
                  <Card
                    sx={{
                      display: 'inline-block',
                      float: 'left',
                      bgcolor: theme.palette.mode === ThemeMode.DARK ? 'background.background' : 'common.white',
                      boxShadow: 'none'
                    }}
                  >
                    <CardContent sx={{ p: 1, pb: '8px !important' }}>
                      <Grid container spacing={1}>
                        <Grid item xs={12}>
                          <Content content={history.content} />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Typography align="left" variant="subtitle2" color="textSecondary">
                    {format(new Date(history.created_at), 'dd/MM/yyyy HH:mm')}
                  </Typography>
                </Grid>
              </Grid>
            </Stack>
          )}
        </Grid>
      ))}
    </Grid>
  );
};

export default ChatHistory;
