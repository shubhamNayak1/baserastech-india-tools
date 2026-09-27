import { createFormTool } from '@/components/form-tool/FormTool';
import { formatNumber } from '@/utils/format';
import { InputError } from '@/utils/number';
import { Converter } from './Converter';
import {
  ANGLE,
  AREA,
  DATA,
  ENERGY,
  FREQUENCY,
  FUEL,
  LENGTH,
  POWER,
  PRESSURE,
  SPEED,
  TEMPERATURE,
  TIME,
  VOLUME,
  WEIGHT,
  type Quantity,
} from './units';

const make = (q: Quantity) => {
  function QuantityConverter() {
    return <Converter q={q} />;
  }
  return QuantityConverter;
};

export const LengthConverter = make(LENGTH);
export const WeightConverter = make(WEIGHT);
export const TemperatureConverter = make(TEMPERATURE);
export const AreaConverter = make(AREA);
export const VolumeConverter = make(VOLUME);
export const SpeedConverter = make(SPEED);
export const TimeConverter = make(TIME);
export const DataStorageConverter = make(DATA);
export const EnergyConverter = make(ENERGY);
export const PowerConverter = make(POWER);
export const PressureConverter = make(PRESSURE);
export const FuelEconomyConverter = make(FUEL);
export const FrequencyConverter = make(FREQUENCY);
export const AngleConverter = make(ANGLE);

type HeightValues = { mode: string; feet: number; inches: number; cm: number };
export const HeightConverter = createFormTool<HeightValues>({
  fields: [
    {
      name: 'mode',
      label: 'Convert',
      type: 'segmented',
      default: 'imperial',
      full: true,
      options: [
        { value: 'imperial', label: 'Feet & inches → cm' },
        { value: 'metric', label: 'cm → Feet & inches' },
      ],
    },
    {
      name: 'feet',
      label: 'Feet',
      type: 'number',
      default: 5,
      min: 0,
      max: 12,
      integer: true,
      unit: 'ft',
      showIf: (v) => v.mode === 'imperial',
    },
    {
      name: 'inches',
      label: 'Inches',
      type: 'number',
      default: 7,
      min: 0,
      max: 11.99,
      unit: 'in',
      showIf: (v) => v.mode === 'imperial',
    },
    {
      name: 'cm',
      label: 'Height in centimetres',
      type: 'number',
      default: 170,
      min: 1,
      max: 300,
      unit: 'cm',
      showIf: (v) => v.mode === 'metric',
    },
  ],
  compute: (v) => {
    const cm = v.mode === 'imperial' ? (v.feet * 12 + v.inches) * 2.54 : v.cm;
    if (!(cm > 0))
      throw new InputError(
        'Height must be greater than zero.',
        v.mode === 'imperial' ? 'feet' : 'cm',
      );
    const totalIn = cm / 2.54;
    let ft = Math.floor(totalIn / 12);
    let inch = Math.round((totalIn - ft * 12) * 10) / 10;
    if (inch >= 12) {
      ft += 1;
      inch -= 12;
    }
    return {
      results: [
        v.mode === 'imperial'
          ? {
              label: `${v.feet}′ ${formatNumber(v.inches, 2)}″ in centimetres`,
              value: `${formatNumber(cm, 1)} cm`,
              primary: true,
            }
          : {
              label: `${formatNumber(v.cm, 1)} cm in feet and inches`,
              value: `${ft}′ ${formatNumber(inch, 1)}″`,
              primary: true,
            },
        { label: 'Metres', value: `${formatNumber(cm / 100, 3)} m` },
        { label: 'Total inches', value: `${formatNumber(totalIn, 2)} in` },
        { label: 'Feet (decimal)', value: `${formatNumber(totalIn / 12, 3)} ft` },
      ],
    };
  },
});
