package com.quickerfix.service;

import com.quickerfix.config.FileStorageConfig;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;
    private final List<String> allowedExtensions = Arrays.asList("jpeg", "jpg", "png", "gif", "webp");

    public FileStorageService(FileStorageConfig fileStorageConfig) {
        this.fileStorageLocation = Paths.get(fileStorageConfig.getUploadDir())
                .toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeFile(MultipartFile file, String subDirectory) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store an empty file.");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "");
        String extension = "";
        
        if (originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        }

        if (!allowedExtensions.contains(extension)) {
            throw new IllegalArgumentException("Invalid file type. Only image files (jpeg, jpg, png, gif, webp) are accepted.");
        }

        String newFilename = UUID.randomUUID().toString() + "." + extension;

        try {
            Path targetLocation = this.fileStorageLocation;
            if (StringUtils.hasText(subDirectory)) {
                targetLocation = this.fileStorageLocation.resolve(subDirectory);
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
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            throw new RuntimeException("Could not delete file at " + fileUrl, ex);
        }
    }
}
