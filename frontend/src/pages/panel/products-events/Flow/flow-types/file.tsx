import { useTheme, styled, Divider } from '@mui/material';
import { Typography } from '@mui/material';
import { useFunnel } from 'contexts/FunnelContext';
import { Document } from 'iconsax-react';
import { Handle, Position } from 'reactflow';

const Header = styled('div')(({ theme }) => ({
  width: '100%',
  background: theme.palette.primary.main,
  padding: '10px',
  fontWeight: 'bold',
  color: theme.palette.primary.lighter,
  display: 'flex',
  justifyContent: 'space-around'
}));

const TypeBox = styled('div')(({ theme }) => ({
  width: '100%',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px',
  color: theme.palette.primary.main,
  marginBottom: '10px'
}));

const mapFileTypes = {
  image: 'imagem',
  video: 'vídeo',
  audio: 'áudio',
  document: 'documento'
};

export function File({ data }: any) {
  const theme = useTheme();

  const { dispatch } = useFunnel();

  return (
    <>
      <div
        onClick={() =>
          dispatch({
            type: 'OPEN_ADD_NEW_FUNNEL_MODAL',
            payload: {
              data: {
                type: 'file',
                file: data?.metadata?.file,
                file_type: data?.metadata?.file_type,
                id: data?.id
              }
            }
          })
        }
        style={{
          background: '#fff',
          borderRadius: '5px',
          boxShadow: `0px 0px 5px 0px ${theme.palette.primary.main}`,
          width: '300px',
          overflow: 'hidden'
        }}
      >
        <Header>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {data?.sended || 0}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Enviados
            </Typography>
          </div>
        </Header>
        <Divider />
        <div
          style={{
            padding: '10px'
          }}
        >
          <TypeBox>
            <Document
              style={{
                marginRight: '10px'
              }}
            />{' '}
            Arquivo de {mapFileTypes[data?.metadata?.file_type as any]}
          </TypeBox>
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          opacity: 0,
          pointerEvents: 'none'
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          opacity: 0,
          pointerEvents: 'none'
        }}
      />
    </>
  );
}
