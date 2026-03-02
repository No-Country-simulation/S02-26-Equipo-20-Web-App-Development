package com.nocountry.backend.controller;

import com.nocountry.backend.dto.video.InstructionsVideo;
import com.nocountry.backend.dto.video.JobState;
import com.nocountry.backend.model.User;
import com.nocountry.backend.service.IFreeVideoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.ResourceRegion;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/free")
@RequiredArgsConstructor
@Tag(
        name = "Free Video",
        description = "Operaciones para procesamiento, consulta y reproducción de videos para usuarios gratis"
)
public class FreeVideoController {

    private final IFreeVideoService freeVideoService;

    @PostMapping(value = "/process-video", consumes = "multipart/form-data")
    public ResponseEntity<JobState> uploadVideo(
            @RequestPart("file") MultipartFile file,
            @RequestPart("instructions") @Valid InstructionsVideo instructions
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(freeVideoService.processVideo(file, instructions));
    }

    @Operation(
            summary = "Consultar estado de procesamiento",
            description = "Obtiene el estado actual de un job de procesamiento de video perteneciente al usuario autenticado."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estado del job obtenido correctamente")
    })
    @GetMapping("/job-status/{idJob}")
    public ResponseEntity<JobState> getJobStatus(@PathVariable("idJob") @Min(1) Long idJob) {
        return ResponseEntity.ok(freeVideoService.getVideoState(idJob));
    }

    @Operation(
            summary = "Reproducir video procesado",
            description = "Permite realizar streaming del video procesado usando soporte de rangos HTTP (partial content)."
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
        return freeVideoService.streamVideo(videoOutputId, headers);
    }

    @Operation(
            summary = "Descargar video del usuario",
            description = "Permite al usuario descargar el video solicitado",
            security = @SecurityRequirement(name = "cookieAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Video descargado correctamente")
    })
    @GetMapping("/output/{videoOutputId}/download")
    public ResponseEntity<Resource> downloadVideo(
            @PathVariable Long videoOutputId
    ) throws IOException {
        return freeVideoService.downloadVideo(videoOutputId);
    }


}
