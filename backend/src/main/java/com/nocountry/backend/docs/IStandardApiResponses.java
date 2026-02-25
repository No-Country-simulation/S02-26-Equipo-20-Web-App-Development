package com.nocountry.backend.docs;


import com.nocountry.backend.exception.ApiResponseError;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.MediaType;

@ApiResponses(value = {
        @ApiResponse(
                responseCode = "401",
                description = "No autenticado o token inválido",
                content = @Content(
                        mediaType = MediaType.APPLICATION_JSON_VALUE,
                        schema = @Schema(implementation = ApiResponseError.class)
                )
        ),
        @ApiResponse(
                responseCode = "400",
                description = "Error en la request",
                content = @Content(
                        mediaType = MediaType.APPLICATION_JSON_VALUE,
                        schema = @Schema(implementation = ApiResponseError.class)
                )
        ),
        @ApiResponse(
                responseCode = "404",
                description = "Recurso no encontrado",
                content = @Content(
                        mediaType = MediaType.APPLICATION_JSON_VALUE,
                        schema = @Schema(implementation = ApiResponseError.class)
                )
        ),
        @ApiResponse(
                responseCode = "500",
                description = "Error interno del servidor",
                content = @Content(
                        mediaType = MediaType.APPLICATION_JSON_VALUE,
                        schema = @Schema(implementation = ApiResponseError.class)
                )
        )
})
public interface IStandardApiResponses {
}
