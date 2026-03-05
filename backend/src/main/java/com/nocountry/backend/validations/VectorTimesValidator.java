package com.nocountry.backend.validations;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.ArrayList;
import java.util.List;

public class VectorTimesValidator implements ConstraintValidator<ValidVectorTimes, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) return true; // campo opcional

        try {
            normalizeVectorTimes(value);
            return true;
        } catch (IllegalArgumentException e) {
            // Reemplazar mensaje default con el mensaje específico del error
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(e.getMessage())
                    .addConstraintViolation();
            return false;
        }
    }

    /**
     * Normaliza vectorTimes completo a formato "ss-ss,ss-ss,..."
     * Puede llamarse desde un @JsonDeserializer o desde un service para normalizar antes de guardar.
     */
    public static String normalizeVectorTimes(String raw) {
        if (raw == null || raw.isBlank()) return null;

        String[] segments = raw.split(",");
        List<String> normalized = new ArrayList<>();

        for (int i = 0; i < segments.length; i++) {
            String segment = segments[i].trim();
            if (segment.isEmpty()) continue;

            String[] parts = segment.split("-", 2);
            if (parts.length != 2) {
                throw new IllegalArgumentException(
                        "Segmento #" + (i + 1) + " inválido: '" + segment + "'. Formato esperado: inicio-fin"
                );
            }

            String startRaw = parts[0].trim();
            String endRaw   = parts[1].trim();

            long startSec = parseToSeconds(startRaw, i + 1, "inicio");
            long endSec   = parseToSeconds(endRaw,   i + 1, "fin");

            if (startSec < 0) {
                throw new IllegalArgumentException(
                        "Segmento #" + (i + 1) + ": el tiempo de inicio no puede ser negativo."
                );
            }
            if (endSec <= startSec) {
                throw new IllegalArgumentException(
                        "Segmento #" + (i + 1) + ": el tiempo de fin (" + endSec +
                                "s) debe ser mayor que el de inicio (" + startSec + "s)."
                );
            }

            normalized.add(startSec + "-" + endSec);
        }

        if (normalized.isEmpty()) {
            throw new IllegalArgumentException("vectorTimes no contiene segmentos válidos.");
        }

        return String.join(",", normalized);
    }

    /**
     * Parsea un tiempo en cualquiera de los formatos soportados a segundos totales.
     *
     * @param time       cadena de tiempo, ej: "1:30", "3:40:25", "90"
     * @param segmentNum número de segmento (para mensajes de error)
     * @param role       "inicio" o "fin" (para mensajes de error)
     * @return segundos totales
     */
    private static long parseToSeconds(String time, int segmentNum, String role) {
        String[] colonParts = time.split(":");

        try {
            return switch (colonParts.length) {
                // Formato: ss
                case 1 -> {
                    long s = Long.parseLong(colonParts[0].trim());
                    validateSeconds(s, segmentNum, role);
                    yield s;
                }
                // Formato: mm:ss
                case 2 -> {
                    long m = Long.parseLong(colonParts[0].trim());
                    long s = Long.parseLong(colonParts[1].trim());
                    validateMinutesSeconds(m, s, segmentNum, role);
                    yield m * 60 + s;
                }
                // Formato: HH:mm:ss
                case 3 -> {
                    long h = Long.parseLong(colonParts[0].trim());
                    long m = Long.parseLong(colonParts[1].trim());
                    long s = Long.parseLong(colonParts[2].trim());
                    validateHoursMinutesSeconds(h, m, s, segmentNum, role);
                    yield h * 3600 + m * 60 + s;
                }
                default -> throw new IllegalArgumentException(
                        "Segmento #" + segmentNum + " - tiempo de " + role +
                                " con formato no reconocido: '" + time + "'"
                );
            };
        } catch (NumberFormatException _) {
            throw new IllegalArgumentException(
                    "Segmento #" + segmentNum + " - tiempo de " + role +
                            " contiene caracteres no numéricos: '" + time + "'"
            );
        }
    }

    private static void validateSeconds(long s, int seg, String role) {
        if (s < 0) throw new IllegalArgumentException(
                "Segmento #" + seg + " - " + role + ": los segundos no pueden ser negativos."
        );
    }

    private static void validateMinutesSeconds(long m, long s, int seg, String role) {
        if (m < 0) throw new IllegalArgumentException(
                "Segmento #" + seg + " - " + role + ": los minutos no pueden ser negativos."
        );
        if (s < 0 || s > 59) throw new IllegalArgumentException(
                "Segmento #" + seg + " - " + role + ": los segundos deben estar entre 0 y 59, se recibió: " + s
        );
    }

    private static void validateHoursMinutesSeconds(long h, long m, long s, int seg, String role) {
        if (h < 0) throw new IllegalArgumentException(
                "Segmento #" + seg + " - " + role + ": las horas no pueden ser negativas."
        );
        if (m < 0 || m > 59) throw new IllegalArgumentException(
                "Segmento #" + seg + " - " + role + ": los minutos deben estar entre 0 y 59, se recibió: " + m
        );
        if (s < 0 || s > 59) throw new IllegalArgumentException(
                "Segmento #" + seg + " - " + role + ": los segundos deben estar entre 0 y 59, se recibió: " + s
        );
    }
}
