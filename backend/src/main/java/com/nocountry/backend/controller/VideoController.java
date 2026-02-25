package com.nocountry.backend.controller;

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
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.support.ResourceRegion;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

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

    @Operation(
            summary = "Procesar video",
            description = "Permite subir un archivo de video junto con instrucciones de procesamiento. " +
                    "El procesamiento se ejecuta de forma asíncrona y devuelve el estado inicial del job.",
            security = @SecurityRequirement(name = "cookieAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Video recibido y procesamiento iniciado")
    })
    @PostMapping(value = "/process-video",consumes = "multipart/form-data")
    public ResponseEntity<JobState> uploadVideo(
            @RequestPart("file") MultipartFile file,
            @RequestPart("instructions") @Valid InstructionsVideo instructions,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(videoService.processVideo(file,instructions,user));
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
    public ResponseEntity<JobState> getJobStatus(@PathVariable("idJob") @Min(1) Long idJob,@AuthenticationPrincipal User user){
        return ResponseEntity.ok(videoService.getVideoState(idJob,user));
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
    public ResponseEntity<ResourceRegion> streamVideo(
            @PathVariable Long videoOutputId,
            @RequestHeader HttpHeaders headers,
            @AuthenticationPrincipal User user
    ) throws IOException {
        return videoService.streamVideo(videoOutputId, headers, user);
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
    public ResponseEntity<List<VideoInWithVideoOutIds>> getAllVideos(@AuthenticationPrincipal User user){
        return ResponseEntity.ok(videoService.getAllVideos(user));
    }
}
