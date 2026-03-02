package com.nocountry.backend.service.impl;

import com.nocountry.backend.exception.FolderException;
import com.nocountry.backend.model.User;
import com.nocountry.backend.service.IVideoStorage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.unit.DataSize;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@Slf4j
public class VideoStorageImpl implements IVideoStorage {

    @Value("${video.storage.path}")
    private String storagePath;

    @Value("${video.storage.max-user-size}")
    private DataSize maxUserSize;

    @Override
    public String saveVideo(MultipartFile multipartFile, User user) {

        try {
            Path basePath = Paths.get(storagePath)
                    .toAbsolutePath()
                    .normalize();

            Path userFolder = basePath
                    .resolve(user.getUserFolderName())
                    .normalize();

            if (!Files.exists(userFolder)) {
                Files.createDirectories(userFolder);
            }

            long currentSize = getFolderSizeBytes(user);

            long newFileSize = multipartFile.getSize();

            long maxSizeBytes = maxUserSize.toBytes();

            if (currentSize + newFileSize > maxSizeBytes) {
                throw new FolderException(
                        "Has alcanzado el límite máximo de almacenamiento permitido ("
                                + maxUserSize.toGigabytes() + " GB)."
                );
            }

            String originalFilename = multipartFile.getOriginalFilename();
            String cleanFileName = originalFilename == null
                    ? "file"
                    : Paths.get(originalFilename).getFileName().toString();

            String fileName = UUID.randomUUID().toString().replace("-", "")
                    + "_" + cleanFileName;

            Path finalPath = userFolder
                    .resolve(fileName)
                    .normalize();

            if (!finalPath.startsWith(userFolder)) {
                throw new SecurityException("Ruta inválida detectada");
            }

            multipartFile.transferTo(finalPath.toFile());

            return finalPath.toString();

        } catch (IOException e) {
            log.error("Error al guardar el archivo: ", e);
            throw new FolderException("No se pudo escribir en el disco.");
        }
    }

    @Override
    public Long getFolderSizeBytes(User user) {

        Path basePath = Paths.get(storagePath)
                .toAbsolutePath()
                .normalize();

        Path userFolder = basePath
                .resolve(user.getUserFolderName())
                .normalize();

        if (!Files.exists(userFolder) || !Files.isDirectory(userFolder)) {
            return 0L;
        }

        try (var paths = Files.walk(userFolder)) {

            return paths
                    .filter(Files::isRegularFile)
                    .mapToLong(path -> {
                        try {
                            return Files.size(path);
                        } catch (IOException _) {
                            log.warn("No se pudo obtener tamaño de archivo: {}", path);
                            return 0L;
                        }
                    })
                    .sum();

        } catch (IOException e) {
            log.error("Error calculando tamaño del directorio del usuario", e);
            throw new FolderException("No se pudo calcular el tamaño del folder.");
        }
    }

    @Override
    public void deleteVideoIn(String path) {

        try {

            Path basePath = Paths.get(storagePath)
                    .toAbsolutePath()
                    .normalize();

            Path filePath = Paths.get(path)
                    .toAbsolutePath()
                    .normalize();

            if (!filePath.startsWith(basePath)) {
                throw new SecurityException("Ruta inválida fuera del storage permitido");
            }

            Files.deleteIfExists(filePath);

            log.info("Video original eliminado: {}", filePath);

        } catch (IOException e) {
            log.error("Error eliminando video original: {}", path, e);
            throw new FolderException("No se pudo eliminar el video original.");
        }
    }

    @Override
    public void deleteVideoOut(String path) {

        try {

            Path basePath = Paths.get(storagePath)
                    .toAbsolutePath()
                    .normalize();

            Path filePath = Paths.get(path)
                    .toAbsolutePath()
                    .normalize();

            if (!filePath.startsWith(basePath)) {
                throw new SecurityException("Ruta inválida fuera del storage permitido");
            }

            Files.deleteIfExists(filePath);

            log.info("Video procesado eliminado: {}", filePath);

            Path parentFolder = filePath.getParent();

            if (parentFolder != null
                    && Files.isDirectory(parentFolder)
                    && parentFolder.startsWith(basePath)) {

                try (var files = Files.list(parentFolder)) {

                    boolean isEmpty = files.findAny().isEmpty();

                    if (isEmpty) {
                        Files.delete(parentFolder);
                        log.info("Carpeta de resultados eliminada (vacía): {}", parentFolder);
                    }
                }
            }

        } catch (IOException e) {
            log.error("Error eliminando video procesado: {}", path, e);
            throw new FolderException("No se pudo eliminar el video procesado.");
        }
    }
}
