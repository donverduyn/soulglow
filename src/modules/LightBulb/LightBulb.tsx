import * as React from 'react';
import { blue, green, grey, red } from '@mui/material/colors';
import { css, styled } from '@mui/material/styles';
import { Observer, observer } from 'mobx-react-lite';
import { useMobx } from 'common/hooks/useMobx';
import { memoize } from 'common/utils/memoize';
import { LightMode } from './components/constants';
import { InputSlider } from './components/InputSlider';
import { LightModeSelect } from './components/LightModeSelect';
import { OnOffSwitch } from './components/OnOffSwitch';

const memoizedCss = memoize(css);

/* eslint-disable typescript-sort-keys/interface */
interface Color {
  r: number;
  g: number;
  b: number;
}
/* eslint-enable typescript-sort-keys/interface */

interface LightBulbState {
  brightness: number;
  bulb_mode: LightMode;
  color: Color;
  color_temp: number;
  isOn: boolean;
}

const defaultState: LightBulbState = {
  brightness: 79,
  bulb_mode: LightMode.COLOR,
  color: { b: 167, g: 25, r: 255 },
  color_temp: 100,
  isOn: true,
};

const handleSubmit = () => {
  // e.preventDefault();
  // try {
  //   const response = await fetch('/api/gateways/desk-light', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(lightBulb),
  //   });
  //   console.log('Response:', await response.json());
  // } catch (error) {
  //   console.error('Error:', error);
  // }
};

interface LightBulbProps extends DefaultProps {}

// eslint-disable-next-line react-refresh/only-export-components
const LightBulbBase: React.FC<LightBulbProps> = observer(({ className }) => {
  const bulb = useMobx(() => ({ ...defaultState }));
  console.log(memoizedCss({ color: grey[100] }));
  return (
    <section className={className}>
      <form onSubmit={handleSubmit}>
        <OnOffSwitch
          getValue={bulb.lazyGet('isOn')}
          onChange={bulb.set('isOn')}
        />
        <LightModeSelect
          getValue={bulb.lazyGet('bulb_mode')}
          onChange={bulb.set('bulb_mode')}
        />
        {/* eslint-disable react/jsx-curly-newline */}
        <Observer>
          {() =>
            bulb.bulb_mode === LightMode.WHITE ? (
              <>
                <InputSlider
                  getValue={bulb.lazyGet('color_temp')}
                  label='color temp'
                  onChange={bulb.set('color_temp')}
                  track={false}
                  css={memoizedCss({
                    '& .MuiSlider-rail': {
                      backgroundImage:
                        'linear-gradient(to right, #ffd27f, #ffffff 50%, #9abad9)',
                      opacity: 1,
                    },
                    color: grey[800],
                  })}
                />
                <InputSlider
                  css={memoizedCss({ color: grey[800] })}
                  getValue={bulb.lazyGet('brightness')}
                  label='brightness'
                  onChange={bulb.set('brightness')}
                />
              </>
            ) : null
          }
        </Observer>
        <Observer>
          {() =>
            bulb.bulb_mode === LightMode.COLOR ? (
              <>
                <InputSlider
                  css={memoizedCss({ '--color': red[500] })}
                  getValue={bulb.lazyGet('color.r')}
                  label='red'
                  onChange={bulb.set('color.r')}
                />
                <InputSlider
                  css={memoizedCss({ color: green[500] })}
                  getValue={bulb.lazyGet('color.g')}
                  label='green'
                  onChange={bulb.set('color.g')}
                />
                <InputSlider
                  css={memoizedCss({ color: blue[500] })}
                  getValue={bulb.lazyGet('color.b')}
                  label='blue'
                  onChange={bulb.set('color.b')}
                />
              </>
            ) : null
          }
        </Observer>
        {/* eslint-enable react/jsx-curly-newline */}
      </form>
    </section>
  );
});

export default styled(LightBulbBase)`
  align-items: center;
  background: ${({ theme }) => theme.palette.background.paper};
  /* border-radius: 0.25em; */
  display: block;
  padding: 1.75em 1.5em;
  width: 15em;
  & form {
    align-items: left;
    display: flex;
    flex-direction: column;
    gap: 1em;
  }
`;
