package com.quickerfix.service;

import com.quickerfix.config.FileStorageConfig;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024;
    private final Path fileStorageLocation;

    public FileStorageService(FileStorageConfig fileStorageConfig) {
        this.fileStorageLocation = fileStorageConfig.getUploadPath();
    }

    public String storeFile(MultipartFile file, String subDirectory) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store an empty file.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Image must be 10 MB or smaller.");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "");
        String extension = "";
        
        if (originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        }

        String expectedContentType = switch (extension) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            default -> null;
        };
        if (expectedContentType == null) {
            throw new IllegalArgumentException("Invalid file type. Only image files (jpeg, jpg, png, gif, webp) are accepted.");
        }
        if (!expectedContentType.equalsIgnoreCase(file.getContentType()) || !hasMatchingSignature(file, extension)) {
            throw new IllegalArgumentException("The uploaded file content does not match its image type.");
        }

        String newFilename = UUID.randomUUID().toString() + "." + extension;

        try {
            Path targetLocation = this.fileStorageLocation;
            if (StringUtils.hasText(subDirectory)) {
                targetLocation = this.fileStorageLocation.resolve(subDirectory).normalize();
                if (!targetLocation.startsWith(this.fileStorageLocation)) {
                    throw new IllegalArgumentException("Invalid upload path.");
                }
                Files.createDirectories(targetLocation);
            }
            
            Path filePath = targetLocation.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            if (StringUtils.hasText(subDirectory)) {
                return "/uploads/" + subDirectory + "/" + newFilename;
            }
            return "/uploads/" + newFilename;

        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + newFilename + ". Please try again!", ex);
        }
    }

    public void deleteFile(String fileUrl) {
        if (!StringUtils.hasText(fileUrl)) {
            return;
        }

        try {
            String relativePath = fileUrl.replace("/uploads/", "");
            Path filePath = this.fileStorageLocation.resolve(relativePath).normalize();
            if (!filePath.startsWith(this.fileStorageLocation)) {
                throw new IllegalArgumentException("Invalid stored file path.");
            }
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            throw new RuntimeException("Could not delete file at " + fileUrl, ex);
        }
    }

    private boolean hasMatchingSignature(MultipartFile file, String extension) {
        byte[] header = new byte[12];
        try (InputStream input = file.getInputStream()) {
            int length = input.read(header);
            if (length < 3) {
                return false;
            }
        } catch (IOException ex) {
            return false;
        }

        return switch (extension) {
            case "jpg", "jpeg" -> (header[0] & 0xff) == 0xff && (header[1] & 0xff) == 0xd8
                    && (header[2] & 0xff) == 0xff;
            case "png" -> (header[0] & 0xff) == 0x89 && header[1] == 'P' && header[2] == 'N'
                    && header[3] == 'G' && header[4] == 0x0d && header[5] == 0x0a
                    && header[6] == 0x1a && header[7] == 0x0a;
            case "gif" -> header[0] == 'G' && header[1] == 'I' && header[2] == 'F'
                    && header[3] == '8' && (header[4] == '7' || header[4] == '9') && header[5] == 'a';
            case "webp" -> header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F'
                    && header[8] == 'W' && header[9] == 'E' && header[10] == 'B' && header[11] == 'P';
            default -> false;
        };
    }
}
