import type { InstructionsVideo } from '@/types/video.types';

interface VideoProcessingOptionsProps {
  value: InstructionsVideo;
  onChange: (instructions: InstructionsVideo) => void;
}

export function VideoProcessingOptions({ value, onChange }: VideoProcessingOptionsProps) {
  const update = (partial: Partial<InstructionsVideo>) => {
    onChange({ ...value, ...partial });
  };

  return (
    <div className="space-y-6">
      {/* Modo de detección */}
      <div>
        <p className="mb-3 text-sm font-semibold text-gray-900">Modo de corte</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Detección de escenas */}
          <button
            type="button"
            onClick={() => update({ withSceneDetector: true })}
            className={`rounded-xl border-2 p-4 text-left transition-all ${
              value.withSceneDetector
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
            <div className="mb-2 flex items-center gap-2">
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                  value.withSceneDetector ? 'border-blue-500' : 'border-gray-300'
                }`}>
                {value.withSceneDetector && <div className="h-2 w-2 rounded-full bg-blue-500" />}
              </div>
              <span className="text-sm font-medium text-gray-900">Detección de escenas</span>
            </div>
            <p className="text-xs text-pretty text-gray-500">
              Detecta cambios de escena automáticamente y genera un short por escena.
            </p>
          </button>

          {/* Por segmentos */}
          <button
            type="button"
            onClick={() => update({ withSceneDetector: false })}
            className={`rounded-xl border-2 p-4 text-left transition-all ${
              !value.withSceneDetector
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
            <div className="mb-2 flex items-center gap-2">
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                  !value.withSceneDetector ? 'border-blue-500' : 'border-gray-300'
                }`}>
                {!value.withSceneDetector && <div className="h-2 w-2 rounded-full bg-blue-500" />}
              </div>
              <span className="text-sm font-medium text-gray-900">Por segmentos</span>
            </div>
            <p className="text-xs text-pretty text-gray-500">
              Divide el video en partes iguales según la cantidad que elijas.
            </p>
          </button>
        </div>
      </div>

      {/* Opciones según modo */}
      {value.withSceneDetector ? (
        <div className="space-y-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Duración por escena
          </p>

          {/* Min duration */}
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

          {/* Max duration */}
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
      ) : (
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
    </div>
  );
}
