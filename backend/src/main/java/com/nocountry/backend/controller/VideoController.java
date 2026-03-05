package com.nocountry.backend.controller;

import org.springframework.web.bind.annotation.*;
import com.nocountry.backend.docs.IStandardApiResponses;
import com.nocountry.backend.dto.video.InstructionsVideo;
import com.nocountry.backend.dto.video.JobState;
import com.nocountry.backend.dto.video.VideoInWithVideoOutIds;
import com.nocountry.backend.model.User;
import com.nocountry.backend.service.IVideoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Valid;
import jakarta.validation.Validator;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.ResourceRegion;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/video")
@RequiredArgsConstructor
@Validated
@Tag(
        name = "Video",
        description = "Operaciones para procesamiento, consulta y reproducción de videos del usuario autenticado."
)
public class VideoController implements IStandardApiResponses {

    private final IVideoService videoService;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    @PostMapping(
            value = "/process-video",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<JobState> uploadVideo(
            @RequestPart("file") MultipartFile file,
            @RequestPart("instructions") String instructionsJson,
            @AuthenticationPrincipal User user
    ) {
        InstructionsVideo instructions = objectMapper.readValue(instructionsJson, InstructionsVideo.class);

        Set<ConstraintViolation<InstructionsVideo>> violations = validator.validate(instructions);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(videoService.processVideo(file, instructions, user));
    }

    @Operation(
            summary = "Reprocesar Video",
            description = "Permite al usuario reprocesar un video ya cargado. el procesamiento se ejecuta de forma asíncrona y devuelve el estado del job",
            security = @SecurityRequirement(name = "cookieAuth")
    )
    @ApiResponses(
            value = {
                    @ApiResponse(responseCode = "201", description = "Procesamiento Iniciado")
            }
    )
    @PostMapping(value = "/reprocess-video/{videoInputId}")
    public ResponseEntity<JobState> reprocessVideo(@PathVariable Long videoInputId, @RequestBody @Valid InstructionsVideo instructionsVideo , @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(videoService.reprocessVideo(videoInputId, instructionsVideo, user));
    }

    @Operation(
            summary = "Consultar estado de procesamiento",
            description = "Obtiene el estado actual de un job de procesamiento de video perteneciente al usuario autenticado.",
            security = @SecurityRequirement(name = "cookieAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estado del job obtenido correctamente")
    })
    @GetMapping("/job-status/{idJob}")
    public ResponseEntity<JobState> getJobStatusByIdJob(@PathVariable("idJob") @Min(1) Long idJob, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(videoService.getVideoState(idJob, user));
    }

    @Operation(
            summary = "Consultar jobs del usuario en estado procesando",
            description = "Obtiene todos los jobs en estado procesando del usuario autenticado.",
            security = @SecurityRequirement(name = "cookieAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Recupera todos los jobs con estado procesando con los usuarios")
    })
    @GetMapping("/job-status/processing")
    public ResponseEntity<List<JobState>> getJobsWithStatesProcessing(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(videoService.getJobsProcessing(user));
    }

    @Operation(
            summary = "Listar videos del usuario",
            description = "Obtiene todos los videos subidos por el usuario autenticado junto con sus respectivos IDs de salida.",
            security = @SecurityRequirement(name = "cookieAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de videos obtenida correctamente")
    })
    @GetMapping("/all")
    public ResponseEntity<List<VideoInWithVideoOutIds>> getAllVideos(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(videoService.getAllVideos(user));
    }

    @Operation(
            summary = "Reproducir video procesado",
            description = "Permite realizar streaming del video procesado usando soporte de rangos HTTP (partial content).",
            security = @SecurityRequirement(name = "cookieAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "206", description = "Contenido parcial del video")
    })
    @GetMapping("/output/{videoOutputId}")
    public ResponseEntity<ResourceRegion> streamVideoOut(
            @PathVariable Long videoOutputId,
            @RequestHeader HttpHeaders headers,
            @AuthenticationPrincipal User user
    ) throws IOException {
        return videoService.streamVideoOut(videoOutputId, headers, user);
    }

    @Operation(
            summary = "Reproducir video original",
            description = "Permite realizar streaming del video original usando soporte de rangos HTTP (partial content).",
            security = @SecurityRequirement(name = "cookieAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "206", description = "Contenido parcial del video")
    })
    @GetMapping("/input/{videoInputId}")
    public ResponseEntity<ResourceRegion> streamVideoIn(
            @PathVariable Long videoInputId,
            @RequestHeader HttpHeaders headers,
            @AuthenticationPrincipal User user
    ) throws IOException {
        return videoService.streamVideoIn(videoInputId, headers, user);
    }

    @Operation(
            summary = "Descargar video procesado del usuario",
            description = "Permite al usuario descargar el video procesado solicitado",
            security = @SecurityRequirement(name = "cookieAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Video descargado correctamente")
    })
    @GetMapping("/output/{videoOutputId}/download")
    public ResponseEntity<Resource> downloadVideoOut(
            @PathVariable Long videoOutputId,
            @AuthenticationPrincipal User user
    ) throws IOException {
        return videoService.downloadVideoOut(videoOutputId, user);
    }

    @Operation(
            summary = "Descargar video original del usuario",
            description = "Permite al usuario descargar el video original solicitado",
            security = @SecurityRequirement(name = "cookieAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Video descargado correctamente")
    })
    @GetMapping("/input/{videoInputId}/download")
    public ResponseEntity<Resource> downloadVideoIn(
            @PathVariable Long videoInputId,
            @AuthenticationPrincipal User user
    ) throws IOException {
        return videoService.downloadVideoIn(videoInputId, user);
    }

    @Operation(
            summary = "Elimina video original del usuario",
            description = "Permite al usuario eliminar el video original solicitado",
            security = @SecurityRequirement(name = "cookieAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Video eliminado correctamente")
    })
    @DeleteMapping("/input/{videoInputId}")
    public ResponseEntity<Void> deleteVideoIn(@PathVariable Long videoInputId, @AuthenticationPrincipal User user) {
        videoService.deleteVideoIn(videoInputId, user);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Elimina video procesado del usuario",
            description = "Permite al usuario eliminar el video procesado solicitado",
            security = @SecurityRequirement(name = "cookieAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Video eliminado correctamente")
    })
    @DeleteMapping("/output/{videoOutputId}")
    public ResponseEntity<Void> deleteVideoOut(@PathVariable Long videoOutputId, @AuthenticationPrincipal User user) {
        videoService.deleteVideoOut(videoOutputId,user);
        return ResponseEntity.ok().build();
    }

}
