import React from 'react';
import { Range, getTrackBackground } from 'react-range';
import { Duration } from '../Duration';
import { PlayerThemeOptions } from '../Player';

export interface Props {
  rangeStep: number;
  rangeMin: number;
  rangeMax: number;
  played: number;
  loaded: number;
  duration: number;
  isPlaying: boolean;
  themeOptions: PlayerThemeOptions;
  trackThumbStyle: React.CSSProperties;
  trackLabelStyle: React.CSSProperties;
  onRangeChange(values: number[]): void;
  onRangeFinalChange(values: number[]): void;
  hideProgressTime: boolean;
}

export const ProgressControl: React.FC<Props> = ({
  rangeStep,
  rangeMin,
  rangeMax,
  played,
  onRangeChange,
  onRangeFinalChange,
  loaded,
  duration,
  isPlaying,
  themeOptions,
  trackThumbStyle,
  trackLabelStyle,
  hideProgressTime
}) => {
  return (
    <div className="Player__progress-container">
      {!hideProgressTime && (
        <div className={`Player__progress-time Player__progress-time--played ${isPlaying ? 'is-playing' : ''}`}>
          <Duration seconds={duration * played} />
        </div>
      )}

      <div className="Player__progress-control-container">
        <Range
          step={rangeStep}
          min={rangeMin}
          max={rangeMax}
          values={[played]}
          onChange={onRangeChange}
          onFinalChange={onRangeFinalChange}
          renderTrack={({ props, children }) => (
            <div onMouseDown={props.onMouseDown} onTouchStart={props.onTouchStart} className="Player__range-track-container">
              <div
                ref={props.ref}
                style={{
                  ...props.style,
                  background: getTrackBackground({
                    values: [played, loaded],
                    colors: [themeOptions.trackBackgroundColor, '#ccc', '#e5e5e5'],
                    min: rangeMin,
                    max: rangeMax
                  })
                }}
                className="Player__range-track-inner">
                  {children}
                </div>
            </div>

          )}
          renderThumb={({ props, isDragged }) => (
            <div {...props} className="Player__range-thumb-container">
              <div
                className={`Player__range-thumb ${isDragged ? 'Player__range-thumb--is-dragging' : ''}`}
                style={trackThumbStyle}
              ></div>
              {isDragged && (
                <div className="Player__range-thumb-label" style={trackLabelStyle}>
                  <Duration seconds={duration * played} />
                </div>
              )}
            </div>
          )}
        />
      </div>

      {!hideProgressTime && (
        <div className={`Player__progress-time Player__progress-time--remaining ${isPlaying ? 'is-playing' : ''}`}>
          <Duration seconds={duration * (1 - played)} />
        </div>
      )}
    </div>
  )
}
