import * as React from 'react';
import VolumeUp from '@mui/icons-material/VolumeUp';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import MuiInput from '@mui/material/Input';
import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

const Input = styled(MuiInput)`
  width: 42px;
`;

const InputSlider = () => {
  const [value, setValue] = React.useState(30);

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    setValue(newValue as number);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value === '' ? 0 : Number(event.target.value));
  };

  const handleBlur = () => {
    if (value < 0) {
      setValue(0);
    } else if (value > 100) {
      setValue(100);
    }
  };

  return (
    <Box sx={{ width: 250 }}>
      <Typography
        gutterBottom
        id='input-slider'
      >
        Volume
      </Typography>
      <Grid
        container
        alignItems='center'
        spacing={2}
      >
        <Grid item>
          <VolumeUp />
        </Grid>
        <Grid
          item
          xs
        >
          <Slider
            aria-labelledby='input-slider'
            value={typeof value === 'number' ? value : 0}
            onChange={handleSliderChange}
          />
        </Grid>
        <Grid item>
          <Input
            size='small'
            value={value}
            inputProps={{
              step: 10,
              min: 0,
              max: 100,
              type: 'number',
              'aria-labelledby': 'input-slider',
            }}
            onBlur={handleBlur}
            onChange={handleInputChange}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default InputSlider;
