
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';

interface ParameterSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  tooltip?: string;
  disabled?: boolean;
}

const ParameterSlider: React.FC<ParameterSliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  tooltip,
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')}>
            {label}
          </Label>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <span className="text-sm font-medium">{value}</span>
      </div>
      <Slider
        id={label.toLowerCase().replace(/\s+/g, '-')}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        className={disabled ? "opacity-50 cursor-not-allowed" : ""}
        disabled={disabled}
      />
    </div>
  );
};

export default ParameterSlider;
