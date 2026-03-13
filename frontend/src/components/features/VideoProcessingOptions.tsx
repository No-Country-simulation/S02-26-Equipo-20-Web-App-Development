import { useState } from 'react';
import type { InstructionsVideo } from '@/types/video.types';
import { Toggle } from '../ui/Toggle';

interface VideoProcessingOptionsProps {
  value: InstructionsVideo;
  onChange: (instructions: InstructionsVideo) => void;
}

type Mode = 'scenes' | 'segments' | 'times';

function getMode(value: InstructionsVideo): Mode {
  if (value.withSceneDetector) return 'scenes';
  if (value.chooseTimes) return 'times';
  return 'segments';
}

export function VideoProcessingOptions({ value, onChange }: VideoProcessingOptionsProps) {
  const [timesError, setTimesError] = useState<string | null>(null);

  const mode = getMode(value);

  const setMode = (m: Mode) => {
    onChange({
      ...value,
      withSceneDetector: m === 'scenes',
      chooseTimes: m === 'times',
      vectorTimes: m === 'times' ? value.vectorTimes : undefined,
      joinTimes: m === 'times' ? value.joinTimes : undefined,
    });
    setTimesError(null);
  };

  const update = (partial: Partial<InstructionsVideo>) => onChange({ ...value, ...partial });

  const handleVectorTimesChange = (raw: string) => {
    update({ vectorTimes: raw || undefined });
    // Validación visual básica: cada segmento debe tener formato inicio-fin
    if (!raw.trim()) {
      setTimesError(null);
      return;
    }
    const segments = raw.split(',').map((s) => s.trim());
    const invalid = segments.some((s) => !/^[\d:]+\s*-\s*[\d:]+$/.test(s));
    setTimesError(invalid ? 'Formato: 0:10-1:30, 2:00-3:15  (o en segundos: 10-90)' : null);
  };

  const modes: { id: Mode; label: string; description: string }[] = [
    {
      id: 'scenes',
      label: 'Detección de escenas',
      description: 'Detecta cambios de escena automáticamente y genera un short por escena.',
    },
    {
      id: 'segments',
      label: 'Por segmentos',
      description: 'Divide el video en partes iguales según la cantidad que elijas.',
    },
    {
      id: 'times',
      label: 'Elegir tiempos',
      description: 'Especificá manualmente los rangos de tiempo que querés recortar.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Selector de modo */}
      <div>
        <p className="mb-3 text-sm font-semibold text-gray-900">Modo de corte</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                mode === m.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
              <div className="mb-2 flex items-center gap-2">
                <div
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                    mode === m.id ? 'border-blue-500' : 'border-gray-300'
                  }`}>
                  {mode === m.id && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                </div>
                <span className="text-sm font-medium text-gray-900">{m.label}</span>
              </div>
              <p className="text-xs text-pretty text-gray-500">{m.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Opciones según modo */}
      {mode === 'scenes' && (
        <div className="space-y-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Duración por escena
          </p>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Duración mínima</label>
              <span className="text-sm font-semibold text-blue-600">{value.minSceneDuration}s</span>
            </div>
            <input
              type="range"
              min={5}
              max={value.maxSceneDuration - 5}
              step={5}
              value={value.minSceneDuration}
              onChange={(e) => update({ minSceneDuration: Number(e.target.value) })}
              className="h-2 w-full cursor-pointer accent-blue-600"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-400">
              <span>5s</span>
              <span>{value.maxSceneDuration - 5}s</span>
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Duración máxima</label>
              <span className="text-sm font-semibold text-blue-600">{value.maxSceneDuration}s</span>
            </div>
            <input
              type="range"
              min={value.minSceneDuration + 5}
              max={120}
              step={5}
              value={value.maxSceneDuration}
              onChange={(e) => update({ maxSceneDuration: Number(e.target.value) })}
              className="h-2 w-full cursor-pointer accent-blue-600"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-400">
              <span>{value.minSceneDuration + 5}s</span>
              <span>120s</span>
            </div>
          </div>
        </div>
      )}

      {mode === 'segments' && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="mb-4 text-xs font-medium tracking-wide text-gray-500 uppercase">
            Cantidad de segmentos
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => update({ numberOfSegments: Math.max(1, value.numberOfSegments - 1) })}
              disabled={value.numberOfSegments <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-xl font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-40">
              -
            </button>
            <div className="text-center">
              <span className="text-4xl font-bold text-blue-600">{value.numberOfSegments}</span>
              <p className="mt-1 text-xs text-gray-500">
                {value.numberOfSegments === 1 ? 'segmento' : 'segmentos'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => update({ numberOfSegments: Math.min(10, value.numberOfSegments + 1) })}
              disabled={value.numberOfSegments >= 10}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-xl font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-40">
              +
            </button>
          </div>
        </div>
      )}

      {mode === 'times' && (
        <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Rangos de tiempo
          </p>

          <div>
            <label htmlFor="vectorTimes" className="mb-1.5 block text-sm font-medium text-gray-700">
              Intervalos a recortar
            </label>
            <input
              id="vectorTimes"
              type="text"
              placeholder="0:10-1:30, 2:00-3:15"
              value={value.vectorTimes ?? ''}
              onChange={(e) => handleVectorTimesChange(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm transition outline-none focus:ring-2 ${
                timesError
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'
              }`}
            />
            {timesError ? (
              <p className="mt-1.5 text-xs text-red-500">{timesError}</p>
            ) : (
              <p className="mt-1.5 text-xs text-gray-400">
                Separar múltiples rangos con coma. Formatos: <code>mm:ss-mm:ss</code>,{' '}
                <code>HH:mm:ss-HH:mm:ss</code> o segundos puros <code>10-90</code>.
              </p>
            )}
          </div>

          <Toggle
            id="joinTimes"
            checked={value.joinTimes ?? false}
            onChange={(checked) => update({ joinTimes: checked })}
            label="Fusionar intervalos solapados"
            description="Si dos rangos se superponen, se unen automáticamente."
          />
        </div>
      )}
    </div>
  );
}
