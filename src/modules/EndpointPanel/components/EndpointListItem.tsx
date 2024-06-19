// import Radio from "@mui/material/Radio";
// import IconButton from "@mui/material/IconButton";
import { css } from '@mui/material/styles';
// import { Stack } from "common/components/Stack";
// import { TextField } from "common/components/TextField";
// import DeleteIcon from '@mui/icons-material/Delete';
import type { Endpoint } from '../context';

interface Props {
  endpoint: Endpoint;
}

export const EndpointListItem: React.FC<Props> = ({ endpoint }) => {
  return <div />;
  // return (
  //   <Stack
  //     key={endpoint.id}
  //   css={styles.endpoint}
  // >
  //     <Radio
  //       checked={store.selectedItem.get().id === endpoint.id}
  //       onChange={() => store.select(index)}
  //     />
  //     <TextField
  //       css={styles.textField}
  //       getValue={() => endpoint.url}
  //       onChange={(value) => {
  //         store.update(endpoint.id, {
  //           ...endpoint,
  //           url: value,
  //         });
  //       }}
  //     />
  //     {/* TODO: wrap IconButton in common/components */}
  //   <IconButton
  //       aria-label='delete'
  //       onClick={() => store.remove(endpoint.id)}
  //     >
  //       <DeleteIcon />
  //     </IconButton>
  // </Stack>
};

const styles = {
  addButton: css`
    /* background: green; */
  `,
  endpoint: css`
    display: flex;
    flex-direction: row;
    gap: 1em;
    /* flex: 1; */
  `,
  root: css`
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding: 0;
  `,
  textField: css`
    --label: TextField;
    flex: 1;
  `,
};
